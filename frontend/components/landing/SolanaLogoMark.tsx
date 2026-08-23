"use client";

import { useId } from "react";

/** Paths del logotipo Solana (viewBox 397.7 × 311.7). */
export function SolanaLogoPaths({ gradientId }: { gradientId: string }) {
  return (
    <>
      <path
        fill={`url(#${gradientId})`}
        d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
      />
      <path
        fill={`url(#${gradientId})`}
        d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
      />
      <path
        fill={`url(#${gradientId})`}
        d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
      />
    </>
  );
}

type Props = {
  width: number;
  className?: string;
};

/** Logotipo Solana canónico — gradiente embebido, sin marco. */
export function SolanaLogoMark({ width, className }: Props) {
  const gradientId = `sol-${useId().replace(/:/g, "")}`;
  const height = width * (311.7 / 397.7);

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 397.7 311.7"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="92%" y1="8%" x2="8%" y2="92%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="52%" stopColor="#8752F3" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <SolanaLogoPaths gradientId={gradientId} />
    </svg>
  );
}
