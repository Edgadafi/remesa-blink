/**
 * Demo Day sandbox: marca beneficiario Etherfuse como verified
 * cuando el webhook aún no está configurado.
 *
 * ⚠️ NO inventes UUIDs: Etherfuse responde 403 Forbidden con IDs falsos.
 * Prefiere: npx tsx scripts/demo-sync-etherfuse-beneficiary.ts <wallet> --use-org-bank
 *
 * Uso (solo si ya tienes IDs reales):
 *   npx tsx scripts/demo-mark-kyc-verified.ts <wallet> [wa] [customerId] [bankId]
 */
import "dotenv/config";
import pool from "../src/db/pool.js";
import {
  ETHERFUSE_DEMO_CUSTOMER_ID,
  ETHERFUSE_DEMO_BANK_ACCOUNT_ID,
} from "../src/services/etherfuse.js";

async function main() {
  const wallet = process.argv[2];
  const wa = process.argv[3] || null;
  const customerId = process.argv[4] || ETHERFUSE_DEMO_CUSTOMER_ID;
  const bankId = process.argv[5] || ETHERFUSE_DEMO_BANK_ACCOUNT_ID;
  if (!wallet || wallet.length < 32) {
    console.error(
      "Uso: npx tsx scripts/demo-mark-kyc-verified.ts <wallet> [wa] [customerId] [bankId]"
    );
    console.error(
      "Default customer/bank = partner sandbox org (real IDs). No uses UUID random."
    );
    process.exit(1);
  }

  const res = await pool.query(
    `INSERT INTO beneficiarios_etherfuse (
       destinatario_solana, destinatario_wa,
       etherfuse_customer_id, etherfuse_bank_account_id, kyc_status
     ) VALUES ($1, $2, $3, $4, 'verified')
     ON CONFLICT (destinatario_solana) DO UPDATE SET
       etherfuse_customer_id = EXCLUDED.etherfuse_customer_id,
       etherfuse_bank_account_id = EXCLUDED.etherfuse_bank_account_id,
       kyc_status = 'verified',
       destinatario_wa = COALESCE($2, beneficiarios_etherfuse.destinatario_wa),
       updated_at = NOW()
     RETURNING destinatario_solana, destinatario_wa, kyc_status,
               etherfuse_customer_id, etherfuse_bank_account_id`,
    [wallet, wa, customerId, bankId]
  );
  console.log("OK:", res.rows[0]);
  console.log(
    "Nota: bypass sandbox. Si falla order con Terms → abre onboarding-url. Ver docs/OFFRAMP-DEMO-DAY.md"
  );
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
