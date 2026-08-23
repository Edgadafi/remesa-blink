import { HolatiaMark } from "@/components/HolatiaMark";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Visual weight: hero (large) or panel (supporting). */
  variant?: "hero" | "panel";
  className?: string;
  labelledBy?: string;
  /** MatrixPay-style: fondo papel limpio, borde fino. */
  wireframe?: boolean;
};

/**
 * Uniform image/art frame — papel mat, nopal border, dorado accent, holatia mark.
 */
export function LandingBrandFrame({
  children,
  variant = "panel",
  className,
  labelledBy,
  wireframe = false,
}: Props) {
  return (
    <figure
      className={[
        "landing-brand-frame",
        `landing-brand-frame--${variant}`,
        wireframe ? "landing-brand-frame--wire" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={labelledBy}
    >
      <div className="landing-brand-frame__mat">
        <div className="landing-brand-frame__surface">{children}</div>
        {!wireframe ? <span className="landing-brand-frame__grain" aria-hidden="true" /> : null}
        <span className="landing-brand-frame__accent" aria-hidden="true" />
        <HolatiaMark className="landing-brand-frame__mark" />
      </div>
    </figure>
  );
}
