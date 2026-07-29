/**
 * Diagnose Etherfuse 403 / auth — does not print full API key.
 */
import "dotenv/config";
import pool from "../src/db/pool.js";

async function main() {
  const base = process.env.ETHERFUSE_API_URL || "";
  const key = process.env.ETHERFUSE_API_KEY || "";
  console.log("url", base);
  console.log("key_prefix", key.slice(0, 12), "len", key.length);
  console.log("key_has_bearer", /^Bearer\s/i.test(key));
  console.log("key_format_ok", /^api_(sand|prod):/.test(key));

  // Ping a ramp path lightly
  try {
    const r = await fetch(`${base}/ramp`, {
      headers: { Authorization: key, Accept: "application/json" },
    });
    console.log("GET /ramp", r.status, (await r.text()).slice(0, 200));
  } catch (e) {
    console.log("fetch_err", e instanceof Error ? e.message : e);
  }

  const rows = await pool.query(
    `SELECT destinatario_solana, etherfuse_customer_id, etherfuse_bank_account_id, kyc_status
     FROM beneficiarios_etherfuse
     WHERE destinatario_solana = $1`,
    ["5HopANGJo1yjUx8o6RCdt2CCNXqYep23r4fUb2XKtQ5x"]
  );
  console.log("beneficiario", rows.rows[0] || null);

  if (rows.rows[0]) {
    const { etherfuse_customer_id } = rows.rows[0];
    try {
      const r = await fetch(
        `${base}/ramp/customer/${etherfuse_customer_id}/bank-accounts`,
        { headers: { Authorization: key } }
      );
      console.log(
        "GET bank-accounts",
        r.status,
        (await r.text()).slice(0, 300)
      );
    } catch (e) {
      console.log("bank_err", e instanceof Error ? e.message : e);
    }
  }
  await pool.end();
}

main();
