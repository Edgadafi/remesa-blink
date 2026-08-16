/** Base URL del backend API (sin slash final) */
export function getApiBase(): string {
  const u = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  return "http://localhost:3000";
}

/** URL pública donde están montados Blinks (GET actions, etc.) */
export function getBlinksBase(): string {
  const u = process.env.NEXT_PUBLIC_BLINKS_BASE_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  return getApiBase();
}

/** Dígitos del bot WhatsApp (mismo número Baileys / soporte). */
export function getWaBotDigits(): string | null {
  const raw = process.env.NEXT_PUBLIC_WA_SUPPORT?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits;
}

/**
 * Link wa.me para iniciar chat con TIA.
 * Prefill por defecto: "hola" → menú del bot (NLU ayuda).
 */
export function getWaBotStartUrl(
  prefill = "hola"
): string | null {
  const digits = getWaBotDigits();
  if (!digits) return null;
  const text = prefill.trim() || "hola";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Link wa.me para soporte piloto (solo dígitos, sin +).
 * Debe ser el **mismo número del bot** de remesas (no un segundo WhatsApp).
 */
export function getWaSupportUrl(): string | null {
  return getWaBotStartUrl(
    "Hola — necesito soporte (piloto Remesa Blink)."
  );
}
