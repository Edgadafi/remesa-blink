"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LandingFamilyVisual } from "@/components/landing/LandingFamilyVisual";
import { LandingHeroVisual } from "@/components/landing/LandingHeroVisual";
import { LandingQuotes } from "@/components/landing/LandingQuotes";
import { LandingTechMarquee } from "@/components/landing/LandingTechMarquee";
import { Reveal } from "@/components/landing/Reveal";
import type { LandingSectionsCopy } from "@/components/landing/copy";

type Props = {
  copy: LandingSectionsCopy;
  onScrollToSteps?: () => void;
  primaryHref?: string;
  primaryAction?: () => void;
  formSlot?: ReactNode;
  showDemoLink?: boolean;
};

export function LandingSections({
  copy,
  onScrollToSteps,
  primaryHref,
  primaryAction,
  formSlot,
  showDemoLink = true,
}: Props) {
  const scrollSteps =
    onScrollToSteps ??
    (() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" }));

  const primaryCta =
    primaryHref != null ? (
      <Link href={primaryHref} className="btn-primary landing-btn-glow">
        {copy.ctaPrimary}
      </Link>
    ) : (
      <button type="button" className="btn-primary landing-btn-glow" onClick={primaryAction}>
        {copy.ctaPrimary}
      </button>
    );

  return (
    <div className="landing-flow">
      <section className="landing-hero-shell" aria-labelledby="landing-title">
        <LandingTechMarquee />
        <div className="landing-hero-grid">
          <Reveal className="landing-hero-copy">
            <p className="landing-pride">{copy.prideBadge}</p>
            <p className="hub-kicker">{copy.kicker}</p>
            <h1 id="landing-title" className="page-title landing-h1">
              {copy.h1}
            </h1>
            <p className="hub-story">{copy.story}</p>
            <div className="hub-cta-row landing-cta-row">
              {primaryCta}
              <button type="button" className="btn-secondary landing-btn-outline" onClick={scrollSteps}>
                {copy.ctaHow}
              </button>
            </div>
            {showDemoLink ? (
              <div className="hub-cta-row landing-cta-row landing-cta-row--secondary">
                <Link href="/demo" className="btn-ghost">
                  {copy.ctaDemo}
                </Link>
              </div>
            ) : null}
            <p className="hub-reassure">{copy.reassure}</p>
            <dl className="landing-stats">
              <div className="landing-stat-card">
                <dt>{copy.statPilotoLabel}</dt>
                <dd>{copy.statPilotoValue}</dd>
              </div>
              <div className="landing-stat-card">
                <dt>{copy.statFeeLabel}</dt>
                <dd>{copy.statFeeValue}</dd>
              </div>
              <div className="landing-stat-card">
                <dt>{copy.statProofLabel}</dt>
                <dd>{copy.statProofValue}</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={120}>
            <LandingHeroVisual copy={copy} heroImageAlt={copy.heroImageAlt} />
          </Reveal>
        </div>
      </section>

      <section className="landing-families-section" aria-labelledby="families-title">
        <div className="landing-families-grid">
          <Reveal delay={80}>
            <LandingFamilyVisual alt={copy.familyImageAlt} labelledBy="families-title" />
          </Reveal>
          <Reveal className="landing-families-copy">
            <h2 id="families-title" className="landing-section-title">
              {copy.familiesTitle}
            </h2>
            <p className="landing-section-lede">{copy.familiesBody}</p>
            <LandingQuotes copy={copy} />
          </Reveal>
        </div>
      </section>

      <section
        className="landing-tech-band"
        id="como-funciona"
        aria-labelledby="steps-title"
      >
        <Reveal>
          <p className="landing-band-kicker">{copy.stepsAria}</p>
          <h2 id="steps-title" className="landing-section-title landing-section-title--dark">
            {copy.stepsSectionTitle}
          </h2>
          <p className="landing-section-lede landing-section-lede--dark">{copy.stepsSectionSub}</p>
        </Reveal>
        <ol className="landing-steps-grid" aria-label={copy.stepsAria}>
          <li className="landing-step-card landing-step-card--tech">
            <Reveal>
              <span className="landing-step-num">1</span>
              <h3>{copy.step1Title}</h3>
              <p>{copy.step1Body}</p>
            </Reveal>
          </li>
          <li className="landing-step-card landing-step-card--tech">
            <Reveal delay={80}>
              <span className="landing-step-num">2</span>
              <h3>{copy.step2Title}</h3>
              <p>{copy.step2Body}</p>
            </Reveal>
          </li>
          <li className="landing-step-card landing-step-card--tech">
            <Reveal delay={160}>
              <span className="landing-step-num">3</span>
              <h3>{copy.step3Title}</h3>
              <p>{copy.step3Body}</p>
            </Reveal>
          </li>
        </ol>
      </section>

      <section className="landing-section landing-trust" aria-labelledby="trust-title">
        <Reveal>
          <h2 id="trust-title" className="landing-section-title">
            {copy.trustTitle}
          </h2>
          <p className="landing-section-lede">{copy.trustBody}</p>
        </Reveal>
        <ul className="landing-trust-grid">
          <li className="landing-trust-card">
            <Reveal>
              <h3>{copy.trust1Title}</h3>
              <p>{copy.trust1Body}</p>
            </Reveal>
          </li>
          <li className="landing-trust-card">
            <Reveal delay={100}>
              <h3>{copy.trust2Title}</h3>
              <p>{copy.trust2Body}</p>
            </Reveal>
          </li>
        </ul>
      </section>

      <section className="landing-section landing-testimonial" aria-labelledby="testimonial-title">
        <Reveal>
          <h2 id="testimonial-title" className="visually-hidden">
            Testimonial
          </h2>
          <blockquote className="landing-testimonial-quote">{copy.testimonialQuote}</blockquote>
          <footer className="landing-testimonial-meta">
            <cite>{copy.testimonialName}</cite>
            <span>{copy.testimonialPlace}</span>
            <small>{copy.testimonialNote}</small>
          </footer>
        </Reveal>
      </section>

      <section className="landing-section landing-pricing" aria-labelledby="pricing-title">
        <Reveal>
          <h2 id="pricing-title" className="landing-section-title">
            {copy.pricingTitle}
          </h2>
          <p className="landing-section-lede">{copy.pricingSub}</p>
        </Reveal>
        <Reveal delay={80}>
          <div className="landing-pricing-card">
            <p className="landing-pricing-plan">{copy.pricingPlan}</p>
            <p className="landing-pricing-rate">{copy.pricingRate}</p>
            <p className="landing-pricing-compare">{copy.pricingCompare}</p>
            <ul>
              {copy.pricingBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="landing-pricing-note">{copy.pricingNote}</p>
            {primaryHref != null ? (
              <Link href={primaryHref} className="btn-primary landing-pricing-cta landing-btn-glow">
                {copy.ctaPrimary}
              </Link>
            ) : (
              <button
                type="button"
                className="btn-primary landing-pricing-cta landing-btn-glow"
                onClick={primaryAction}
              >
                {copy.ctaPrimary}
              </button>
            )}
          </div>
        </Reveal>
      </section>

      {formSlot ? (
        <section className="landing-section landing-form" id="piloto-form" aria-labelledby="form-title">
          <Reveal>
            <h2 id="form-title" className="landing-section-title">
              {copy.formSectionTitle}
            </h2>
            <p className="landing-section-lede">{copy.formSectionSub}</p>
          </Reveal>
          <Reveal delay={100}>{formSlot}</Reveal>
        </section>
      ) : null}
    </div>
  );
}
