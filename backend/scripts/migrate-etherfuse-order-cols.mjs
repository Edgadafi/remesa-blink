import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(
    "ALTER TABLE beneficiarios_etherfuse ADD COLUMN IF NOT EXISTS last_order_id UUID"
  );
  await pool.query(
    "ALTER TABLE beneficiarios_etherfuse ADD COLUMN IF NOT EXISTS last_order_status VARCHAR(32)"
  );
  console.log("SCHEMA_OK");
} catch (e) {
  console.error("SCHEMA_ERR", e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  await pool.end();
}
