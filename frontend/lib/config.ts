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

/** Link wa.me para soporte piloto (solo dígitos, sin +) */
export function getWaSupportUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_WA_SUPPORT?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(
    "Hola RemesaBlink — me registré en el programa piloto."
  )}`;
}
