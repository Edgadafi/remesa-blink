"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  blinkBase: string;
};

export function HomeHub({ blinkBase }: Props) {
  const { t } = useLocale();
  const wrap = (u: string) => `/blink?url=${encodeURIComponent(u)}`;

  const blinkLinks = [
    { href: wrap(`${blinkBase}/api/actions/remesa`), label: t.blinkSolLabel, desc: t.blinkSolDesc },
    {
      href: wrap(`${blinkBase}/api/actions/enviar-remesa-usdc`),
      label: t.blinkUsdcLabel,
      desc: t.blinkUsdcDesc,
    },
    {
      href: wrap(`${blinkBase}/api/actions/convertir-mxn`),
      label: t.blinkMxnLabel,
      desc: t.blinkMxnDesc,
    },
    {
      href: wrap(`${blinkBase}/api/actions/onboarding-mxn`),
      label: t.blinkOnboardLabel,
      desc: t.blinkOnboardDesc,
    },
  ];

  return (
    <main className="site-main wide">
      <section className="hub-hero" aria-labelledby="hub-title">
        <p className="hub-kicker">{t.homeKicker}</p>
        <h1 id="hub-title" className="page-title">
          {t.homeH1}
        </h1>
        <p className="hub-story">{t.homeStory}</p>
        <div className="hub-cta-row">
          <Link href="/empezar" className="btn-primary">
            {t.homeCtaQr}
          </Link>
          <Link href="/demo" className="btn-secondary">
            {t.homeCtaDemo}
          </Link>
        </div>
        <p className="hub-reassure">{t.homeReassure}</p>
      </section>

      <ol className="hub-steps" aria-label={t.homeStepsAria}>
        <li>
          <span className="hub-step-num" aria-hidden>
            01
          </span>
          <div>
            <strong>{t.homeStep1Title}</strong>
            <span>{t.homeStep1Body}</span>
          </div>
        </li>
        <li>
          <span className="hub-step-num" aria-hidden>
            02
          </span>
          <div>
            <strong>{t.homeStep2Title}</strong>
            <span>{t.homeStep2Body}</span>
          </div>
        </li>
        <li>
          <span className="hub-step-num" aria-hidden>
            03
          </span>
          <div>
            <strong>{t.homeStep3Title}</strong>
            <span>{t.homeStep3Body}</span>
          </div>
        </li>
      </ol>

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
