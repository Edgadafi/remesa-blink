"use client";

import Link from "next/link";
import { BlinkPreview } from "@/components/BlinkPreview";
import { LandingBrandFrame } from "@/components/landing/LandingBrandFrame";
import { LandingDotGrid } from "@/components/landing/LandingDotGrid";
import { useLocale } from "@/components/LocaleProvider";
import { WhatsAppStartQr } from "@/components/WhatsAppStartQr";

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
      <main className="site-main landing-main hub-product">
        <section className="landing-hero-shell" aria-labelledby="empezar-title">
          <p className="landing-pride">{t.empezarTitle}</p>
          <h1 id="empezar-title" className="page-title landing-h1 hub-product-title">
            {t.empezarMissingTitle}
          </h1>
          <p className="landing-section-lede">{t.empezarMissingBody}</p>
          <Link href="/nueva-remesa" className="btn-primary landing-btn-glow">
            {t.empezarFormLink}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="site-main landing-main hub-product">
      <section className="landing-hero-shell" aria-labelledby="empezar-title">
        <div className="landing-hero-grid">
          <div>
            <p className="landing-pride">{t.empezarTitle}</p>
            <h1 id="empezar-title" className="page-title landing-h1 hub-product-title">
              {t.empezarHeadline}
            </h1>
            <p className="landing-section-lede">{t.empezarCaption}</p>
            <div className="hub-cta-row landing-cta-row">
              <Link href="/nueva-remesa" className="btn-primary landing-btn-glow">
                {t.empezarFormLink}
              </Link>
              <Link href="/demo" className="btn-secondary landing-btn-outline">
                {t.empezarDemoLink}
              </Link>
            </div>
            <p className="hub-reassure">
              <Link href="/piloto">{t.empezarPilotoLink}</Link>
            </p>
          </div>
          <div className="landing-hero-visual">
            <LandingBrandFrame variant="hero" wireframe labelledBy="empezar-qr-caption">
              <div className="landing-wire-scene hub-qr-scene">
                <LandingDotGrid />
                <div className="hub-qr-stack">
                  <WhatsAppStartQr
                    waUrl={props.waUrl}
                    qrDataUrl={props.qrDataUrl}
                    caption={t.empezarCaption}
                    variant="hero"
                  />
                </div>
              </div>
              <span id="empezar-qr-caption" className="visually-hidden">
                {t.empezarHeadline}
              </span>
            </LandingBrandFrame>
          </div>
        </div>
        <BlinkPreview
          actionUrl={props.actionUrl}
          localUrl={props.localUrl}
          inspectorUrl={props.inspectorUrl}
          variant="compact"
        />
      </section>
    </main>
  );
}
