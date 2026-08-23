"use client";

import Link from "next/link";
import { hubToLandingCopy } from "@/components/landing/copy";
import { LandingSections } from "@/components/landing/LandingSections";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  siteBase: string;
  apiBase: string;
};

export function HomeHub({ siteBase, apiBase }: Props) {
  const { t } = useLocale();
  const wrap = (u: string) => `/blink?url=${encodeURIComponent(u)}`;
  const copy = hubToLandingCopy(t);

  const blinkLinks = [
    { href: wrap(`${apiBase}/api/actions/remesa`), label: t.blinkSolLabel, desc: t.blinkSolDesc },
    {
      href: wrap(`${siteBase}/api/actions/enviar-remesa-usdc`),
      label: t.blinkUsdcLabel,
      desc: t.blinkUsdcDesc,
    },
    {
      href: wrap(`${apiBase}/api/actions/convertir-mxn`),
      label: t.blinkMxnLabel,
      desc: t.blinkMxnDesc,
    },
    {
      href: wrap(`${apiBase}/api/actions/onboarding-mxn`),
      label: t.blinkOnboardLabel,
      desc: t.blinkOnboardDesc,
    },
  ];

  return (
    <main className="site-main landing-main">
      <LandingSections copy={copy} primaryHref="/empezar" showDemoLink />

      <nav className="hub-secondary" aria-label={t.homeSecondaryAria}>
        <Link href="/mis-remesas" className="hub-secondary-card">
          <strong>{t.homeTransfersTitle}</strong>
          <span>{t.homeTransfersDesc}</span>
        </Link>
        <Link href="/cashback" className="hub-secondary-card">
          <strong>{t.homeCashbackTitle}</strong>
          <span>{t.homeCashbackDesc}</span>
        </Link>
      </nav>

      <details className="hub-advanced">
        <summary>{t.homeAdvancedSummary}</summary>
        <p className="muted" style={{ marginBottom: "0.85rem" }}>
          {t.homeAdvancedNote}
        </p>
        <ul className="hub-blinks">
          {blinkLinks.map((b) => (
            <li key={b.href}>
              <a href={b.href} target="_blank" rel="noopener noreferrer">
                <strong>{b.label}</strong>
                <span>{b.desc}</span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}
