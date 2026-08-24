"use client";

import Link from "next/link";
import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";
import { EmpezarArt } from "@/components/empezar/EmpezarArt";
import { WhatsAppStartQr } from "@/components/WhatsAppStartQr";
import { BlinkPreview } from "@/components/BlinkPreview";
import { MVP_ACTION_PATH, MVP_CLUSTER, MVP_PROGRAM_ID } from "@/lib/mvp-demo";
import "@/app/empezar/empezar.css";

type Props = {
  actionUrl: string;
  dialUrl: string;
  inspectorUrl: string;
  localUrl: string;
  txUrl: string;
  programUrl: string;
  waUrl: string | null;
  qrDataUrl: string | null;
};

export function DemoView({
  actionUrl,
  dialUrl,
  inspectorUrl,
  localUrl,
  txUrl,
  programUrl,
  waUrl,
  qrDataUrl,
}: Props) {
  const { t } = useLocale();

  return (
    <div className="demo-root">
      <section className="demo-hero" aria-labelledby="demo-brand">
        <EmpezarArt />
        <div className="demo-hero-inner demo-hero-inner--qr">
          <div className="demo-lang-bar">
            <LangSwitch />
          </div>
          <p className="demo-brand" id="demo-brand">
            Solana Blink <span className="demo-brand-tia">+ TIA</span>
          </p>
          <h1 className="demo-headline">{t.demoHeadline}</h1>
          <p className="demo-lede">{t.demoLede}</p>

          {waUrl && qrDataUrl ? (
            <WhatsAppStartQr waUrl={waUrl} qrDataUrl={qrDataUrl} variant="hero" />
          ) : (
            <p className="demo-cta-hint">{t.demoQrMissing}</p>
          )}

          <BlinkPreview
            actionUrl={actionUrl}
            localUrl={localUrl}
            inspectorUrl={inspectorUrl}
            variant="hero"
          />
          <p className="demo-cta-hint">{t.demoHint}</p>
        </div>
      </section>

      <section className="demo-stage" aria-label={t.demoStageTitle}>
        <h2 className="demo-stage-title">{t.demoStageTitle}</h2>
        <p className="demo-stage-copy">{t.demoStageCopy}</p>

        <ul className="demo-meta" aria-label={t.demoMetaAria}>
          <li>
            <span className="demo-meta-k">Cluster</span>
            <span className="demo-meta-v">{MVP_CLUSTER}</span>
          </li>
          <li>
            <span className="demo-meta-k">Program</span>
            <a className="demo-meta-v mono" href={programUrl} target="_blank" rel="noopener noreferrer">
              {MVP_PROGRAM_ID.slice(0, 8)}…{MVP_PROGRAM_ID.slice(-4)}
            </a>
          </li>
          <li>
            <span className="demo-meta-k">Action</span>
            <span className="demo-meta-v mono truncate" title={actionUrl}>
              {MVP_ACTION_PATH}
            </span>
          </li>
        </ul>

        <div className="demo-links">
          <a href={inspectorUrl} target="_blank" rel="noopener noreferrer">
            {t.demoInspector}
          </a>
          <a href={localUrl}>{t.demoBlinkHere}</a>
          <a href={dialUrl} target="_blank" rel="noopener noreferrer">
            {t.demoBlinkOpen}
          </a>
          <a href={txUrl} target="_blank" rel="noopener noreferrer">
            {t.demoExplorer}
          </a>
          <a href={actionUrl} target="_blank" rel="noopener noreferrer">
            {t.demoActionJson}
          </a>
        </div>

        <aside className="demo-planb" aria-label={t.demoPlanBTitle}>
          <strong>{t.demoPlanBTitle}</strong>
          <p>{t.demoPlanBBody}</p>
        </aside>

        <div className="demo-footer-cta">
          <Link href="/piloto" className="demo-piloto-link">
            {t.demoPilotoCta}
          </Link>
          <Link href="/nueva-remesa" className="demo-backup-link">
            {t.demoBackupCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
