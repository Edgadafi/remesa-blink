/**
 * Registro de pagos (mirror off-chain del historial composable)
 */
import pool from "../db/pool.js";

export interface RegistrarPagoParams {
  suscripcion_id: string;
  receipt_pda: string;
  tx_signature: string;
  nonce: number;
  monto: number;
  tipo_activo: "SOL" | "USDC";
  usuario_remitente_solana?: string | null;
  destinatario_solana: string;
}

export async function registrarPagoEnDb(params: RegistrarPagoParams): Promise<{ id: string }> {
  const res = await pool.query(
    `INSERT INTO pagos (
      suscripcion_id, receipt_pda, tx_signature, nonce, monto, tipo_activo,
      usuario_remitente_solana, destinatario_solana
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id`,
    [
      params.suscripcion_id,
      params.receipt_pda,
      params.tx_signature,
      params.nonce,
      params.monto,
      params.tipo_activo,
      params.usuario_remitente_solana ?? null,
      params.destinatario_solana,
    ]
  );
  return { id: res.rows[0].id as string };
}

export async function listarPagosPorSuscripcion(suscripcionId: string) {
  const res = await pool.query(
    `SELECT * FROM pagos WHERE suscripcion_id = $1 ORDER BY created_at DESC`,
    [suscripcionId]
  );
  return res.rows;
}

export async function listarPagosPorWallet(wallet: string) {
  const res = await pool.query(
    `SELECT * FROM pagos
     WHERE usuario_remitente_solana = $1 OR destinatario_solana = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [wallet]
  );
  return res.rows;
}

/** Historial de pagos (mirror) para un WhatsApp — mini-índice Demo Day. */
export async function listarPagosPorWa(wa: string, limit = 20) {
  const res = await pool.query(
    `SELECT
       p.id,
       p.suscripcion_id,
       p.receipt_pda,
       p.tx_signature,
       p.nonce,
       p.monto,
       p.tipo_activo,
       p.usuario_remitente_solana,
       p.destinatario_solana,
       p.created_at
     FROM pagos p
     INNER JOIN suscripciones s ON s.id = p.suscripcion_id
     WHERE s.remitente_wa = $1 OR s.destinatario_wa = $1
     ORDER BY p.created_at DESC
     LIMIT $2`,
    [wa, limit]
  );
  return res.rows;
}
