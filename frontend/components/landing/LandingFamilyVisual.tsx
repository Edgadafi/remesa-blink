"use client";

import { LandingBrandFrame } from "@/components/landing/LandingBrandFrame";
import { LandingDotGrid } from "@/components/landing/LandingDotGrid";
import { LandingFamilyArt } from "@/components/landing/LandingFamilyArt";
import { LandingSolanaOverlay } from "@/components/landing/LandingSolanaOverlay";
import { useLandingWireParallax } from "@/components/landing/useLandingWireParallax";

type Props = {
  alt: string;
  labelledBy: string;
};

export function LandingFamilyVisual({ alt, labelledBy }: Props) {
  const { ref, parallax } = useLandingWireParallax(12, 14);

  return (
    <LandingBrandFrame variant="panel" labelledBy={labelledBy} wireframe>
      <div ref={ref} className="landing-wire-scene landing-wire-scene--tall landing-wire-scene--parallax">
        <div
          className="landing-wire-parallax-bg"
          style={{
            transform: `translate(${parallax.x * 0.1}px, ${parallax.y * 0.12}px)`,
          }}
        >
          <LandingDotGrid />
        </div>
        <LandingFamilyArt parallax={parallax} />
        <LandingSolanaOverlay />
      </div>
      <span className="visually-hidden">{alt}</span>
    </LandingBrandFrame>
  );
}
