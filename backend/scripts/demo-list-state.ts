import "dotenv/config";
import pool from "../src/db/pool.js";

const sus = await pool.query(
  `SELECT id, remitente_wa, destinatario_wa, tipo_activo, monto, destinatario_solana,
          proximo_pago, activa, created_at
   FROM suscripciones WHERE activa = true
   ORDER BY created_at DESC LIMIT 8`
);
const ben = await pool.query(
  `SELECT destinatario_solana, destinatario_wa, kyc_status FROM beneficiarios_etherfuse LIMIT 8`
);
console.log("suscripciones:", JSON.stringify(sus.rows, null, 2));
console.log("beneficiarios:", JSON.stringify(ben.rows, null, 2));
await pool.end();
