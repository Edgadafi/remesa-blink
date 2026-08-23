import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  accent?: boolean;
  className?: string;
};

/** Floating micro-label (MatrixPay-style chip). */
export function LandingMicroChip({ children, accent = false, className }: Props) {
  return (
    <div
      className={[
        "landing-micro-chip",
        accent ? "landing-micro-chip--accent" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
