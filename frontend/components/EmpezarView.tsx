"use client";

import Link from "next/link";
import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";
import { EmpezarArt } from "@/components/empezar/EmpezarArt";
import { WhatsAppStartQr } from "@/components/WhatsAppStartQr";
import { BlinkPreview } from "@/components/BlinkPreview";
import "@/app/empezar/empezar.css";

type Props =
  | { missing: true }
  | {
      missing?: false;
      waUrl: string;
      qrDataUrl: string;
      actionUrl: string;
      localUrl: string;
      inspectorUrl: string;
    };

export function EmpezarView(props: Props) {
  const { t } = useLocale();

  if (props.missing) {
    return (
      <div className="demo-root" style={{ position: "relative" }}>
        <EmpezarArt />
        <main style={{ position: "relative", zIndex: 1, padding: "3rem 1.5rem" }}>
        <div className="demo-lang-bar">
          <LangSwitch />
        </div>
        <h1 className="demo-stage-title">{t.empezarMissingTitle}</h1>
        <p className="demo-stage-copy">{t.empezarMissingBody}</p>
        <Link href="/nueva-remesa">{t.empezarFormLink}</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="demo-root">
      <section
        className="demo-hero"
        style={{ minHeight: "100svh", alignItems: "center", justifyContent: "center" }}
        aria-labelledby="empezar-title"
      >
        <EmpezarArt />
        <div className="demo-hero-inner demo-hero-inner--qr" style={{ textAlign: "center" }}>
          <div className="demo-lang-bar">
            <LangSwitch />
          </div>
          <p className="demo-brand" id="empezar-title">
            Remesa Blink <span className="demo-brand-tia">+ TIA</span>
          </p>
          <h1 className="demo-headline" style={{ maxWidth: "none", marginInline: "auto" }}>
            {t.empezarHeadline}
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <WhatsAppStartQr
              waUrl={props.waUrl}
              qrDataUrl={props.qrDataUrl}
              caption={t.empezarCaption}
              variant="hero"
            />
          </div>
          <BlinkPreview
            actionUrl={props.actionUrl}
            localUrl={props.localUrl}
            inspectorUrl={props.inspectorUrl}
            variant="compact"
          />
          <p className="demo-cta-hint" style={{ marginTop: "1.5rem" }}>
            <Link href="/demo" style={{ color: "inherit" }}>
              {t.empezarDemoLink}
            </Link>
            {" · "}
            <Link href="/piloto" style={{ color: "inherit" }}>
              {t.empezarPilotoLink}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
