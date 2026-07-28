/**
 * Servicio de notificaciones - Envía mensajes al bot WhatsApp
 */
const BOT_INTERNAL_URL = process.env.BOT_INTERNAL_URL || "http://localhost:3002";
const BOT_INTERNAL_SECRET = process.env.BOT_INTERNAL_SECRET || "";

const SUPPORT_EMAIL = "remesatia@gmail.com";

export interface NotifPagoParams {
  destinatario_wa: string;
  remitente_wa: string;
  montoHuman: number;
  tipo_activo: string;
  blinkUrl: string | null;
  blinkOnboarding: string | null;
}

function formatMontoDisplay(montoHuman: number, tipoActivo: string): string {
  if (tipoActivo === "USDC") {
    const n = Number.isInteger(montoHuman)
      ? String(montoHuman)
      : montoHuman.toFixed(2);
    return `$${n} USDC`;
  }
  const n = montoHuman.toFixed(9).replace(/\.?0+$/, "");
  return `${n} SOL`;
}

/**
 * Copy post-pago receptora — UX confianza (docs/UX-TRUST-DESIGN.md).
 * Exportado para tests.
 */
export function buildMensajePago(params: NotifPagoParams): string {
  const { montoHuman, tipo_activo, blinkUrl, blinkOnboarding } = params;
  const montoStr = formatMontoDisplay(montoHuman, tipo_activo);

  const lines: string[] = [
    "✅ *Remesa de tu familia*",
    "",
    `Recibiste *${montoStr}* de quien te envía desde EE.UU.`,
  ];

  if (tipo_activo === "USDC") {
    lines.push(
      "",
      "_Dólares digitales — puedes verlos o convertirlos a pesos con el link._"
    );
  }

  lines.push(
    "",
    "Es el mismo aviso que te manda tu familiar — no es spam.",
    ""
  );

  if (blinkUrl) {
    lines.push(
      "1️⃣ Toca el link de abajo",
      "2️⃣ Se abre una página segura (~2 min)",
      "3️⃣ Confirma en tu app de wallet (Phantom u otra)",
      "",
      `🔗 ${blinkUrl}`
    );
  }

  if (blinkOnboarding) {
    lines.push(
      "",
      "📋 *Para recibir pesos en tu cuenta (SPEI)*",
      "Primero completa tu registro (una sola vez):",
      blinkOnboarding
    );
  }

  lines.push(
    "",
    "¿Dudas? Responde *AYUDA* o pregunta en la tiendita de confianza.",
    "",
    `_Si el link no abre, escríbenos a ${SUPPORT_EMAIL} con tu número._`
  );

  return lines.join("\n");
}

export async function enviarMensaje(to: string, text: string): Promise<void> {
  if (!BOT_INTERNAL_URL || !to) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (BOT_INTERNAL_SECRET) {
    headers["Authorization"] = `Bearer ${BOT_INTERNAL_SECRET}`;
  }

  try {
    const res = await fetch(`${BOT_INTERNAL_URL}/internal/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({ to, text }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[Notif] Error enviando:", res.status, err);
    }
  } catch (err) {
    console.error("[Notif] Error conectando con bot:", err instanceof Error ? err.message : err);
  }
}

export async function enviarNotificacionPago(params: NotifPagoParams): Promise<void> {
  if (!BOT_INTERNAL_URL) return;

  const mensaje = buildMensajePago(params);
  const to = params.destinatario_wa;
  if (!to) return;

  await enviarMensaje(to, mensaje);
}
