/**
 * E2E SOL: crear suscripción → vencer → keeper → verificar DB
 * Uso: npm run e2e:sol
 */
import "dotenv/config";
import { Keypair, PublicKey } from "@solana/web3.js";
import { crearSuscripcion, listarSuscripcionesPorUsuario } from "./src/services/suscripciones.js";
import { ejecutarPagos } from "./src/keeper/cron.js";
import {
  getConnection,
  getSuscripcionPda,
  getKeeperKeypair,
} from "./src/services/solana.js";
import pool from "./src/db/pool.js";

const REMITENTE_WA = process.env.E2E_REMITENTE_WA ?? "5215550001000";
const DESTINATARIO_WA = process.env.E2E_DESTINATARIO_WA ?? "5215550001001";
const DEST =
  process.env.E2E_DEST ?? Keypair.generate().publicKey.toBase58();
const MONTO_SOL = parseFloat(process.env.E2E_MONTO_SOL ?? "0.001");

async function waitForSuscripcionPda(destinatario: string) {
  const conn = getConnection();
  const keeper = getKeeperKeypair();
  const dest = new PublicKey(destinatario);
  const [pda] = getSuscripcionPda(keeper.publicKey, dest);
  for (let i = 0; i < 45; i++) {
    const info = await conn.getAccountInfo(pda);
    if (info) return pda.toBase58();
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timeout esperando PDA on-chain");
}

async function main() {
  console.log("=== E2E Remesa SOL ===");
  console.log("Destinatario wallet:", DEST);
  console.log("Monto:", MONTO_SOL, "SOL");

  console.log("\n1. Crear suscripción (DB + Anchor)...");
  const susc = await crearSuscripcion({
    remitente_wa: REMITENTE_WA,
    destinatario_wa: DESTINATARIO_WA,
    destinatario_solana: DEST,
    monto: MONTO_SOL,
    frecuencia: "diario",
    tipo_activo: "SOL",
  });
  console.log("   id:", susc.id);
  console.log("   tx registro:", susc.tx_signature);
  console.log("   explorer:", `https://explorer.solana.com/tx/${susc.tx_signature}?cluster=devnet`);

  console.log("\n2. Esperar PDA on-chain...");
  const pda = await waitForSuscripcionPda(DEST);
  console.log("   PDA:", pda);

  console.log("\n3. Forzar vencimiento (proximo_pago <= now)...");
  await pool.query(
    `UPDATE suscripciones SET proximo_pago = NOW() - interval '1 second' WHERE id = $1`,
    [susc.id]
  );

  console.log("\n4. Ejecutar keeper...");
  await ejecutarPagos();

  console.log("\n5. Verificar estado en DB...");
  const row = await pool.query(`SELECT * FROM suscripciones WHERE id = $1`, [susc.id]);
  const updated = row.rows[0];
  if (!updated?.ultimo_pago) {
    throw new Error("ultimo_pago no actualizado — el keeper no procesó la suscripción");
  }
  console.log("   ultimo_pago:", updated.ultimo_pago);
  console.log("   proximo_pago:", updated.proximo_pago);

  const cb = await pool.query(
    `SELECT COUNT(*)::int AS n FROM cashback_transacciones WHERE suscripcion_id = $1`,
    [susc.id]
  );
  console.log("   cashback_transacciones:", cb.rows[0]?.n ?? 0);

  const lista = await listarSuscripcionesPorUsuario(REMITENTE_WA);
  const found = lista.some((s: { id: string }) => s.id === susc.id);
  if (!found) throw new Error("Suscripción no aparece en listado por WA");
  console.log("   listado API (remitente): OK");

  console.log("\n=== E2E SOL OK ===");
  console.log("Consulta en frontend: /mis-remesas con WA", REMITENTE_WA);
  await pool.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("\nE2E falló:", e instanceof Error ? e.message : e);
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
