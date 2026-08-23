"use client";

import Image from "next/image";
import type { LandingWaCopy } from "@/components/landing/copy";
import { WhatsAppMock } from "@/components/landing/WhatsAppMock";

type Props = {
  copy: LandingWaCopy;
  heroImageAlt: string;
};

export function LandingHeroVisual({ copy, heroImageAlt }: Props) {
  return (
    <div className="landing-hero-visual">
      <div className="landing-hero-art">
        <Image
          src="/piloto/hero-banner.png"
          alt={heroImageAlt}
          width={1200}
          height={630}
          priority
          className="landing-hero-art-img"
          sizes="(min-width: 900px) 52vw, 100vw"
        />
        <div className="landing-hero-art-glow" aria-hidden="true" />
      </div>
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
