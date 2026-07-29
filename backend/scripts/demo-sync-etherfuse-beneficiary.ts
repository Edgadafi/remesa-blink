/**
 * Re-sincroniza beneficiario con Etherfuse sandbox (IDs reales).
 *
 * Uso:
 *   npx tsx scripts/demo-sync-etherfuse-beneficiary.ts <wallet> [wa]
 *   npx tsx scripts/demo-sync-etherfuse-beneficiary.ts <wallet> [wa] --use-org-bank
 *
 * --use-org-bank: fuerza partner org + bank Demo Day (CLABE …0395).
 *   Útil si el hosted KYC del personal org aún no tiene bank activo.
 *   El wallet igual debe completar T&Cs (abre ONBOARDING_URL).
 */
import "dotenv/config";
import { randomUUID } from "crypto";
import pool from "../src/db/pool.js";
import {
  createOnboardingUrl,
  getCustomerBankAccounts,
  parseOrgFrom409Error,
  ETHERFUSE_DEMO_CUSTOMER_ID,
  ETHERFUSE_DEMO_BANK_ACCOUNT_ID,
} from "../src/services/etherfuse.js";

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
  const useOrgBank = flags.has("--use-org-bank");
  const wallet = args[0];
  const wa = args[1] || null;
  if (!wallet) {
    console.error(
      "Uso: npx tsx scripts/demo-sync-etherfuse-beneficiary.ts <wallet> [wa] [--use-org-bank]"
    );
    process.exit(1);
  }

  let customerId = randomUUID();
  let bankAccountId = randomUUID();
  let url: string | null = null;

  if (useOrgBank) {
    customerId = ETHERFUSE_DEMO_CUSTOMER_ID;
    bankAccountId = ETHERFUSE_DEMO_BANK_ACCOUNT_ID;
    console.log("Modo --use-org-bank:", { customerId, bankAccountId });
    const ui = {
      email:
        process.env.ETHERFUSE_DEMO_EMAIL ||
        `demo+${wallet.slice(0, 6)}@remesablink.com`,
      displayName: process.env.ETHERFUSE_DEMO_DISPLAY_NAME || "Remesa Demo",
    };
    try {
      url = await createOnboardingUrl(customerId, bankAccountId, wallet, ui);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        "onboarding-url con org bank falló (puede ser 'Client not linked'):",
        msg.slice(0, 300)
      );
      // Probar UUID frescos → 409 see org (personal org del wallet)
      try {
        url = await createOnboardingUrl(randomUUID(), randomUUID(), wallet, ui);
      } catch (err2) {
        const orgId = parseOrgFrom409Error(err2);
        if (orgId) {
          const banks = await getCustomerBankAccounts(orgId).catch(() => []);
          console.log("Wallet personal org:", orgId, "banks:", banks.length);
          // URL para T&Cs/KYC/CLABE en personal org (bank UUID fresco si no hay)
          const personalBank = banks[0]?.bankAccountId || randomUUID();
          url = await createOnboardingUrl(orgId, personalBank, wallet, ui);
          if (banks[0]) {
            customerId = orgId;
            bankAccountId = banks[0].bankAccountId;
          } else {
            console.warn(
              "Personal org sin bank activo. DB sigue en partner org+bank para quotes.",
              "Abre ONBOARDING_URL para T&Cs + CLABE."
            );
            customerId = ETHERFUSE_DEMO_CUSTOMER_ID;
            bankAccountId = ETHERFUSE_DEMO_BANK_ACCOUNT_ID;
          }
        }
      }
    }
  } else {
    try {
      url = await createOnboardingUrl(customerId, bankAccountId, wallet, {
        email:
          process.env.ETHERFUSE_DEMO_EMAIL ||
          `demo+${wallet.slice(0, 6)}@remesablink.com`,
        displayName: process.env.ETHERFUSE_DEMO_DISPLAY_NAME || "Remesa Demo",
      });
    } catch (err) {
      const orgId = parseOrgFrom409Error(err);
      if (!orgId) throw err;
      console.log("Wallet ya en Etherfuse, org:", orgId);
      customerId = orgId;
      const banks = await getCustomerBankAccounts(orgId);
      if (!banks[0]) {
        console.warn(
          "Sin bank accounts. Usa --use-org-bank o completa hosted KYC con bank UUID fresco."
        );
        bankAccountId = randomUUID();
      } else {
        bankAccountId = banks[0].bankAccountId;
      }
      url = await createOnboardingUrl(customerId, bankAccountId, wallet, {
        email:
          process.env.ETHERFUSE_DEMO_EMAIL ||
          `demo+${wallet.slice(0, 6)}@remesablink.com`,
        displayName: process.env.ETHERFUSE_DEMO_DISPLAY_NAME || "Remesa Demo",
      });
    }
  }

  let kyc: "verified" | "pending" = "pending";
  try {
    const banks = await getCustomerBankAccounts(customerId);
    if (banks.some((b) => b.bankAccountId === bankAccountId) || banks.length > 0) {
      if (banks[0] && !banks.some((b) => b.bankAccountId === bankAccountId)) {
        bankAccountId = banks[0].bankAccountId;
      }
      kyc = "verified";
    }
  } catch {
    /* pending until user finishes hosted KYC */
  }

  // Partner org bank siempre es usable en sandbox para Demo Day
  if (
    customerId === ETHERFUSE_DEMO_CUSTOMER_ID &&
    bankAccountId === ETHERFUSE_DEMO_BANK_ACCOUNT_ID
  ) {
    kyc = "verified";
  }

  const res = await pool.query(
    `INSERT INTO beneficiarios_etherfuse (
       destinatario_solana, destinatario_wa,
       etherfuse_customer_id, etherfuse_bank_account_id, kyc_status
     ) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (destinatario_solana) DO UPDATE SET
       etherfuse_customer_id = EXCLUDED.etherfuse_customer_id,
       etherfuse_bank_account_id = EXCLUDED.etherfuse_bank_account_id,
       destinatario_wa = COALESCE($2, beneficiarios_etherfuse.destinatario_wa),
       kyc_status = EXCLUDED.kyc_status,
       updated_at = NOW()
     RETURNING *`,
    [wallet, wa, customerId, bankAccountId, kyc]
  );

  console.log("DB:", {
    wallet: res.rows[0].destinatario_solana,
    customerId: res.rows[0].etherfuse_customer_id,
    bankId: res.rows[0].etherfuse_bank_account_id,
    kyc: res.rows[0].kyc_status,
  });
  if (url) console.log("ONBOARDING_URL=", url);
  if (kyc !== "verified" || !url) {
    console.log(
      "Si order falla con Terms and conditions: abre ONBOARDING_URL (sandbox KYC + T&Cs)."
    );
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
