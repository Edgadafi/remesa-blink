"use client";

import { LandingBrandFrame } from "@/components/landing/LandingBrandFrame";
import { LandingCorridorArt } from "@/components/landing/LandingCorridorArt";
import { LandingDotGrid } from "@/components/landing/LandingDotGrid";
import { LandingSolanaOverlay } from "@/components/landing/LandingSolanaOverlay";
import type { LandingWaCopy } from "@/components/landing/copy";
import { useLandingWireParallax } from "@/components/landing/useLandingWireParallax";
import { WhatsAppMock } from "@/components/landing/WhatsAppMock";

type Props = {
  copy: LandingWaCopy;
  heroImageAlt: string;
};

export function LandingHeroVisual({ copy, heroImageAlt }: Props) {
  const { ref, parallax } = useLandingWireParallax(16, 11);

  return (
    <div className="landing-hero-visual">
      <LandingBrandFrame variant="hero" labelledBy="landing-corridor-caption" wireframe>
        <div ref={ref} className="landing-wire-scene landing-wire-scene--parallax">
          <div
            className="landing-wire-parallax-bg"
            style={{
              transform: `translate(${parallax.x * 0.12}px, ${parallax.y * 0.08}px)`,
            }}
          >
            <LandingDotGrid />
          </div>
          <LandingCorridorArt parallax={parallax} />
          <LandingSolanaOverlay />
        </div>
        <span id="landing-corridor-caption" className="visually-hidden">
          {heroImageAlt}
        </span>
      </LandingBrandFrame>
      <div className="landing-hero-wa-float">
        <span className="landing-live-badge">
          <span className="landing-live-dot" aria-hidden="true" />
          Live · devnet MVP
        </span>
        <WhatsAppMock copy={copy} />
      </div>
    </div>
  );
}
