import { en } from "./en";
import { es } from "./es";
import type { HubLocale, HubMessages } from "./types";

export type { HubLocale, HubMessages };

export const REMESA_LOCALE_KEY = "remesa-locale";

const messages: Record<HubLocale, HubMessages> = { es, en };

export function getHubMessages(locale: HubLocale): HubMessages {
  return messages[locale];
}

export function parseHubLocale(value: unknown): HubLocale | null {
  if (value === "es" || value === "en") return value;
  return null;
}

export function readStoredHubLocale(): HubLocale | null {
  if (typeof window === "undefined") return null;
  return parseHubLocale(localStorage.getItem(REMESA_LOCALE_KEY));
}

export function persistHubLocale(locale: HubLocale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMESA_LOCALE_KEY, locale);
}
