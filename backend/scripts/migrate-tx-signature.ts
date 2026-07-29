import "dotenv/config";
import pool from "../src/db/pool.js";

async function main() {
  await pool.query(
    "ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS tx_signature VARCHAR(88)"
  );
  console.log("OK: suscripciones.tx_signature");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
