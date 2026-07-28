/**
 * E2E USDC: suscripción → vencer → keeper → verificar DB + Blink
 * Requisitos: ATA USDC del keeper + saldo USDC devnet (npm run keeper:usdc-balance)
 * Uso: npm run e2e:usdc
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

const REMITENTE_WA = process.env.E2E_REMITENTE_WA ?? "5215550002000";
const DESTINATARIO_WA = process.env.E2E_DESTINATARIO_WA ?? "5215550002001";
const DEST =
  process.env.E2E_DEST ?? Keypair.generate().publicKey.toBase58();
const MONTO_USDC = parseFloat(process.env.E2E_MONTO_USDC ?? "0.1");
const MONTO_RAW = BigInt(Math.round(MONTO_USDC * 1e6));

async function assertKeeperUsdcBalance(minRaw: bigint) {
  const keeper = getKeeperKeypair();
  const conn = getConnection();
  const ata = getAssociatedTokenAddressSync(USDC_MINT, keeper.publicKey);
  try {
    const acc = await getAccount(conn, ata);
    const bal = acc.amount;
    console.log(`   Keeper USDC ATA: ${ata.toBase58()}`);
    console.log(`   Balance: ${Number(bal) / 1e6} USDC`);
    if (bal < minRaw) {
      throw new Error(
        `Saldo USDC insuficiente (tiene ${Number(bal) / 1e6}, necesita ${Number(minRaw) / 1e6}). ` +
          `Ejecuta: npm run keeper:usdc-ata && fondea USDC devnet (ver keeper:usdc-balance).`
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("insuficiente")) throw e;
    throw new Error(
      `ATA USDC del keeper no existe o sin fondos. Ejecuta: npm run keeper:usdc-ata && npm run keeper:usdc-balance`
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
  console.log("=== E2E Remesa USDC ===");
  console.log("Destinatario wallet:", DEST);
  console.log("Monto:", MONTO_USDC, "USDC");

  console.log("\n0. Verificar keeper USDC...");
  await assertKeeperUsdcBalance(MONTO_RAW);

  console.log("\n1. Crear suscripción (DB + Anchor)...");
  const susc = await crearSuscripcion({
    remitente_wa: REMITENTE_WA,
    destinatario_wa: DESTINATARIO_WA,
    destinatario_solana: DEST,
    monto: MONTO_USDC,
    frecuencia: "diario",
    tipo_activo: "USDC",
  });
  console.log("   id:", susc.id);
  console.log("   tx registro:", susc.tx_signature);
  console.log(
    "   explorer:",
    `https://explorer.solana.com/tx/${susc.tx_signature}?cluster=devnet`
  );

  console.log("\n2. Esperar PDA on-chain...");
  const pda = await waitForUsdcPda(DEST);
  console.log("   PDA:", pda);

  console.log("\n3. Forzar vencimiento...");
  await pool.query(
    `UPDATE suscripciones SET proximo_pago = NOW() - interval '1 second' WHERE id = $1`,
    [susc.id]
  );

  console.log("\n4. Ejecutar keeper...");
  await ejecutarPagos();

  console.log("\n5. Verificar DB...");
  const row = await pool.query(`SELECT * FROM suscripciones WHERE id = $1`, [susc.id]);
  const updated = row.rows[0];
  if (!updated?.ultimo_pago) {
    throw new Error("ultimo_pago no actualizado");
  }
  console.log("   ultimo_pago:", updated.ultimo_pago);
  console.log("   proximo_pago:", updated.proximo_pago);

  const cb = await pool.query(
    `SELECT COUNT(*)::int AS n FROM cashback_transacciones WHERE suscripcion_id = $1`,
    [susc.id]
  );
  console.log("   cashback_transacciones:", cb.rows[0]?.n ?? 0);

  const ef = await pool.query(
    `SELECT kyc_status FROM beneficiarios_etherfuse WHERE destinatario_solana = $1`,
    [DEST]
  );
  const kyc = ef.rows[0]?.kyc_status as string | undefined;
  const base = process.env.BLINKS_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const blinkConvert = `${base}/api/actions/convertir-mxn?amount=${MONTO_USDC}`;
  const blinkOnboard = `${base}/api/actions/onboarding-mxn`;
  console.log("\n6. Blinks post-pago (esperados):");
  if (kyc === "verified") {
    console.log("   convertir-mxn:", blinkConvert);
  } else {
    console.log("   enviar-remesa-usdc + onboarding (KYC pendiente):", blinkOnboard);
    console.log("   Tip: POST /api/etherfuse/onboarding-url para flujo MXN completo");
  }

  const lista = await listarSuscripcionesPorUsuario(REMITENTE_WA);
  if (!lista.some((s: { id: string }) => s.id === susc.id)) {
    throw new Error("Suscripción no en listado por WA");
  }
  console.log("   listado API: OK");

  console.log("\n=== E2E USDC OK ===");
  await pool.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("\nE2E USDC falló:", e instanceof Error ? e.message : e);
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
