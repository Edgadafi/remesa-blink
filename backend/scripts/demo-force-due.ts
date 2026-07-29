/**
 * Demo Day: fuerza proximo_pago = NOW() para suscripciones USDC activas
 * (opcionalmente filtradas por WA) y deja listo keeper:run-once.
 *
 * Uso:
 *   npx tsx scripts/demo-force-due.ts
 *   npx tsx scripts/demo-force-due.ts 5215559607277
 */
import "dotenv/config";
import pool from "../src/db/pool.js";

async function main() {
  const wa = process.argv[2] || null;
  const res = wa
    ? await pool.query(
        `UPDATE suscripciones
         SET proximo_pago = NOW() - INTERVAL '1 minute', updated_at = NOW()
         WHERE activa = true AND tipo_activo = 'USDC'
           AND (remitente_wa = $1 OR destinatario_wa = $1)
         RETURNING id, remitente_wa, destinatario_wa, monto, destinatario_solana, proximo_pago`,
        [wa]
      )
    : await pool.query(
        `UPDATE suscripciones
         SET proximo_pago = NOW() - INTERVAL '1 minute', updated_at = NOW()
         WHERE activa = true AND tipo_activo = 'USDC'
         RETURNING id, remitente_wa, destinatario_wa, monto, destinatario_solana, proximo_pago`
      );

  console.log(`Due rows: ${res.rowCount}`);
  for (const r of res.rows) {
    console.log(r);
  }
  if (!res.rowCount) {
    console.log("No hay suscripciones USDC activas. Crea una con WA enviar primero.");
  } else {
    console.log("Siguiente: npm run keeper:run-once");
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
