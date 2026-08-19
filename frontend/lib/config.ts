const EPHEMERAL_HOST = /trycloudflare\.com|ngrok|loca\.lt/i;

function stripSlash(u: string): string {
  return u.replace(/\/$/, "");
}

function isEphemeralHost(u: string): boolean {
  try {
    return EPHEMERAL_HOST.test(new URL(u).hostname);
  } catch {
    return EPHEMERAL_HOST.test(u);
  }
}

/** Sitio público canónico (Vercel / holatia.app). No es el túnel del API. */
export function getPublicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && !isEphemeralHost(explicit)) return stripSlash(explicit);
  if (process.env.VERCEL) return "https://holatia.app";
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3003";
  }
  return "https://holatia.app";
}

/** Base URL del backend API (sin slash final) */
export function getApiBase(): string {
  const u = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (u) return stripSlash(u);
  return "http://localhost:3000";
}

/**
 * Base pública de Solana Actions (GET / unfurl Dialect).
 * Siempre holatia.app en prod — nunca trycloudflare.
 */
export function getBlinksBase(): string {
  const u = process.env.NEXT_PUBLIC_BLINKS_BASE_URL?.trim();
  if (u && !isEphemeralHost(u)) return stripSlash(u);
  return getPublicSiteUrl();
}

/** Action HTTPS canónica del MVP (criterio 2). */
export function getCanonicalActionUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getBlinksBase()}${p}`;
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
