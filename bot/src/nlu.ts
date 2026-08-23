/**
 * Intents en español coloquial — remitente migrante (docs/PERSONA-MX-US.md, UX-TRUST).
 */

export type Intent =
  | "ayuda"
  | "enviar_inmediato"
  | "programar"
  | "enviar"
  | "mis_envios"
  | "recompensas"
  | "codigo"
  | "canjear"
  | "soporte"
  | "piloto"
  | "cancelar"
  | "legacy"
  | "unknown";

export function normalizeText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** Detecta si sigue siendo comando slash legacy. */
export function isLegacySlash(text: string): boolean {
  return text.trim().startsWith("/");
}

/** Dígito 1–5 del menú principal (no confundir con monto en dólares). */
export function isMainMenuDigit(raw: string): boolean {
  const t = raw.trim();
  if (/^(?:[1-5]|[1-5]\uFE0F?\u20E3)$/.test(t)) return true;
  return /^(1️⃣|2️⃣|3️⃣|4️⃣|5️⃣)$/.test(t);
}

export function detectIntent(raw: string): Intent {
  const t = normalizeText(raw);
  if (!t) return "unknown";

  if (isLegacySlash(raw)) return "legacy";

  if (/^(cancelar|cancela|olvidalo|ya no|parar|salir|stop)\b/.test(t)) {
    return "cancelar";
  }

  if (
    /^(hola|holaa|holi|buenas|buen dia|buenos dias|buenas tardes|buenas noches|que onda|quiubas|quiubo|menu|ayuda|info|informacion|que puedo|opciones)\b/.test(
      t
    ) ||
    t === "start" ||
    t === "?"
  ) {
    return "ayuda";
  }

  if (
    /^(1|1️⃣)$/.test(t) ||
    /\b(enviar ahora|enviar ya|de inmediato|mandar ya|mandar ahora|envio ya|envío ya|hoy mismo|para hoy)\b/.test(t) ||
    (/\b(inmediato|ahora)\b/.test(t) &&
      /\b(enviar|manda|mandar|envio|remesa|giro)\b/.test(t))
  ) {
    return "enviar_inmediato";
  }

  if (
    /^(2|2️⃣)$/.test(t) ||
    /\b(programar remesa|programar envio|programar envío|remesa recurrente|cada mes|cada semana|cada quincena|cada dia|cada día)\b/.test(t) ||
    t === "programar"
  ) {
    return "programar";
  }

  if (
    /\b(mis envios|mis remesas|mis mandados|que tengo|ver envios|ver remesas|consulta|ya salio|ya llego|si ya salio)\b/.test(
      t
    ) ||
    t === "3"
  ) {
    return "mis_envios";
  }

  if (
    /\b(enviar|envia|enviale|envair|envar|manda|mandale|mandar|mandarle|envio|remesa|giro|girar|depositar|mandar dinero|quiero enviar|quiero mandar)\b/.test(
      t
    )
  ) {
    return "enviar";
  }

  if (
    /\b(recompensa|recompensas|cashback|saldo|puntos|bono)\b/.test(t) ||
    t === "4"
  ) {
    return "recompensas";
  }

  if (/\b(codigo|referido|invitar)\b/.test(t)) {
    return "codigo";
  }

  if (/\b(canjear|canje)\b/.test(t)) {
    return "canjear";
  }

  if (
    /^(soporte|soprte|soport|suporte)$/.test(t) ||
    /\b(ayuda humana|hablar con|asesor|necesito ayuda)\b/.test(t) ||
    /\b(no funciona|no me lleg\w*|sin aviso)\b/.test(t) ||
    t === "5"
  ) {
    return "soporte";
  }

  if (/\b(piloto|registrarme|unirme)\b/.test(t)) {
    return "piloto";
  }

  return "unknown";
}

/** Mensaje solo con monto (ej. "300", "$200") — inicia flujo enviar. */
export function looksLikeMontoOnly(raw: string): boolean {
  if (isMainMenuDigit(raw)) return false;
  const t = normalizeText(raw).replace(/[$,]/g, " ").trim();
  if (!/^\d+(?:\.\d+)?(?:\s*(?:dolares|dolar|usd|usdc|pesos))?$/i.test(t)) {
    return false;
  }
  const m = parseMonto(raw);
  return m != null && m > 0;
}

/** Usuario menciona quincena (hábito payday US→MX). */
export function mentionsQuincena(raw: string): boolean {
  const t = normalizeText(raw);
  return /\b(quincena|quincenal|cada quince|cada 15|cada quincena)\b/.test(t);
}

export function parseFrecuencia(
  raw: string
): "diario" | "semanal" | "quincenal" | "mensual" | null {
  const t = normalizeText(raw);
  if (/\b(quincena|quincenal|cada quincena|cada quince|cada 15|quincenalmente)\b/.test(t)) {
    return "quincenal";
  }
  if (/\b(dia|diario|cada dia|todos los dias|diario)\b/.test(t)) return "diario";
  if (/\b(semana|semanal|cada semana|semanalmente)\b/.test(t)) return "semanal";
  if (/\b(mes|mensual|cada mes|al mes|mensualmente)\b/.test(t)) return "mensual";
  return null;
}

export function parseMonto(raw: string): number | null {
  const t = normalizeText(raw).replace(/[$,]/g, " ");
  const m = t.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function parseTipoActivo(raw: string): "SOL" | "USDC" {
  const t = normalizeText(raw);
  // Requiere intención explícita (evitar que ejemplos del bot disparen SOL)
  if (/(^|\s)(\d+(?:\.\d+)?\s*)?sol(ana)?(\s|$)/.test(t) && !/\busdc\b/.test(t)) {
    if (/\bsol\b/.test(t)) return "SOL";
  }
  return "USDC";
}

/** Borrador extraído de un mensaje tipo “enviar 2000 a mi mujer”. */
export type EnviarParsed = {
  monto?: number;
  tipo_activo: "SOL" | "USDC";
  frecuencia?: "diario" | "semanal" | "quincenal" | "mensual";
  nombre_contacto?: string;
};

/**
 * One-shot: monto (+ moneda), nombre cariñoso y frecuencia si vienen en la misma frase.
 * Ej.: "enviar 2000 dólares a mi mujer", "manda 300 a mi amor cada mes".
 */
export function parseEnviarOneshoot(raw: string): EnviarParsed {
  const out: EnviarParsed = { tipo_activo: parseTipoActivo(raw) };
  if (isMainMenuDigit(raw)) return out;
  const monto = parseMontoEnviarPhrase(raw);
  if (monto != null) out.monto = monto;
  const freq = parseFrecuencia(raw);
  if (freq) out.frecuencia = freq;
  const nombre = parseNombreEnviarPhrase(raw);
  if (nombre) out.nombre_contacto = nombre;
  return out;
}

/** Primer monto de la frase de envío (ignora WA largos ≥10 dígitos). */
function parseMontoEnviarPhrase(raw: string): number | null {
  const t = normalizeText(raw).replace(/[$,]/g, " ");
  const re = /\b(\d+(?:\.\d+)?)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) {
    const token = m[1];
    // Evitar confundir ladas / WA (10+ dígitos enteros)
    if (/^\d{10,}$/.test(token)) continue;
    const n = parseFloat(token);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * Nombre tras "a" / "para" (mi mujer, mi amor, mi reina, Mamá…).
 * Conserva mayúsculas del mensaje original cuando se puede.
 */
export function parseNombreEnviarPhrase(raw: string): string | null {
  const t = normalizeText(raw);
  // Quitar verbo + monto/moneda para aislar "a X"
  const withoutVerb = t
    .replace(
      /^(?:quiero\s+)?(?:enviar|envia|enviale|manda|mandale|mandar|envio|remesa|programar|giro|girar)(?:\s+remesa|\s+dinero)?\s*/i,
      ""
    )
    .trim();

  const m =
    withoutVerb.match(
      /\b(?:a|para|pa|pa')\s+((?:mi\s+|la\s+)?[a-záéíóúñü]+(?:\s+[a-záéíóúñü]+){0,3})(?=\s+(?:cada|diario|semanal|mensual|quincena|al\s+mes|todos|en\s+pesos|dolares|usd|usdc|sol\b|\d)|$|[.,!?])/i
    ) ??
    withoutVerb.match(
      /\b(?:a|para)\s+((?:mi\s+)?[a-záéíóúñü]+(?:\s+[a-záéíóúñü]+){0,3})$/i
    );
  if (!m?.[1]) return null;

  let candidate = m[1].trim();
  // Recortar cola de moneda / ruido si quedó dentro
  candidate = candidate
    .replace(
      /\s+(?:dolares|dólares|usd|usdc|sol|pesos|en|de)$/i,
      ""
    )
    .trim();
  if (!candidate || /^(cada|diario|semanal|quincenal|mensual)$/i.test(candidate)) return null;

  // Recuperar casing del texto original (búsqueda case-insensitive)
  const orig = recoverOriginalCasing(raw, candidate) ?? candidate;
  return parseNombreContacto(orig);
}

function recoverOriginalCasing(raw: string, normalizedNeedle: string): string | null {
  const compact = raw.replace(/\s+/g, " ").trim();
  const esc = normalizedNeedle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const re = new RegExp(esc, "i");
  const hit = compact.match(re);
  return hit?.[0]?.trim() ?? null;
}

export function parseWhatsAppDigits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

/**
 * Alias familiar (multi-palabra OK: "mi amor", "mi corazón", "Mamá").
 * Max 40 chars (= VARCHAR(40)). Rechaza WA / wallet / vacío / solo dígitos.
 */
export function parseNombreContacto(raw: string): string | null {
  const s = raw.trim().replace(/\s+/g, " ");
  if (s.length < 1 || s.length > 40) return null;
  if (parseWhatsAppDigits(s)) return null;
  if (looksLikeSolanaAddress(s)) return null;
  if (/^[\d+\s().-]+$/.test(s)) return null;
  return s;
}

/**
 * Direcciones que parecen pubkey base58 pero NO son wallet de destinatario
 * (program ids / system programs). Incluye Remesa Blink PROGRAM_ID de /health.
 */
const BLOCKED_SOLANA_ADDRESSES = new Set(
  [
    process.env.PROGRAM_ID,
    // Remesa Blink (devnet default en backend/solana.ts)
    "B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2",
    "11111111111111111111111111111111",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    "ComputeBudget111111111111111111111111111111",
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    "SysvarRent111111111111111111111111111111111",
    "SysvarC1ock11111111111111111111111111111111",
  ].filter((x): x is string => typeof x === "string" && x.length >= 32)
);

/** true = es un program id / cuenta de sistema, no la wallet de la familia. */
export function isBlockedSolanaAddress(raw: string): boolean {
  return BLOCKED_SOLANA_ADDRESSES.has(raw.trim());
}

/**
 * Parece dirección Solana de usuario (base58 32–44).
 * Rechaza program ids conocidos (ej. el de /health).
 */
export function looksLikeSolanaAddress(raw: string): boolean {
  const s = raw.trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) return false;
  if (isBlockedSolanaAddress(s)) return false;
  return true;
}

/** Interpreta elección inmediato vs programar (menú o paso enviar_modo). */
export function parseModoEnvio(raw: string): "inmediato" | "programar" | null {
  const t = normalizeText(raw);
  if (!t) return null;
  if (
    /^(1|1️⃣|inmediato|ahora|ya|hoy)$/.test(t) ||
    /\b(enviar ahora|de inmediato|mandar ya|para hoy)\b/.test(t)
  ) {
    return "inmediato";
  }
  if (
    /^(2|2️⃣|programar|recurrente|programado)$/.test(t) ||
    /\b(programar|cada mes|cada semana|cada quincena|cada dia|cada día)\b/.test(t)
  ) {
    return "programar";
  }
  return null;
}

/** Motivos del menú *soporte* (1–4 o texto coloquial). */
export type SoporteMotivoParsed =
  | "no_aviso"
  | "cambiar_envio"
  | "sin_codigo"
  | "otra";

/**
 * Parsea elección del menú de soporte.
 * `null` = no se entiende (pedir de nuevo).
 * Texto libre ≥8 chars → `otra` (detalle lo manda el caller).
 */
export function parseSoporteMotivo(raw: string): SoporteMotivoParsed | null {
  const t = normalizeText(raw);
  if (!t) return null;

  if (/^(1|1️⃣|uno)$/.test(t) || /\b(no (me )?lleg|aviso|dinero|pago|familia no recib)/.test(t)) {
    return "no_aviso";
  }
  if (
    /^(2|2️⃣|dos)$/.test(t) ||
    /\b(cambiar|cancelar envio|cancelar remesa|otro monto|modificar)\b/.test(t)
  ) {
    return "cambiar_envio";
  }
  if (
    /^(3|3️⃣|tres)$/.test(t) ||
    /\b(no tengo (el )?codigo|sin codigo|codigo de (la )?app|cuenta de (su|la) app)\b/.test(t)
  ) {
    return "sin_codigo";
  }
  if (/^(4|4️⃣|cuatro)$/.test(t) || /\b(otra|otro|diferente)\b/.test(t)) {
    return "otra";
  }
  // Frase libre: tratar como “otra” con detalle
  if (t.length >= 8 && !/^(hola|ayuda|menu|enviar|soporte)$/.test(t)) {
    return "otra";
  }
  return null;
}
