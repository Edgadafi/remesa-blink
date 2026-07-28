/**
 * Intents en español coloquial — remitente migrante (docs/PERSONA-MX-US.md, UX-TRUST).
 */

export type Intent =
  | "ayuda"
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

export function detectIntent(raw: string): Intent {
  const t = normalizeText(raw);
  if (!t) return "unknown";

  if (isLegacySlash(raw)) return "legacy";

  if (
    /^(hola|buenas|buen dia|buenos dias|menu|ayuda|info|informacion|que puedo|opciones)\b/.test(t) ||
    t === "start" ||
    t === "?"
  ) {
    return "ayuda";
  }

  if (/^(cancelar|cancela|olvidalo|ya no|parar|salir|stop)\b/.test(t)) {
    return "cancelar";
  }

  if (
    /\b(enviar|manda|mandar|envio|envío|remesa|quiero enviar|quiero mandar|programar)\b/.test(t) ||
    t === "1"
  ) {
    return "enviar";
  }

  if (
    /\b(mis envios|mis envíos|mis remesas|que tengo|qué tengo|ver envios|ver remesas|consulta)\b/.test(
      t
    ) ||
    t === "2"
  ) {
    return "mis_envios";
  }

  if (
    /\b(recompensa|recompensas|cashback|saldo|puntos|bono)\b/.test(t) ||
    t === "3"
  ) {
    return "recompensas";
  }

  if (/\b(codigo|código|referido|invitar)\b/.test(t)) {
    return "codigo";
  }

  if (/\b(canjear|canje)\b/.test(t)) {
    return "canjear";
  }

  if (
    /\b(soporte|ayuda humana|hablar con|asesor|problema|no funciona)\b/.test(t) ||
    t === "4"
  ) {
    return "soporte";
  }

  if (/\b(piloto|registrarme|unirme)\b/.test(t)) {
    return "piloto";
  }

  return "unknown";
}

export function parseFrecuencia(raw: string): "diario" | "semanal" | "mensual" | null {
  const t = normalizeText(raw);
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
  if (/\bsol\b/.test(t)) return "SOL";
  return "USDC";
}

export function parseWhatsAppDigits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export function looksLikeSolanaAddress(raw: string): boolean {
  const s = raw.trim();
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
}
