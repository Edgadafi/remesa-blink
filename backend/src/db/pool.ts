/**
 * Pool de conexiones PostgreSQL
 */
import pg from "pg";

const { Pool } = pg;

function poolSsl(): pg.ConnectionConfig["ssl"] {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("supabase") || url.includes("sslmode=require")) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: poolSsl(),
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});

export default pool;
