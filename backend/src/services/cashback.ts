/**
 * Servicio de cashback y referidos (+ Club TIA % dinámico)
 */
import pool from "../db/pool.js";
import { randomBytes } from "crypto";
import { getCashbackPctForUsuario } from "./lealtad.js";

const CAP_CANJE_MENSUAL_USD = 15;

function generarCodigo(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function generarCodigoReferido(usuario_wa: string) {
  let codigo = generarCodigo();
  let exists = true;
  while (exists) {
    const res = await pool.query(
      "SELECT 1 FROM cashback_referidos WHERE codigo = $1",
      [codigo]
    );
    exists = res.rows.length > 0;
    if (exists) codigo = generarCodigo();
  }

  await pool.query(
    `INSERT INTO cashback_referidos (referidor_wa, referido_wa, codigo)
     VALUES ($1, $1, $2)
     ON CONFLICT (referidor_wa, referido_wa) DO UPDATE SET codigo = EXCLUDED.codigo`,
    [usuario_wa, codigo]
  );

  return { codigo };
}

export async function registrarReferido(
  referido_wa: string,
  codigo: string
) {
  const ref = await pool.query(
    "SELECT referidor_wa FROM cashback_referidos WHERE codigo = $1 AND referidor_wa = referido_wa",
    [codigo]
  );
  if (ref.rows.length === 0) {
    throw new Error("Código de referido no válido");
  }
  const referidor_wa = ref.rows[0].referidor_wa;
  if (referidor_wa === referido_wa) {
    throw new Error("No puedes referirte a ti mismo");
  }

  await pool.query(
    `INSERT INTO cashback_referidos (referidor_wa, referido_wa, codigo)
     VALUES ($1, $2, $3)
     ON CONFLICT (referidor_wa, referido_wa) DO NOTHING`,
    [referidor_wa, referido_wa, codigo]
  );

  return { referidor_wa };
}

export async function registrarCashbackPorRemesa(
  usuario_wa: string,
  montoRemesa: number,
  suscripcion_id: string
) {
  const { nivel1, nivel2 } = await getCashbackPctForUsuario(usuario_wa);
  const monto = (montoRemesa * nivel1) / 100;

  // Cap accrual mensual $15 (créditos remesa+referido del mes)
  const mes = await pool.query(
    `SELECT COALESCE(SUM(monto), 0) AS total
     FROM cashback_transacciones
     WHERE usuario_wa = $1
       AND tipo IN ('remesa', 'referido')
       AND created_at >= date_trunc('month', NOW())`,
    [usuario_wa]
  );
  const yaMes = parseFloat(mes.rows[0]?.total || "0");
  const room = Math.max(0, CAP_CANJE_MENSUAL_USD - yaMes);
  const montoCredito = Math.min(monto, room);

  if (montoCredito > 0) {
    await pool.query(
      `INSERT INTO cashback_transacciones (usuario_wa, monto, tipo, suscripcion_id, nivel)
       VALUES ($1, $2, 'remesa', $3, 1)`,
      [usuario_wa, montoCredito, suscripcion_id]
    );
    try {
      await pool.query(
        `INSERT INTO lealtad_beneficios_aplicados (usuario_wa, tipo, ref_id, detalle)
         VALUES ($1, 'cashback', $2, $3::jsonb)`,
        [
          usuario_wa,
          suscripcion_id,
          JSON.stringify({ pct: nivel1, monto: montoCredito, monto_remesa: montoRemesa }),
        ]
      );
    } catch {
      /* lealtad opcional */
    }
  }

  const ref = await pool.query(
    "SELECT referidor_wa FROM cashback_referidos WHERE referido_wa = $1 AND referidor_wa <> referido_wa LIMIT 1",
    [usuario_wa]
  );
  if (ref.rows.length > 0) {
    const monto2 = (montoRemesa * nivel2) / 100;
    await pool.query(
      `INSERT INTO cashback_transacciones (usuario_wa, monto, tipo, suscripcion_id, referido_wa, nivel)
       VALUES ($1, $2, 'referido', $3, $4, 2)`,
      [ref.rows[0].referidor_wa, monto2, suscripcion_id, usuario_wa]
    );
  }
}

export async function obtenerResumenCashback(usuario_wa: string) {
  const totalCreditos = await pool.query(
    `SELECT COALESCE(SUM(monto), 0) as total
     FROM cashback_transacciones
     WHERE usuario_wa = $1 AND tipo IN ('remesa', 'referido')`,
    [usuario_wa]
  );
  const totalCanjes = await pool.query(
    `SELECT COALESCE(SUM(ABS(monto)), 0) as total
     FROM cashback_transacciones
     WHERE usuario_wa = $1 AND tipo = 'canje'`,
    [usuario_wa]
  );
  const saldo = await pool.query(
    `SELECT COALESCE(SUM(monto), 0) as total FROM cashback_transacciones WHERE usuario_wa = $1`,
    [usuario_wa]
  );

  const transacciones = await pool.query(
    `SELECT * FROM cashback_transacciones WHERE usuario_wa = $1
     ORDER BY created_at DESC LIMIT 10`,
    [usuario_wa]
  );

  const codigoRes = await pool.query(
    "SELECT codigo FROM cashback_referidos WHERE referidor_wa = $1 AND referido_wa = $1 LIMIT 1",
    [usuario_wa]
  );

  const acumulado = parseFloat(totalCreditos.rows[0]?.total || "0");
  const reclamado = parseFloat(totalCanjes.rows[0]?.total || "0");
  const disponible = parseFloat(saldo.rows[0]?.total || "0");

  let lealtad = null;
  try {
    const { obtenerResumenLealtad } = await import("./lealtad.js");
    lealtad = await obtenerResumenLealtad(usuario_wa);
  } catch {
    lealtad = null;
  }

  return {
    total_acumulado: acumulado,
    reclamado,
    disponible: Math.max(0, disponible),
    ultimas_transacciones: transacciones.rows,
    codigo_referido: codigoRes.rows[0]?.codigo || null,
    lealtad,
  };
}

export async function canjearCashback(usuario_wa: string, monto: number) {
  if (monto <= 0) {
    throw new Error("Monto inválido");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [usuario_wa]);

    const saldoRes = await client.query(
      `SELECT COALESCE(SUM(monto), 0) as total FROM cashback_transacciones WHERE usuario_wa = $1`,
      [usuario_wa]
    );
    const disponible = parseFloat(saldoRes.rows[0]?.total || "0");
    if (monto > disponible) {
      throw new Error("Saldo insuficiente");
    }

    const canjeMes = await client.query(
      `SELECT COALESCE(SUM(ABS(monto)), 0) as total
       FROM cashback_transacciones
       WHERE usuario_wa = $1 AND tipo = 'canje'
         AND created_at >= date_trunc('month', NOW())`,
      [usuario_wa]
    );
    const yaCanjeado = parseFloat(canjeMes.rows[0]?.total || "0");
    if (yaCanjeado + monto > CAP_CANJE_MENSUAL_USD) {
      throw new Error(
        `Tope de canje mensual $${CAP_CANJE_MENSUAL_USD}. Ya canjeaste $${yaCanjeado.toFixed(2)} este mes.`
      );
    }

    await client.query(
      `INSERT INTO cashback_transacciones (usuario_wa, monto, tipo)
       VALUES ($1, $2, 'canje')`,
      [usuario_wa, -Math.abs(monto)]
    );

    try {
      await client.query(
        `INSERT INTO lealtad_beneficios_aplicados (usuario_wa, tipo, detalle)
         VALUES ($1, 'canje', $2::jsonb)`,
        [usuario_wa, JSON.stringify({ monto })]
      );
      await client.query(
        `INSERT INTO lealtad_eventos (usuario_wa, tipo, puntos, monto_usd, detalle)
         VALUES ($1, 'canje', 0, $2, $3::jsonb)`,
        [usuario_wa, monto, JSON.stringify({ monto })]
      );
    } catch {
      /* tablas lealtad opcionales */
    }

    await client.query("COMMIT");

    const nuevo = disponible - monto;
    return {
      exito: true,
      monto_canjeado: monto,
      disponible: nuevo,
      mensaje: `Canje registrado: $${monto.toFixed(2)}. Disponible: $${nuevo.toFixed(2)}. (Crédito off-chain piloto — transferencia wallet en Fase E.)`,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
