/**
 * Servicio de suscripciones (DB + Anchor)
 */
import { PublicKey } from "@solana/web3.js";
import pool from "../db/pool.js";
import {
  registrarSuscripcionOnChain,
  registrarSuscripcionUsdcOnChain,
  getSuscripcionPda,
  getSuscripcionUsdcPda,
  USDC_MINT,
  findExistingSuscripcionPda,
  fetchSuscripcionMontoOnChain,
  isAccountAlreadyInUseError,
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
  destinatario_solana: string;
  monto: number;
  frecuencia: "diario" | "semanal" | "mensual";
  tipo_activo?: "SOL" | "USDC";
  /** Alias familiar (ej. Mamá) — UX WA, no on-chain. */
  nombre_contacto?: string | null;
  /** Wallet del remitente real (composabilidad). Si omitido, usa keeper. */
  usuario_remitente_solana?: string;
}

async function upsertSuscripcionDb(params: {
  remitente_wa: string;
  destinatario_wa: string;
  destinatario_solana: string;
  montoDb: number;
  frecuencia: string;
  tipo_activo: string;
  proximo_pago: Date;
  pda: string;
  usuario_remitente_solana: string;
  txSig: string | null;
  reused: boolean;
  nombre_contacto?: string | null;
}) {
  const nombre =
    params.nombre_contacto?.trim().slice(0, 40) || null;

  const existing = await pool.query(
    `SELECT * FROM suscripciones
     WHERE pda_address = $1
     ORDER BY (activa = true) DESC, created_at DESC
     LIMIT 1`,
    [params.pda]
  );

  if (existing.rows[0]) {
    const row = existing.rows[0];
    const result = await pool.query(
      `UPDATE suscripciones SET
        activa = true,
        remitente_wa = $1,
        destinatario_wa = $2,
        destinatario_solana = $3,
        monto = $4,
        frecuencia = $5,
        tipo_activo = $6,
        proximo_pago = $7,
        usuario_remitente_solana = $8,
        tx_signature = COALESCE($9, tx_signature),
        nombre_contacto = COALESCE($10, nombre_contacto),
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        params.remitente_wa,
        params.destinatario_wa,
        params.destinatario_solana,
        params.montoDb,
        params.frecuencia,
        params.tipo_activo,
        params.proximo_pago,
        params.usuario_remitente_solana,
        params.txSig,
        nombre,
        row.id,
      ]
    );
    return {
      ...result.rows[0],
      tx_signature: params.txSig,
      reused: params.reused || Boolean(row.activa),
    };
  }

  let feeWaived = false;
  try {
    const { puedeWaiveFeeRecurrente } = await import("./lealtad.js");
    feeWaived = await puedeWaiveFeeRecurrente(params.remitente_wa);
  } catch {
    feeWaived = false;
  }

  const insertParams = [
    params.remitente_wa,
    params.destinatario_wa,
    params.destinatario_solana,
    params.montoDb,
    params.frecuencia,
    params.tipo_activo,
    params.proximo_pago,
    params.pda,
    params.usuario_remitente_solana,
    params.txSig,
    nombre,
  ];

  let result;
  try {
    result = await pool.query(
      `INSERT INTO suscripciones (
        remitente_wa, destinatario_wa, destinatario_solana, monto, frecuencia, tipo_activo,
        proximo_pago, pda_address, usuario_remitente_solana, tx_signature, nombre_contacto, activa, fee_waived
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12)
      RETURNING *`,
      [...insertParams, feeWaived]
    );
  } catch {
    result = await pool.query(
      `INSERT INTO suscripciones (
        remitente_wa, destinatario_wa, destinatario_solana, monto, frecuencia, tipo_activo,
        proximo_pago, pda_address, usuario_remitente_solana, tx_signature, nombre_contacto, activa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING *`,
      insertParams
    );
    feeWaived = false;
  }

  if (feeWaived) {
    try {
      await pool.query(
        `INSERT INTO lealtad_beneficios_aplicados (usuario_wa, tipo, ref_id, detalle)
         VALUES ($1, 'recurrente_gratis', $2, $3::jsonb)`,
        [
          params.remitente_wa,
          result.rows[0].id,
          JSON.stringify({ suscripcion_id: result.rows[0].id }),
        ]
      );
    } catch {
      /* opcional */
    }
  }

  return {
    ...result.rows[0],
    tx_signature: params.txSig,
    reused: params.reused,
  };
}

export async function crearSuscripcion(data: NuevaSuscripcion) {
  const now = new Date();
  const intervalo = FRECUENCIA_MAP[data.frecuencia] || 86400;
  const proximo_pago = addSeconds(now, intervalo);
  const tipo_activo = data.tipo_activo || "SOL";

  const destinatario = new PublicKey(data.destinatario_solana);
  const { getKeeperKeypair } = await import("./solana.js");
  const keeper = getKeeperKeypair();

  const usuarioRemitente = data.usuario_remitente_solana
    ? new PublicKey(data.usuario_remitente_solana)
    : keeper.publicKey;

  let txSig: string | null = null;
  let pda: PublicKey;
  let montoDb: number;
  let reused = false;

  if (tipo_activo === "USDC") {
    const montoRaw = BigInt(Math.round(data.monto * 1e6));
    [pda] = getSuscripcionUsdcPda(keeper.publicKey, destinatario, USDC_MINT);
    const existingPda = await findExistingSuscripcionPda(
      "USDC",
      keeper.publicKey,
      destinatario,
      USDC_MINT
    );

    if (existingPda) {
      reused = true;
      const onChainMonto = await fetchSuscripcionMontoOnChain(
        "USDC",
        keeper.publicKey,
        destinatario,
        USDC_MINT
      );
      montoDb = onChainMonto != null ? Number(onChainMonto) : Number(montoRaw);
    } else {
      try {
        txSig = await registrarSuscripcionUsdcOnChain(
          keeper.publicKey,
          destinatario,
          montoRaw,
          data.frecuencia,
          USDC_MINT,
          usuarioRemitente
        );
        montoDb = Number(montoRaw);
      } catch (err) {
        if (!isAccountAlreadyInUseError(err)) throw err;
        // Race: account created between getAccountInfo and init
        reused = true;
        const onChainMonto = await fetchSuscripcionMontoOnChain(
          "USDC",
          keeper.publicKey,
          destinatario,
          USDC_MINT
        );
        montoDb = onChainMonto != null ? Number(onChainMonto) : Number(montoRaw);
      }
    }
  } else {
    const montoLamports = BigInt(Math.round(data.monto * 1e9));
    [pda] = getSuscripcionPda(keeper.publicKey, destinatario);
    const existingPda = await findExistingSuscripcionPda(
      "SOL",
      keeper.publicKey,
      destinatario
    );

    if (existingPda) {
      reused = true;
      const onChainMonto = await fetchSuscripcionMontoOnChain(
        "SOL",
        keeper.publicKey,
        destinatario
      );
      montoDb =
        onChainMonto != null ? Number(onChainMonto) : Number(montoLamports);
    } else {
      try {
        txSig = await registrarSuscripcionOnChain(
          keeper.publicKey,
          destinatario,
          montoLamports,
          data.frecuencia,
          usuarioRemitente
        );
        montoDb = Number(montoLamports);
      } catch (err) {
        if (!isAccountAlreadyInUseError(err)) throw err;
        reused = true;
        const onChainMonto = await fetchSuscripcionMontoOnChain(
          "SOL",
          keeper.publicKey,
          destinatario
        );
        montoDb =
          onChainMonto != null ? Number(onChainMonto) : Number(montoLamports);
      }
    }
  }

  const row = await upsertSuscripcionDb({
    remitente_wa: data.remitente_wa,
    destinatario_wa: data.destinatario_wa,
    destinatario_solana: data.destinatario_solana,
    montoDb,
    frecuencia: data.frecuencia,
    tipo_activo,
    proximo_pago,
    pda: pda.toBase58(),
    usuario_remitente_solana: usuarioRemitente.toBase58(),
    txSig,
    reused,
    nombre_contacto: data.nombre_contacto,
  });

  const pedidoRaw =
    tipo_activo === "USDC"
      ? Number(BigInt(Math.round(data.monto * 1e6)))
      : Number(BigInt(Math.round(data.monto * 1e9)));

  return {
    ...row,
    monto_pedido: data.monto,
    /** true = PDA reused and pedido ≠ monto activo (on-chain/DB). */
    monto_no_actualizable: reused && Math.abs(pedidoRaw - Number(montoDb)) > 0,
  };
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
