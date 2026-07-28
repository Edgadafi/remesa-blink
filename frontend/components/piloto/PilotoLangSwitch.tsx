"use client";

import type { PilotoLocale } from "@/lib/i18n/piloto";

type Props = {
  locale: PilotoLocale;
  label: string;
  onChange: (locale: PilotoLocale) => void;
};

export function PilotoLangSwitch({ locale, label, onChange }: Props) {
  return (
    <nav className="piloto-lang-switch" aria-label={label}>
      <button
        type="button"
        lang="es"
        className={locale === "es" ? "is-active" : undefined}
        aria-current={locale === "es" ? "true" : undefined}
        onClick={() => onChange("es")}
      >
        ES
      </button>
      <button
        type="button"
        lang="en"
        className={locale === "en" ? "is-active" : undefined}
        aria-current={locale === "en" ? "true" : undefined}
        onClick={() => onChange("en")}
      >
        EN
      </button>
    </nav>
  );
}
