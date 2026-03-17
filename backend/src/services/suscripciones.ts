/**
 * Servicio de suscripciones (DB + Anchor)
 */
import pool from "../db/pool.js";
import {
  registrarSuscripcionOnChain,
  getSuscripcionPda,
} from "./solana.js";

const FRECUENCIA_MAP: Record<string, number> = {
  diario: 86400,
  semanal: 604800,
  mensual: 2592000,
};

function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

export interface NuevaSuscripcion {
  remitente_wa: string;
  destinatario_wa: string;
  destinatario_solana: string; // Requerido: wallet que recibe
  monto: number; // en SOL
  frecuencia: "diario" | "semanal" | "mensual";
}

export async function crearSuscripcion(data: NuevaSuscripcion) {
  const now = new Date();
  const intervalo = FRECUENCIA_MAP[data.frecuencia] || 86400;
  const proximo_pago = addSeconds(now, intervalo);

  const destinatario = new PublicKey(data.destinatario_solana);

  // Registrar en blockchain (keeper = remitente)
  const montoLamports = BigInt(Math.round(data.monto * 1e9));
  const { getKeeperKeypair } = await import("./solana.js");
  const keeper = getKeeperKeypair();
  const txSig = await registrarSuscripcionOnChain(
    keeper.publicKey,
    destinatario,
    montoLamports,
    data.frecuencia
  );

  const [pda] = getSuscripcionPda(keeper.publicKey, destinatario);

  const result = await pool.query(
    `INSERT INTO suscripciones (
      remitente_wa, destinatario_wa, destinatario_solana, monto, frecuencia,
      proximo_pago, pda_address, activa
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    RETURNING *`,
    [
      data.remitente_wa,
      data.destinatario_wa,
      data.destinatario_solana,
      data.monto,
      data.frecuencia,
      proximo_pago,
      pda.toBase58(),
    ]
  );

  return { ...result.rows[0], tx_signature: txSig };
}

export async function listarSuscripcionesPorUsuario(wa: string) {
  const res = await pool.query(
    `SELECT * FROM suscripciones
     WHERE (remitente_wa = $1 OR destinatario_wa = $1) AND activa = true
     ORDER BY created_at DESC`,
    [wa]
  );
  return res.rows;
}

export async function listarSuscripcionesPendientesPago() {
  const res = await pool.query(
    `SELECT * FROM suscripciones
     WHERE activa = true AND proximo_pago <= NOW()
     ORDER BY proximo_pago ASC`
  );
  return res.rows;
}

export async function actualizarSuscripcionDespuesPago(
  id: string,
  ultimo_pago: Date,
  proximo_pago: Date
) {
  await pool.query(
    `UPDATE suscripciones
     SET ultimo_pago = $1, proximo_pago = $2, updated_at = NOW()
     WHERE id = $3`,
    [ultimo_pago, proximo_pago, id]
  );
}

export async function cancelarSuscripcion(id: string) {
  await pool.query(
    `UPDATE suscripciones SET activa = false, updated_at = NOW() WHERE id = $1`,
    [id]
  );
}
