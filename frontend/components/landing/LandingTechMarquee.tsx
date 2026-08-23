"use client";

const PILLS = [
  "WhatsApp",
  "Solana Actions",
  "Blink",
  "USDC",
  "Recurrencia",
  "Comprobante on-chain",
  "SPEI sandbox",
  "Español simple",
] as const;

export function LandingTechMarquee() {
  const track = [...PILLS, ...PILLS];

  return (
    <div className="landing-marquee" aria-hidden="true">
      <div className="landing-marquee-track">
        {track.map((label, i) => (
          <span key={`${label}-${i}`} className="landing-marquee-pill">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
