"use client";

import { useLocale } from "@/components/LocaleProvider";

export function LangSwitch() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="lang-switch" role="group" aria-label={t.langAria}>
      <button
        type="button"
        lang="es"
        aria-pressed={locale === "es"}
        aria-label={t.langEs}
        onClick={() => setLocale("es")}
      >
        ES
      </button>
      <button
        type="button"
        lang="en"
        aria-pressed={locale === "en"}
        aria-label={t.langEn}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
