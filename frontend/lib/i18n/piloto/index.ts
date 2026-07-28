import { en } from "./en";
import { es } from "./es";
import type { PilotoLocale, PilotoMessages } from "./types";

export type { PilotoLocale, PilotoMessages };

const STORAGE_KEY = "piloto-locale";

const messages: Record<PilotoLocale, PilotoMessages> = { es, en };

export function getPilotoMessages(locale: PilotoLocale): PilotoMessages {
  return messages[locale];
}

export function parsePilotoLocale(value: unknown): PilotoLocale | null {
  if (value === "es" || value === "en") return value;
  return null;
}

export function readStoredLocale(): PilotoLocale | null {
  if (typeof window === "undefined") return null;
  return parsePilotoLocale(localStorage.getItem(STORAGE_KEY));
}

export function persistLocale(locale: PilotoLocale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, locale);
}

export function resolveInitialLocale(queryLang?: string | null): PilotoLocale {
  const fromQuery = parsePilotoLocale(queryLang);
  if (fromQuery) return fromQuery;
  const stored = readStoredLocale();
  if (stored) return stored;
  return "es";
}
