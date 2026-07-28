/** Divisor escudo — águila + nopal + tunas (marca v1.1) */
export function PilotoEscudoDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`piloto-escudo-divider ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M60 6c-8 4-14 12-14 20 0 2 1 4 2 5l12-8 12 8c1-1 2-3 2-5 0-8-6-16-14-20z"
          fill="var(--color-dorado-tia)"
          opacity="0.9"
        />
        <path
          d="M48 28c4 6 8 10 12 12 4-2 8-6 12-12-3 2-6 3-12 3s-9-1-12-3z"
          fill="var(--color-verde-nopal)"
        />
        <ellipse cx="52" cy="34" rx="2.5" ry="3" fill="var(--color-terracotta)" />
        <ellipse cx="60" cy="36" rx="2.5" ry="3" fill="var(--color-terracotta)" />
        <ellipse cx="68" cy="34" rx="2.5" ry="3" fill="var(--color-terracotta)" />
        <path
          d="M38 24h44M32 24h2M86 24h2"
          stroke="var(--color-dorado-tia)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
