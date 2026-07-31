/**
 * Club TIA — lealtad por volumen (piloto).
 * Docs: docs/PROGRAMA-LEALTAD-CLUB-TIA.md
 */
import pool from "../db/pool.js";

const GRACE_DAYS = 14;
const STREAK_BONUS = 5;
const STREAK_CAP_MONTH = 20;

export type NivelCodigo = "semilla" | "nopal" | "tunal" | "aguila" | "escudo";

export interface NivelRow {
  codigo: NivelCodigo;
  nombre: string;
  rank: number;
  envios_min: number;
  volumen_usd_min: number;
  frecuencia_30d_min: number;
  fee_mult: number;
  cashback_pct: number;
  cupo_recurrente_gratis: number;
}

export interface MiembroResumen {
  usuario_wa: string;
  nivel: NivelCodigo;
  nombre_nivel: string;
  puntos_90d: number;
  envios_90d: number;
  volumen_usd_90d: number;
  frecuencia_30d: number;
  fee_mult: number;
  cashback_pct: number;
  cupo_recurrente_gratis: number;
  siguiente: {
    codigo: string;
    nombre: string;
    envios_faltan: number;
    volumen_faltan: number;
  } | null;
  upgraded: boolean;
}

function solUsdRate(): number {
  const raw = process.env.SOL_USD_RATE;
  if (raw == null || raw === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function listarNiveles(): Promise<NivelRow[]> {
  const res = await pool.query(
    `SELECT codigo, nombre, rank, envios_min, volumen_usd_min, frecuencia_30d_min,
            fee_mult, cashback_pct, cupo_recurrente_gratis
     FROM lealtad_niveles ORDER BY rank ASC`
  );
  return res.rows.map(mapNivel);
}

function mapNivel(r: Record<string, unknown>): NivelRow {
  return {
    codigo: String(r.codigo) as NivelCodigo,
    nombre: String(r.nombre),
    rank: Number(r.rank),
    envios_min: Number(r.envios_min),
    volumen_usd_min: Number(r.volumen_usd_min),
    frecuencia_30d_min: Number(r.frecuencia_30d_min),
    fee_mult: Number(r.fee_mult),
    cashback_pct: Number(r.cashback_pct),
    cupo_recurrente_gratis: Number(r.cupo_recurrente_gratis),
  };
}

export function pickNivel(
  niveles: NivelRow[],
  envios: number,
  volumenUsd: number,
  freq30: number
): NivelRow {
  let best = niveles[0];
  for (const n of niveles) {
    const byEnvios = envios >= n.envios_min;
    const byVol = volumenUsd >= n.volumen_usd_min;
    const freqOk = freq30 >= n.frecuencia_30d_min;
    if ((byEnvios || byVol) && freqOk) {
      best = n;
    }
  }
  return best;
}

async function aggPagos(usuario_wa: string) {
  const rate = solUsdRate();
  const res = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '90 days')::int AS envios_90d,
       COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '30 days')::int AS frecuencia_30d,
       COALESCE(SUM(
         CASE
           WHEN p.created_at < NOW() - INTERVAL '90 days' THEN 0
           WHEN p.tipo_activo = 'USDC' THEN p.monto::numeric / 1000000
           ELSE (p.monto::numeric / 1000000000) * $2
         END
       ), 0) AS volumen_usd_90d
     FROM pagos p
     INNER JOIN suscripciones s ON s.id = p.suscripcion_id
     WHERE s.remitente_wa = $1
       AND p.tx_signature IS NOT NULL`,
    [usuario_wa, rate]
  );
  const row = res.rows[0] || {};
  return {
    envios_90d: Number(row.envios_90d || 0),
    frecuencia_30d: Number(row.frecuencia_30d || 0),
    volumen_usd_90d: Number(row.volumen_usd_90d || 0),
  };
}

/** Bonus streak: +5 pts por semana ISO con ≥1 envío en últimos 30d, cap 20. */
async function bonusStreakPts(usuario_wa: string): Promise<number> {
  const res = await pool.query(
    `SELECT COUNT(DISTINCT date_trunc('week', p.created_at))::int AS semanas
     FROM pagos p
     INNER JOIN suscripciones s ON s.id = p.suscripcion_id
     WHERE s.remitente_wa = $1
       AND p.created_at >= NOW() - INTERVAL '30 days'
       AND p.tx_signature IS NOT NULL`,
    [usuario_wa]
  );
  const semanas = Number(res.rows[0]?.semanas || 0);
  return Math.min(semanas * STREAK_BONUS, STREAK_CAP_MONTH);
}

export async function getCashbackPctForUsuario(usuario_wa: string): Promise<{
  nivel1: number;
  nivel2: number;
  fee_mult: number;
  nivel: string;
}> {
  const prog = await pool.query(
    `SELECT porcentaje_nivel1, porcentaje_nivel2 FROM cashback_programa LIMIT 1`
  );
  const fallback1 = Number(prog.rows[0]?.porcentaje_nivel1 ?? 1.0);
  const fallback2 = Number(prog.rows[0]?.porcentaje_nivel2 ?? 0.5);

  try {
    const m = await pool.query(
      `SELECT m.nivel, n.cashback_pct, n.fee_mult
       FROM lealtad_miembros m
       JOIN lealtad_niveles n ON n.codigo = m.nivel
       WHERE m.usuario_wa = $1`,
      [usuario_wa]
    );
    if (m.rows[0]) {
      return {
        nivel1: Number(m.rows[0].cashback_pct),
        nivel2: fallback2,
        fee_mult: Number(m.rows[0].fee_mult),
        nivel: String(m.rows[0].nivel),
      };
    }
  } catch {
    /* tablas lealtad aún no migradas */
  }

  return { nivel1: fallback1, nivel2: fallback2, fee_mult: 1, nivel: "semilla" };
}

export async function feeEfectivoBps(feeBaseBps: number, usuario_wa: string): Promise<number> {
  const { fee_mult } = await getCashbackPctForUsuario(usuario_wa);
  return Math.round(feeBaseBps * fee_mult);
}

export async function registrarEventoEnvio(params: {
  usuario_wa: string;
  pago_id: string | null;
  suscripcion_id: string;
  monto_usd: number;
}): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO lealtad_eventos (usuario_wa, pago_id, suscripcion_id, tipo, puntos, monto_usd)
       VALUES ($1, $2, $3, 'envio', $4, $4)`,
      [params.usuario_wa, params.pago_id, params.suscripcion_id, params.monto_usd]
    );
  } catch (err) {
    console.warn(
      "[Lealtad] No se pudo registrar evento:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function recalcularMiembro(usuario_wa: string): Promise<MiembroResumen | null> {
  let niveles: NivelRow[];
  try {
    niveles = await listarNiveles();
  } catch {
    return null;
  }
  if (niveles.length === 0) return null;

  const agg = await aggPagos(usuario_wa);
  const streak = await bonusStreakPts(usuario_wa);
  const puntos = agg.volumen_usd_90d + streak;
  let nextNivel = pickNivel(
    niveles,
    agg.envios_90d,
    agg.volumen_usd_90d,
    agg.frecuencia_30d
  );

  const prevRes = await pool.query(
    `SELECT nivel, grace_until, nivel_desde FROM lealtad_miembros WHERE usuario_wa = $1`,
    [usuario_wa]
  );
  const prevCodigo = (prevRes.rows[0]?.nivel as NivelCodigo) || "semilla";
  const prevNivel = niveles.find((n) => n.codigo === prevCodigo) || niveles[0];
  const graceUntil = prevRes.rows[0]?.grace_until
    ? new Date(prevRes.rows[0].grace_until)
    : null;

  let upgraded = false;
  if (nextNivel.rank < prevNivel.rank) {
    const inGrace = graceUntil && graceUntil.getTime() > Date.now();
    if (inGrace) {
      nextNivel = prevNivel;
    }
  } else if (nextNivel.rank > prevNivel.rank) {
    upgraded = true;
  }

  const grace =
    upgraded || !prevRes.rows[0]
      ? new Date(Date.now() + GRACE_DAYS * 86400000)
      : graceUntil;

  await pool.query(
    `INSERT INTO lealtad_miembros (
       usuario_wa, nivel, puntos_90d, envios_90d, volumen_usd_90d, frecuencia_30d,
       nivel_desde, grace_until, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, NOW())
     ON CONFLICT (usuario_wa) DO UPDATE SET
       nivel = EXCLUDED.nivel,
       puntos_90d = EXCLUDED.puntos_90d,
       envios_90d = EXCLUDED.envios_90d,
       volumen_usd_90d = EXCLUDED.volumen_usd_90d,
       frecuencia_30d = EXCLUDED.frecuencia_30d,
       nivel_desde = CASE
         WHEN lealtad_miembros.nivel IS DISTINCT FROM EXCLUDED.nivel THEN NOW()
         ELSE lealtad_miembros.nivel_desde
       END,
       grace_until = EXCLUDED.grace_until,
       updated_at = NOW()`,
    [
      usuario_wa,
      nextNivel.codigo,
      puntos,
      agg.envios_90d,
      agg.volumen_usd_90d,
      agg.frecuencia_30d,
      grace,
    ]
  );

  if (upgraded) {
    await pool.query(
      `INSERT INTO lealtad_eventos (usuario_wa, tipo, puntos, monto_usd, detalle)
       VALUES ($1, 'upgrade', 0, 0, $2::jsonb)`,
      [
        usuario_wa,
        JSON.stringify({ from: prevCodigo, to: nextNivel.codigo, nombre: nextNivel.nombre }),
      ]
    );
  }

  const siguiente = niveles.find((n) => n.rank === nextNivel.rank + 1) || null;

  return {
    usuario_wa,
    nivel: nextNivel.codigo,
    nombre_nivel: nextNivel.nombre,
    puntos_90d: puntos,
    envios_90d: agg.envios_90d,
    volumen_usd_90d: agg.volumen_usd_90d,
    frecuencia_30d: agg.frecuencia_30d,
    fee_mult: nextNivel.fee_mult,
    cashback_pct: nextNivel.cashback_pct,
    cupo_recurrente_gratis: nextNivel.cupo_recurrente_gratis,
    siguiente: siguiente
      ? {
          codigo: siguiente.codigo,
          nombre: siguiente.nombre,
          envios_faltan: Math.max(0, siguiente.envios_min - agg.envios_90d),
          volumen_faltan: Math.max(0, siguiente.volumen_usd_min - agg.volumen_usd_90d),
        }
      : null,
    upgraded,
  };
}

export async function obtenerResumenLealtad(usuario_wa: string): Promise<MiembroResumen | null> {
  try {
    const existing = await pool.query(
      `SELECT m.*, n.nombre, n.fee_mult, n.cashback_pct, n.cupo_recurrente_gratis, n.rank
       FROM lealtad_miembros m
       JOIN lealtad_niveles n ON n.codigo = m.nivel
       WHERE m.usuario_wa = $1`,
      [usuario_wa]
    );
    if (existing.rows[0]) {
      const r = existing.rows[0];
      const niveles = await listarNiveles();
      const rank = Number(r.rank);
      const siguiente = niveles.find((n) => n.rank === rank + 1) || null;
      const envios = Number(r.envios_90d);
      const vol = Number(r.volumen_usd_90d);
      return {
        usuario_wa,
        nivel: r.nivel as NivelCodigo,
        nombre_nivel: String(r.nombre),
        puntos_90d: Number(r.puntos_90d),
        envios_90d: envios,
        volumen_usd_90d: vol,
        frecuencia_30d: Number(r.frecuencia_30d),
        fee_mult: Number(r.fee_mult),
        cashback_pct: Number(r.cashback_pct),
        cupo_recurrente_gratis: Number(r.cupo_recurrente_gratis),
        siguiente: siguiente
          ? {
              codigo: siguiente.codigo,
              nombre: siguiente.nombre,
              envios_faltan: Math.max(0, siguiente.envios_min - envios),
              volumen_faltan: Math.max(0, siguiente.volumen_usd_min - vol),
            }
          : null,
        upgraded: false,
      };
    }
  } catch {
    return null;
  }
  return recalcularMiembro(usuario_wa);
}

export function buildMensajeUpgradeLealtad(resumen: MiembroResumen): string {
  const feePct = Math.round((1 - resumen.fee_mult) * 100);
  const vol = resumen.volumen_usd_90d.toFixed(0);
  const lines = [
    `¡Ey! Subiste a *${resumen.nombre_nivel}* en Club TIA.`,
    "",
    `En los últimos 90 días: ${resumen.envios_90d} envíos · ~$${vol}.`,
  ];
  if (feePct > 0) {
    lines.push(
      `Ahora tu comisión baja ${feePct}% y el cashback sube a ${resumen.cashback_pct}%.`
    );
  } else {
    lines.push(`Tu cashback de remesa es ${resumen.cashback_pct}%.`);
  }
  if (resumen.nivel === "escudo") {
    lines.push("", "Soporte prioritario activado. Gracias por confiar en Remesa TIA para lo de cada mes.");
  } else {
    lines.push("", "Escribe *recompensas* cuando quieras ver tu progreso.");
  }
  return lines.join("\n");
}

/** ¿Puede crear otra suscripción con fee_waived según cupo del nivel? */
export async function puedeWaiveFeeRecurrente(usuario_wa: string): Promise<boolean> {
  try {
    const m = await obtenerResumenLealtad(usuario_wa);
    if (!m || m.cupo_recurrente_gratis <= 0) return false;
    const used = await pool.query(
      `SELECT COUNT(*)::int AS n FROM suscripciones
       WHERE remitente_wa = $1 AND fee_waived = true AND activa = true`,
      [usuario_wa]
    );
    return Number(used.rows[0]?.n || 0) < m.cupo_recurrente_gratis;
  } catch {
    return false;
  }
}

/** Tras un pago confirmado: evento + recalculo + mensaje upgrade si aplica. */
export async function onPagoConfirmado(params: {
  usuario_wa: string;
  pago_id: string | null;
  suscripcion_id: string;
  monto_usd: number;
  tipo_activo: string;
}): Promise<MiembroResumen | null> {
  if (!params.usuario_wa) return null;
  const montoUsd =
    params.tipo_activo === "USDC"
      ? params.monto_usd
      : params.monto_usd * solUsdRate();

  await registrarEventoEnvio({
    usuario_wa: params.usuario_wa,
    pago_id: params.pago_id,
    suscripcion_id: params.suscripcion_id,
    monto_usd: montoUsd,
  });

  return recalcularMiembro(params.usuario_wa);
}
