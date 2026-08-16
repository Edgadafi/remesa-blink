"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getHubMessages,
  persistHubLocale,
  readStoredHubLocale,
  type HubLocale,
  type HubMessages,
} from "@/lib/i18n/hub";

type LocaleContextValue = {
  locale: HubLocale;
  setLocale: (locale: HubLocale) => void;
  t: HubMessages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<HubLocale>("es");

  useEffect(() => {
    const stored = readStoredHubLocale() ?? "es";
    setLocaleState(stored);
    document.documentElement.lang = stored;
  }, []);

  const setLocale = useCallback((next: HubLocale) => {
    setLocaleState(next);
    persistHubLocale(next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: getHubMessages(locale),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
