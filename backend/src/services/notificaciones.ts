/**
 * Servicio de notificaciones - Envía mensajes al bot WhatsApp
 */
const BOT_INTERNAL_URL = process.env.BOT_INTERNAL_URL || "http://localhost:3002";
const BOT_INTERNAL_SECRET = process.env.BOT_INTERNAL_SECRET || "";

const SUPPORT_EMAIL = "remesatia@gmail.com";

/** Frontend público (Vercel) — interstitial propio; dial.to está caído. */
function getFrontendPublicUrl(): string {
  const raw =
    process.env.FRONTEND_PUBLIC_URL?.trim() ||
    process.env.CORS_ORIGIN?.split(",")[0]?.trim() ||
    "https://frontend-bay-phi-92.vercel.app";
  return raw.replace(/\/$/, "");
}

/**
 * Envuelve Action URL cruda en /blink?url= para que el celular no vea JSON.
 * Si ya es interstitial o no es http(s), se deja igual.
 */
export function toBlinkInterstitialUrl(actionUrl: string | null | undefined): string | null {
  if (!actionUrl) return null;
  if (actionUrl.includes("/blink?")) return actionUrl;
  if (!/^https?:\/\//i.test(actionUrl)) return actionUrl;
  const front = getFrontendPublicUrl();
  return `${front}/blink?url=${encodeURIComponent(actionUrl)}`;
}

export interface NotifPagoParams {
  destinatario_wa: string;
  remitente_wa: string;
  montoHuman: number;
  tipo_activo: string;
  blinkUrl: string | null;
  blinkOnboarding: string | null;
  /** Firma de la tx de pago (ejecutar_pago). */
  txSignature?: string | null;
  /** PDA del receipt (opcional, para demo). */
  receiptPda?: string | null;
}

function explorerTxUrl(txSignature: string): string {
  const cluster = (process.env.SOLANA_CLUSTER || "devnet").includes("mainnet")
    ? ""
    : "?cluster=devnet";
  return `https://explorer.solana.com/tx/${txSignature}${cluster}`;
}

function formatMontoDisplay(montoHuman: number, tipoActivo: string): string {
  if (tipoActivo === "USDC") {
    const n = Number.isInteger(montoHuman)
      ? String(montoHuman)
      : montoHuman.toFixed(2);
    return `$${n}`;
  }
  const n = montoHuman.toFixed(9).replace(/\.?0+$/, "");
  return `${n} SOL`;
}

/**
 * Copy post-pago receptora — UX confianza (docs/UX-TRUST-DESIGN.md).
 * Familia primero: pesos en cuenta, sin jerga DeFi.
 * Exportado para tests.
 */
export function buildMensajePago(params: NotifPagoParams): string {
  const { montoHuman, tipo_activo, blinkOnboarding, txSignature } = params;
  const blinkUrl = toBlinkInterstitialUrl(params.blinkUrl);
  const onboardingUrl = toBlinkInterstitialUrl(params.blinkOnboarding);
  const montoStr = formatMontoDisplay(montoHuman, tipo_activo);
  const listoParaPesos =
    tipo_activo === "USDC" &&
    !!params.blinkUrl &&
    params.blinkUrl.includes("convertir-mxn");

  const lines: string[] = [
    "✅ *Remesa de tu familia*",
    "",
    `Recibiste *${montoStr}* de quien te envía desde EE.UU.`,
  ];

  if (tipo_activo === "USDC") {
    if (listoParaPesos) {
      lines.push(
        "",
        "Ya puedes pasarlos a *pesos en tu cuenta bancaria* (llegada ~15 min)."
      );
    } else {
      lines.push(
        "",
        "El dinero ya está apartado para ti. Para recibirlo en *pesos* en tu banco, completa un registro corto (una sola vez)."
      );
    }
  }

  lines.push(
    "",
    "Es el mismo aviso que te manda tu familiar — no es spam.",
    ""
  );

  if (txSignature) {
    lines.push(
      "📄 *Comprobante del envío* (puedes abrir el enlace):",
      explorerTxUrl(txSignature),
      "Cualquiera puede verificar que el dinero quedó registrado.",
      ""
    );
  }

  if (blinkUrl) {
    if (listoParaPesos) {
      lines.push(
        "1️⃣ Toca el link de abajo",
        "2️⃣ Confirma el envío a tu cuenta (~2 min)",
        "3️⃣ Los *pesos* llegan a tu banco (~15 min)",
        "",
        `🔗 ${blinkUrl}`
      );
    } else {
      lines.push(
        "1️⃣ Toca el link de abajo",
        "2️⃣ Se abre una página segura (~2 min)",
        "3️⃣ Confirma en tu app",
        "",
        `🔗 ${blinkUrl}`
      );
    }
  }

  if (onboardingUrl) {
    lines.push(
      "",
      "📋 *Para recibir pesos en tu cuenta*",
      "Primero completa tu registro (INE + CLABE, una sola vez):",
      onboardingUrl
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
