/**
 * Copy WhatsApp — lenguaje natural para remitente migrante (UX-TRUST / PERSONA MX-US).
 */

const SUPPORT_EMAIL = "remesatia@gmail.com";

export function formatMontoDisplay(monto: number, tipoActivo: "SOL" | "USDC"): string {
  if (tipoActivo === "USDC") {
    const n = Number.isInteger(monto) ? String(monto) : monto.toFixed(2);
    return `$${n}`;
  }
  const n = monto.toFixed(9).replace(/\.?0+$/, "");
  return `${n} SOL`;
}

export function labelFrecuencia(frecuencia: string): string {
  const f = frecuencia.toLowerCase();
  const map: Record<string, string> = {
    diario: "cada día",
    semanal: "cada semana",
    mensual: "cada mes",
  };
  return map[f] ?? `cada ${f}`;
}

export function buildAyuda(): string {
  return (
    "*Remesa Blink — envía a tu familia*\n\n" +
    "Habla como en el chat. Puedes escribir:\n\n" +
    "1️⃣ *enviar* — programar remesa a México\n" +
    "2️⃣ *mis envíos* — ver lo que ya tienes\n" +
    "3️⃣ *recompensas* — saldo y referidos\n" +
    "4️⃣ *soporte* — hablar con el equipo\n\n" +
    "Ejemplo: escribe *enviar* y te voy guiando paso a paso.\n" +
    "Sin filas en la tiendita: tu familia recibe aviso por WhatsApp."
  );
}

export function buildEnviarAskMonto(): string {
  return (
    "*Vamos a programar tu remesa*\n\n" +
    "¿Cuánto quieres mandar?\n" +
    "Escribe solo el número, por ejemplo: *300*\n\n" +
    "_(Por defecto es en dólares USDC. Si quieres SOL, escribe: 0.01 sol)_\n\n" +
    "Para cancelar: *cancelar*"
  );
}

export function buildEnviarAskFrecuencia(monto: number, tipo: "SOL" | "USDC"): string {
  return (
    `Perfecto: *${formatMontoDisplay(monto, tipo)}*\n\n` +
    "¿Cada cuánto lo mandamos?\n" +
    "Responde con una de estas:\n" +
    "• *cada mes*\n" +
    "• *cada semana*\n" +
    "• *cada día*"
  );
}

export function buildEnviarAskFamilia(): string {
  return (
    "¿WhatsApp de tu familia en México?\n\n" +
    "Escríbelo con lada, por ejemplo:\n" +
    "*5214431234567*\n\n" +
    "Ahí les llegará el aviso cuando salga el envío."
  );
}

export function buildEnviarAskWallet(): string {
  return (
    "Último dato (solo esta vez):\n\n" +
    "Pega la *dirección de destino* donde llega el dinero en Solana " +
    "(la copias desde Phantom u otra wallet de tu familia).\n\n" +
    "Se ve larga, tipo: `HN7c…`\n\n" +
    "Si no la tienes a la mano, escribe *soporte* y te ayudamos."
  );
}

export function buildRecurrentePending(params: {
  monto: number;
  tipo_activo: "SOL" | "USDC";
  frecuencia: string;
}): string {
  const montoStr = formatMontoDisplay(params.monto, params.tipo_activo);
  return (
    "⏳ *Programando tu remesa…*\n\n" +
    `*${montoStr}* · ${labelFrecuencia(params.frecuencia)} → tu familia en México\n\n` +
    "Un momento, por favor."
  );
}

export function buildSuscripcionConfirmada(params: {
  monto: number;
  tipo_activo: "SOL" | "USDC";
  frecuencia: string;
  destinatario_wa: string;
}): string {
  const montoStr = formatMontoDisplay(params.monto, params.tipo_activo);
  const freq = labelFrecuencia(params.frecuencia);
  return (
    "✅ *Remesa programada*\n\n" +
    `${freq.charAt(0).toUpperCase() + freq.slice(1)} enviaremos *${montoStr}* a tu familia.\n` +
    `Aviso al WhatsApp: +${params.destinatario_wa.replace(/\D/g, "")}\n\n` +
    "Ellos reciben mensaje cuando llega cada envío — tú no tienes que recordar.\n\n" +
    "Para verlo después escribe: *mis envíos*"
  );
}

export function buildSuscripcionError(apiError: string): string {
  return (
    "❌ *No se pudo programar la remesa*\n\n" +
    "Tu dinero *no se movió*. Revisa los datos o escribe *enviar* para intentar de nuevo.\n\n" +
    (apiError ? `_${apiError}_\n\n` : "") +
    `¿Necesitas ayuda? Escribe *soporte* o ${SUPPORT_EMAIL}`
  );
}

export function buildMontoInvalido(): string {
  return "No entendí el monto. Escribe un número mayor a cero, por ejemplo: *300*";
}

export function buildFrecuenciaInvalida(): string {
  return "No entendí. Responde *cada mes*, *cada semana* o *cada día*.";
}

export function buildWaInvalido(): string {
  return (
    "Ese número no se ve completo. Usa lada, por ejemplo *5214431234567* (solo dígitos)."
  );
}

export function buildWalletInvalida(): string {
  return (
    "Esa dirección no se ve válida. Cópiala completa desde la wallet (Phantom) y pégala aquí."
  );
}

export function buildMisRemesasVacio(): string {
  return (
    "Aún no tienes remesas programadas.\n\n" +
    "Escribe *enviar* y te guío en un minuto."
  );
}

export function buildMisRemesasLista(lines: string[]): string {
  return "*Tus envíos programados*\n\n" + lines.join("\n") + "\n\nEscribe *enviar* para agregar otra.";
}

export function buildSoporte(): string {
  return (
    "*Aquí estamos*\n\n" +
    `Escríbenos a ${SUPPORT_EMAIL}\n\n` +
    "O pregunta en la tiendita de confianza que te refirió.\n\n" +
    "Menú: escribe *ayuda*"
  );
}

export function buildCancelado(): string {
  return "Listo, cancelé. Cuando quieras, escribe *enviar* o *ayuda*.";
}

export function buildNoEntendi(): string {
  return (
    "No te entendí del todo.\n\n" +
    "Prueba con: *enviar*, *mis envíos*, *recompensas* o *ayuda*."
  );
}

/** Legacy slash help (alias técnico). */
export function buildRecurrenteUso(): string {
  return (
    "También puedes usar el formato corto (avanzado):\n\n" +
    "`/recurrente 300 USDC mensual 5214431234567 TU_WALLET`\n\n" +
    "O escribe solo *enviar* y te guío sin comandos."
  );
}
