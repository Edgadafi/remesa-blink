/**
 * Keeper: Cron job que ejecuta pagos recurrentes cada hora
 */
import "dotenv/config";
import cron from "node-cron";
import pool from "../db/pool.js";
import {
  listarSuscripcionesPendientesPago,
  actualizarSuscripcionDespuesPago,
} from "../services/suscripciones.js";
import { registrarCashbackPorRemesa } from "../services/cashback.js";
import { registrarPagoEnDb } from "../services/pagos.js";
import {
  ejecutarPagoOnChain,
  ejecutarPagoUsdcOnChain,
  getKeeperKeypair,
} from "../services/solana.js";
import { enviarNotificacionPago, enviarMensaje } from "../services/notificaciones.js";
import { PublicKey } from "@solana/web3.js";

const FRECUENCIA_SECONDS: Record<string, number> = {
  diario: 86400,
  semanal: 604800,
  mensual: 2592000,
};

function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

export async function ejecutarPagos() {
  console.log("[Keeper] Ejecutando pagos pendientes...");
  const pendientes = await listarSuscripcionesPendientesPago();
  if (!Array.isArray(pendientes)) {
    console.warn("[Keeper] listarSuscripcionesPendientesPago no devolvió un array");
    return;
  }

  for (const susc of pendientes) {
    try {
      const keeper = getKeeperKeypair();
      const destinatario = new PublicKey(susc.destinatario_solana);

      const pagoResult =
        susc.tipo_activo === "USDC"
          ? await ejecutarPagoUsdcOnChain(keeper.publicKey, destinatario)
          : await ejecutarPagoOnChain(keeper.publicKey, destinatario);

      const txSig = pagoResult.txSignature;

      const now = new Date();
      const intervalo = FRECUENCIA_SECONDS[susc.frecuencia] || 86400;
      const proximo = addSeconds(now, intervalo);

      await actualizarSuscripcionDespuesPago(susc.id, now, proximo);
      const montoHuman =
        susc.tipo_activo === "USDC"
          ? Number(susc.monto) / 1e6
          : Number(susc.monto) / 1e9;
      await registrarCashbackPorRemesa(susc.remitente_wa, montoHuman, susc.id);

      await registrarPagoEnDb({
        suscripcion_id: susc.id,
        receipt_pda: pagoResult.receiptPda,
        tx_signature: txSig,
        nonce: pagoResult.nonce,
        monto: Number(susc.monto),
        tipo_activo: (susc.tipo_activo || "SOL") as "SOL" | "USDC",
        usuario_remitente_solana: susc.usuario_remitente_solana ?? null,
        destinatario_solana: susc.destinatario_solana,
      });

      const baseUrl = process.env.BLINKS_BASE_URL || process.env.BASE_URL;
      let blinkUrl: string | null = null;
      let blinkOnboarding: string | null = null;
      if (baseUrl) {
        if (susc.tipo_activo === "USDC") {
          const efRow = await pool.query(
            `SELECT 1 FROM beneficiarios_etherfuse WHERE destinatario_solana = $1 AND kyc_status = 'verified'`,
            [susc.destinatario_solana]
          );
          if (efRow.rows[0]) {
            blinkUrl = `${baseUrl}/api/actions/convertir-mxn?amount=${montoHuman}`;
          } else {
            blinkUrl = `${baseUrl}/api/actions/enviar-remesa-usdc`;
            blinkOnboarding = `${baseUrl}/api/actions/onboarding-mxn`;
          }
        } else {
          blinkUrl = `${baseUrl}/api/actions/enviar-remesa?amount=${montoHuman}&destination=${susc.destinatario_solana}`;
        }
      }

      const logExtras = blinkOnboarding ? ` | Onboarding: ${blinkOnboarding}` : "";
      console.log(
        `[Keeper] Pago ${susc.tipo_activo || "SOL"} ejecutado: ${susc.id} -> ${txSig} | Receipt: ${pagoResult.receiptPda} | Blink: ${blinkUrl || "N/A"}${logExtras}`
      );

      await enviarNotificacionPago({
        destinatario_wa: susc.destinatario_wa,
        remitente_wa: susc.remitente_wa,
        montoHuman,
        tipo_activo: susc.tipo_activo || "SOL",
        blinkUrl,
        blinkOnboarding,
        txSignature: txSig,
        receiptPda: pagoResult.receiptPda,
      });

      if (blinkUrl && susc.destinatario_wa) {
        try {
          await pool.query(
            `INSERT INTO blinks_pendientes (
               suscripcion_id, tx_signature, destinatario_wa, monto, url_blink, estado
             ) VALUES ($1, $2, $3, $4, $5, 'enviado')`,
            [
              susc.id,
              txSig,
              susc.destinatario_wa,
              Number(susc.monto),
              blinkUrl,
            ]
          );
        } catch (blinkErr) {
          console.warn(
            "[Keeper] No se pudo persistir blinks_pendientes:",
            blinkErr instanceof Error ? blinkErr.message : blinkErr
          );
        }
      }

      // Aviso al remitente con el mismo comprobante (útil para demo / grabación)
      if (susc.remitente_wa) {
        const explorer = `https://explorer.solana.com/tx/${txSig}?cluster=devnet`;
        const montoStr =
          susc.tipo_activo === "USDC" ? `$${montoHuman}` : `${montoHuman} SOL`;
        await enviarMensaje(
          susc.remitente_wa,
          `✅ *Pago enviado a tu familia*\n\n` +
            `Monto: *${montoStr}*\n\n` +
            `📄 *Comprobante del envío* (puedes abrir el enlace):\n${explorer}\n` +
            `Cualquiera puede verificar que el dinero quedó registrado.`
        );
      }
    } catch (err) {
      console.error(`[Keeper] Error en suscripcion ${susc.id}:`, err);
    }
  }
}

/** Solo arranca el cron cuando se ejecuta `npm run keeper` (no en imports de run-once/smoke). */
const isCronProcess =
  typeof process.argv[1] === "string" &&
  (process.argv[1].includes("keeper/cron") || process.argv[1].endsWith("cron.ts"));

if (isCronProcess) {
  const intervalMin = parseInt(process.env.KEEPER_INTERVAL_MINUTES || "60", 10) || 60;
  const cronExpr =
    intervalMin >= 60 ? "0 * * * *" : `*/${Math.max(1, intervalMin)} * * * *`;

  cron.schedule(cronExpr, ejecutarPagos);

  console.log(`[Keeper] Iniciado. Ejecutará pagos cada ${intervalMin} minuto(s).`);
  ejecutarPagos().catch(console.error);

  process.on("SIGINT", () => process.exit(0));
}
