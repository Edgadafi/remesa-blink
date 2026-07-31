/**
 * Tickets de soporte (piloto WhatsApp → backend log).
 */
import pool from "../db/pool.js";

export type SoporteMotivo = "no_aviso" | "cambiar_envio" | "sin_codigo" | "otra";

export interface CrearTicketParams {
  usuario_wa: string;
  motivo: SoporteMotivo;
  detalle?: string | null;
  canal?: string;
}

export async function crearTicketSoporte(params: CrearTicketParams) {
  const res = await pool.query(
    `INSERT INTO soporte_tickets (usuario_wa, motivo, detalle, canal, estado)
     VALUES ($1, $2, $3, $4, 'abierto')
     RETURNING *`,
    [
      params.usuario_wa,
      params.motivo,
      params.detalle?.trim() || null,
      params.canal || "whatsapp",
    ]
  );
  return res.rows[0];
}

export async function listarTicketsSoporte(opts?: {
  estado?: string;
  limit?: number;
}) {
  const limit = Math.min(opts?.limit ?? 50, 200);
  if (opts?.estado) {
    const res = await pool.query(
      `SELECT * FROM soporte_tickets WHERE estado = $1
       ORDER BY created_at DESC LIMIT $2`,
      [opts.estado, limit]
    );
    return res.rows;
  }
  const res = await pool.query(
    `SELECT * FROM soporte_tickets ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return res.rows;
}

export async function actualizarEstadoTicket(
  id: string,
  estado: "abierto" | "en_curso" | "cerrado"
) {
  const res = await pool.query(
    `UPDATE soporte_tickets SET estado = $2, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, estado]
  );
  return res.rows[0] || null;
}
