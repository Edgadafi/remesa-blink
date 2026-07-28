/**
 * Registro de usuarios piloto — validación corredor MX ↔ EE.UU.
 */
import pool from "../db/pool.js";

export type RolPiloto = "remitente" | "receptora" | "promotor" | "tiendita";
export type ZonaPiloto = "rural" | "semiurbana" | "urbana";
export type BancarizadoPiloto = "si" | "no" | "sub";
export type CanalConfianza =
  | "tiendita"
  | "comerciantes"
  | "pyme"
  | "asociacion_migrante"
  | "iglesia"
  | "asociacion"
  | "familia"
  | "microfinanzas"
  | "otro";

export interface NuevoUsuarioPiloto {
  whatsapp: string;
  rol: RolPiloto;
  nombre_opcional?: string;
  genero?: "femenino" | "masculino" | "otro" | "prefiero_no_decir";
  edad_rango?: string;
  estado?: string;
  municipio?: string;
  zona?: ZonaPiloto;
  bancarizado?: BancarizadoPiloto;
  canal_confianza?: CanalConfianza;
  canal_detalle?: string;
  referido_por_id?: string;
  wallet_solana?: string;
  notas?: string;
}

export async function registrarUsuarioPiloto(data: NuevoUsuarioPiloto) {
  const res = await pool.query(
    `INSERT INTO usuarios_piloto (
      whatsapp, rol, nombre_opcional, genero, edad_rango, estado, municipio,
      zona, bancarizado, canal_confianza, canal_detalle, referido_por_id,
      wallet_solana, notas
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *`,
    [
      data.whatsapp,
      data.rol,
      data.nombre_opcional ?? null,
      data.genero ?? null,
      data.edad_rango ?? null,
      data.estado ?? null,
      data.municipio ?? null,
      data.zona ?? null,
      data.bancarizado ?? null,
      data.canal_confianza ?? null,
      data.canal_detalle ?? null,
      data.referido_por_id ?? null,
      data.wallet_solana ?? null,
      data.notas ?? null,
    ]
  );
  return res.rows[0];
}

export async function listarUsuariosPiloto(filtros?: {
  rol?: RolPiloto;
  zona?: ZonaPiloto;
  bancarizado?: BancarizadoPiloto;
}) {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  let i = 1;

  if (filtros?.rol) {
    condiciones.push(`rol = $${i++}`);
    valores.push(filtros.rol);
  }
  if (filtros?.zona) {
    condiciones.push(`zona = $${i++}`);
    valores.push(filtros.zona);
  }
  if (filtros?.bancarizado) {
    condiciones.push(`bancarizado = $${i++}`);
    valores.push(filtros.bancarizado);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
  const res = await pool.query(
    `SELECT * FROM usuarios_piloto ${where} ORDER BY created_at DESC`,
    valores
  );
  return res.rows;
}

export async function obtenerUsuarioPilotoPorWa(whatsapp: string) {
  const res = await pool.query(
    `SELECT * FROM usuarios_piloto WHERE whatsapp = $1 ORDER BY created_at DESC LIMIT 1`,
    [whatsapp]
  );
  return res.rows[0] ?? null;
}
