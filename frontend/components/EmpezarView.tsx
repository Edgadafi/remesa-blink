"use client";

import Link from "next/link";
import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";
import { WhatsAppStartQr } from "@/components/WhatsAppStartQr";

type Props =
  | { missing: true }
  | { missing?: false; waUrl: string; qrDataUrl: string };

export function EmpezarView(props: Props) {
  const { t } = useLocale();

  if (props.missing) {
    return (
      <main className="demo-root" style={{ padding: "3rem 1.5rem" }}>
        <div className="demo-lang-bar">
          <LangSwitch />
        </div>
        <h1 className="demo-stage-title">{t.empezarMissingTitle}</h1>
        <p className="demo-stage-copy">{t.empezarMissingBody}</p>
        <Link href="/nueva-remesa">{t.empezarFormLink}</Link>
      </main>
    );
  }

  return (
    <div className="demo-root">
      <section
        className="demo-hero"
        style={{ minHeight: "100svh", alignItems: "center", justifyContent: "center" }}
        aria-labelledby="empezar-title"
      >
        <div className="demo-hero-bg" aria-hidden />
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
