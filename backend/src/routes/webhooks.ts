/**
 * Webhooks - Etherfuse, etc.
 */
import { Router } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import canonicalize from "canonicalize";
import pool from "../db/pool.js";
import { enviarMensaje } from "../services/notificaciones.js";

const router = Router();
const WEBHOOK_SECRETS = (process.env.ETHERFUSE_WEBHOOK_SECRET || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function verifyEtherfuseSignature(body: object, signatureHeader: string): boolean {
  if (!WEBHOOK_SECRETS.length || !signatureHeader) return false;
  try {
    const canonicalized = canonicalize(body);
    if (!canonicalized) return false;
    for (const secret of WEBHOOK_SECRETS) {
      const key = Buffer.from(secret, "base64");
      const hmac = createHmac("sha256", key).update(canonicalized).digest("hex");
      const expected = `sha256=${hmac}`;
      if (expected.length !== signatureHeader.length) continue;
      if (timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

router.post("/etherfuse", async (req, res) => {
  const signature = req.headers["x-signature"] as string | undefined;
  if (!verifyEtherfuseSignature(req.body, signature || "")) {
    return res.status(401).send("Invalid signature");
  }

  const eventType = req.body.eventType || req.body.event_type;
  const payload = req.body.payload || req.body;

  try {
    if (eventType === "order_updated") {
      const status = payload?.status || payload?.orderStatus;
      if (status === "completed") {
        const orderId = payload?.orderId || payload?.order_id;
        const customerId = payload?.customerId || payload?.customer_id;
        console.log("[Webhook] Order completed:", orderId);
        if (customerId) {
          await pool.query(
            `UPDATE beneficiarios_etherfuse
             SET last_order_status = 'completed',
                 last_order_id = COALESCE($2::uuid, last_order_id),
                 updated_at = NOW()
             WHERE etherfuse_customer_id = $1`,
            [customerId, orderId || null]
          );
          const row = await pool.query(
            `SELECT destinatario_wa
             FROM beneficiarios_etherfuse WHERE etherfuse_customer_id = $1`,
            [customerId]
          );
          const wa = row.rows[0]?.destinatario_wa;
          if (wa) {
            await enviarMensaje(
              wa,
              "✅ *Tus pesos ya llegaron*\n\n" +
                "Revisa tu app del banco — el dinero de tu familia ya está en tu cuenta.\n\n" +
                "_Si no los ves en ~15 min, responde AYUDA._"
            );
            await pool.query(
              `UPDATE blinks_pendientes
               SET estado = 'reclamado'
               WHERE estado IN ('pendiente', 'enviado')
                 AND url_blink LIKE '%convertir-mxn%'
                 AND destinatario_wa = $1`,
              [wa]
            );
          }
        }
      }
    }

    if (eventType === "customer_updated" || eventType === "kyc_updated") {
      const customerId = payload?.customerId || payload?.customer_id;
      const status = payload?.customerStatus || payload?.customer_status || payload?.status;
      if (customerId && status) {
        const kycStatus =
          status === "customer_verified" || status === "kyc_approved" ? "verified" :
          status === "customer_failed" || status === "kyc_rejected" ? "failed" : "pending";
        await pool.query(
          `UPDATE beneficiarios_etherfuse SET kyc_status = $1, updated_at = NOW()
           WHERE etherfuse_customer_id = $2`,
          [kycStatus, customerId]
        );
      }
    }

    if (eventType === "bank_account_updated") {
      console.log("[Webhook] Bank account updated:", payload?.bankAccountId || payload?.bank_account_id);
    }
  } catch (err) {
    console.error("[Webhook] Error procesando:", err);
  }

  res.sendStatus(200);
});

export default router;
