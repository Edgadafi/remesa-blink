import "dotenv/config";
import pool from "../src/db/pool.js";

const p = await pool.query(
  `SELECT id, tx_signature, tipo_activo, monto, created_at FROM pagos ORDER BY created_at DESC LIMIT 5`
);
const b = await pool.query(
  `SELECT estado, left(url_blink, 80) as url FROM blinks_pendientes ORDER BY created_at DESC LIMIT 5`
);
console.log("pagos", p.rows);
console.log("blinks", b.rows);
await pool.end();
