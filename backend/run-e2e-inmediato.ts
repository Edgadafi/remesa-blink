/**
 * E2E envío inmediato: suscripción + primer_pago_inmediato → keeper sin forzar vencimiento.
 * Uso: npm run e2e:inmediato
 */
import "dotenv/config";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { crearSuscripcion, listarSuscripcionesPorUsuario } from "./src/services/suscripciones.js";
import { ejecutarPagos } from "./src/keeper/cron.js";
import {
  getConnection,
  getSuscripcionUsdcPda,
  getKeeperKeypair,
  USDC_MINT,
} from "./src/services/solana.js";
import pool from "./src/db/pool.js";

const REMITENTE_WA = process.env.E2E_REMITENTE_WA ?? "5215550002999";
const DESTINATARIO_WA = process.env.E2E_DESTINATARIO_WA ?? "5215550002998";
const DEST =
  process.env.E2E_DEST ?? Keypair.generate().publicKey.toBase58();
const MONTO_USDC = parseFloat(process.env.E2E_MONTO_USDC ?? "0.1");
const MONTO_RAW = BigInt(Math.round(MONTO_USDC * 1e6));

async function assertKeeperUsdcBalance(minRaw: bigint) {
  const keeper = getKeeperKeypair();
  const conn = getConnection();
  const ata = getAssociatedTokenAddressSync(USDC_MINT, keeper.publicKey);
  const acc = await getAccount(conn, ata);
  const bal = acc.amount;
  console.log(`   Keeper USDC ATA: ${ata.toBase58()}`);
  console.log(`   Balance: ${Number(bal) / 1e6} USDC`);
  if (bal < minRaw) {
    throw new Error(
      `Saldo USDC insuficiente (tiene ${Number(bal) / 1e6}, necesita ${Number(minRaw) / 1e6}).`
    );
  }
}

async function waitForUsdcPda(destinatario: string) {
  const conn = getConnection();
  const keeper = getKeeperKeypair();
  const dest = new PublicKey(destinatario);
  const [pda] = getSuscripcionUsdcPda(keeper.publicKey, dest, USDC_MINT);
  for (let i = 0; i < 45; i++) {
    const info = await conn.getAccountInfo(pda);
    if (info) return pda.toBase58();
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timeout esperando PDA USDC on-chain");
}

async function main() {
  console.log("=== E2E envío inmediato (primer_pago_inmediato) ===");
  console.log("Destinatario wallet:", DEST);
  console.log("Monto:", MONTO_USDC, "USDC");

  console.log("\n0. Verificar keeper USDC...");
  await assertKeeperUsdcBalance(MONTO_RAW);

  console.log("\n1. Crear suscripción inmediata (DB + Anchor)...");
  const before = Date.now();
  const susc = await crearSuscripcion({
    remitente_wa: REMITENTE_WA,
    destinatario_wa: DESTINATARIO_WA,
    destinatario_solana: DEST,
    monto: MONTO_USDC,
    frecuencia: "mensual",
    tipo_activo: "USDC",
    primer_pago_inmediato: true,
    nombre_contacto: "mi amor",
  });
  console.log("   id:", susc.id);
  console.log("   tx registro:", susc.tx_signature);

  const proximo = new Date(susc.proximo_pago).getTime();
  if (proximo > before) {
    throw new Error(
      `proximo_pago debería estar vencido para inmediato (got ${susc.proximo_pago})`
    );
  }
  console.log("   proximo_pago (vencido):", susc.proximo_pago);

  console.log("\n2. Esperar PDA on-chain...");
  const pda = await waitForUsdcPda(DEST);
  console.log("   PDA:", pda);

  console.log("\n3. Ejecutar keeper (sin UPDATE manual)...");
  await ejecutarPagos();

  console.log("\n4. Verificar DB...");
  const row = await pool.query(`SELECT * FROM suscripciones WHERE id = $1`, [susc.id]);
  const updated = row.rows[0];
  if (!updated?.ultimo_pago) {
    throw new Error("ultimo_pago no actualizado — keeper no pagó envío inmediato");
  }
  console.log("   ultimo_pago:", updated.ultimo_pago);
  console.log("   proximo_pago:", updated.proximo_pago);

  const lista = await listarSuscripcionesPorUsuario(REMITENTE_WA);
  if (!lista.some((s: { id: string }) => s.id === susc.id)) {
    throw new Error("Suscripción no en listado por WA");
  }
  console.log("   listado API: OK");

  console.log("\n=== E2E INMEDIATO OK ===");
  await pool.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("\nE2E inmediato falló:", e instanceof Error ? e.message : e);
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
