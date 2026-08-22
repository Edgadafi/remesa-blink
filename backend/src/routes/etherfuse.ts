/**
 * Rutas Etherfuse - Onboarding y off-ramp
 */
import { Router } from "express";
import { randomUUID } from "crypto";
import pool from "../db/pool.js";
import {
  createOnboardingUrl,
  getCustomerBankAccounts,
  parseOrgFrom409Error,
  mapEtherfuseError,
  estimateOfframpMxn,
} from "../services/etherfuse.js";
import { z } from "zod";

const router = Router();

const onboardingSchema = z.object({
  destinatario_solana: z.string().min(32).max(44),
  destinatario_wa: z.string().min(1).optional(),
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(80).optional(),
});

/** Error para 409 ya onboardeado */
export class AlreadyOnboardedError extends Error {
  code = "ALREADY_ONBOARDED";
}

/** Lógica compartida: obtener URL presignada de onboarding */
export async function getOnboardingPresignedUrl(
  destinatario_solana: string,
  destinatario_wa?: string | null,
  userInfo?: { email: string; displayName: string }
): Promise<{ presignedUrl: string }> {
  let customerId: string;
  let bankAccountId: string;

  const existing = await pool.query(
    `SELECT etherfuse_customer_id, etherfuse_bank_account_id
     FROM beneficiarios_etherfuse
     WHERE destinatario_solana = $1`,
    [destinatario_solana]
  );

  if (existing.rows.length > 0) {
    customerId = existing.rows[0].etherfuse_customer_id;
    bankAccountId = existing.rows[0].etherfuse_bank_account_id;
  } else {
    customerId = randomUUID();
    bankAccountId = randomUUID();
  }

  let presignedUrl: string;
  try {
    presignedUrl = await createOnboardingUrl(
      customerId,
      bankAccountId,
      destinatario_solana,
      userInfo
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const alreadyLinked =
      msg.includes("409") &&
      (msg.includes("already added user") || msg.includes("see org:"));
    const notLinkedToOrg = /Client not linked to this organization/i.test(msg);

    if (alreadyLinked || notLinkedToOrg) {
      // Wallet ya existe en otra org, o DB tiene partner IDs a los que no está linked
      const orgFrom409 = parseOrgFrom409Error(err);
      try {
        if (orgFrom409) {
          const bankAccounts = await getCustomerBankAccounts(orgFrom409);
          const bankId = bankAccounts[0]?.bankAccountId || randomUUID();
          presignedUrl = await createOnboardingUrl(
            orgFrom409,
            bankId,
            destinatario_solana,
            userInfo
          );
          customerId = orgFrom409;
          bankAccountId = bankId;
        } else if (notLinkedToOrg) {
          // Reintentar con UUIDs frescos → 409 con see org, o URL nueva
          customerId = randomUUID();
          bankAccountId = randomUUID();
          try {
            presignedUrl = await createOnboardingUrl(
              customerId,
              bankAccountId,
              destinatario_solana,
              userInfo
            );
          } catch (retryErr) {
            const orgId = parseOrgFrom409Error(retryErr);
            if (!orgId) throw retryErr;
            const bankAccounts = await getCustomerBankAccounts(orgId);
            const bankId = bankAccounts[0]?.bankAccountId || randomUUID();
            presignedUrl = await createOnboardingUrl(
              orgId,
              bankId,
              destinatario_solana,
              userInfo
            );
            customerId = orgId;
            bankAccountId = bankId;
          }
        } else {
          throw new AlreadyOnboardedError(
            "El destinatario ya está registrado en Etherfuse."
          );
        }
      } catch (recoverErr) {
        if (recoverErr instanceof AlreadyOnboardedError) throw recoverErr;
        console.error("Error recuperando onboarding:", recoverErr);
        throw new AlreadyOnboardedError(
          "El wallet ya completó el onboarding. Si necesita actualizar datos o CLABE, contacte soporte."
        );
      }
    } else {
      throw err;
    }
  }

  await pool.query(
    `INSERT INTO beneficiarios_etherfuse (
      destinatario_solana, destinatario_wa,
      etherfuse_customer_id, etherfuse_bank_account_id, kyc_status
    ) VALUES ($1, $2, $3, $4, 'pending')
    ON CONFLICT (destinatario_solana) DO UPDATE SET
      etherfuse_customer_id = EXCLUDED.etherfuse_customer_id,
      etherfuse_bank_account_id = EXCLUDED.etherfuse_bank_account_id,
      destinatario_wa = COALESCE(EXCLUDED.destinatario_wa, beneficiarios_etherfuse.destinatario_wa),
      kyc_status = 'pending',
      updated_at = NOW()`,
    [destinatario_solana, destinatario_wa || null, customerId, bankAccountId]
  );

  return { presignedUrl };
}

/**
 * POST /api/etherfuse/onboarding-url
 * Genera URL presignada para KYC + CLABE
 */
router.post("/onboarding-url", async (req, res) => {
  try {
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "destinatario_solana requerido (wallet Solana)",
        details: parsed.error.flatten(),
      });
    }
    const { destinatario_solana, destinatario_wa, email, displayName } =
      parsed.data;
    // Always pass real defaults from service if client omits email —
    // never invent @….test aliases (Sumsub locks them read-only).
    const result = await getOnboardingPresignedUrl(
      destinatario_solana,
      destinatario_wa || null,
      {
        email: email || process.env.ETHERFUSE_ONBOARDING_EMAIL || "remesatia@gmail.com",
        displayName: displayName || process.env.ETHERFUSE_DEMO_DISPLAY_NAME || "Remesa Blink",
      }
    );
    res.json(result);
  } catch (err) {
    if (err instanceof AlreadyOnboardedError) {
      return res.status(409).json({
        error: "El destinatario ya está registrado en Etherfuse.",
        code: "ALREADY_ONBOARDED",
        hint: err.message,
      });
    }
    console.error("Error onboarding-url:", err);
    res.status(500).json({
      error: mapEtherfuseError(err),
    });
  }
});

/**
 * GET /api/etherfuse/quote-estimate?amount=50
 * Estimado USDC → MXN (Demo Day / bot confirmación). No es tipo de cambio garantizado.
 */
router.get("/quote-estimate", async (req, res) => {
  const amount = parseFloat(String(req.query.amount ?? ""));
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "amount positivo requerido (USDC)" });
  }
  const est = await estimateOfframpMxn(amount);
  if (!est) {
    return res.status(503).json({
      error: "Estimado no disponible (Etherfuse / API key)",
      estimate: null,
    });
  }
  res.json({
    usdc: amount,
    mxn_estimated: est.destinationMxn,
    exchange_rate: est.exchangeRate,
    disclaimer:
      "Estimado al retirar en app de dinero; puede variar al confirmar.",
  });
});

export default router;
