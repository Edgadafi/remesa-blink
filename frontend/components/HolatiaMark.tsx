type HolatiaMarkProps = {
  className?: string;
};

/** TIA monogram (T + gold dot) from `TIA logos system` — sits inside the Papel bubble. */
function TiaMonogramInBubble() {
  return (
    <>
      <text
        x="20.6"
        y="23.4"
        fontFamily="Georgia, 'Times New Roman', Times, serif"
        fontSize="14"
        fontWeight="700"
        fill="#1A4A2E"
        textAnchor="middle"
      >
        T
      </text>
      <circle cx="28.6" cy="13.5" r="2.15" fill="#C9A84C" />
    </>
  );
}

/**
 * holatia isotype: nopal stamp + Papel chat bubble.
 * Inner symbol is the TIA monogram (not the corridor chevron).
 */
export function HolatiaMark({ className }: HolatiaMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      width={40}
      height={40}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="40" height="40" rx="3" fill="#2d5016" />
      <path
        d="M7.5 10.5h25a2.5 2.5 0 0 1 2.5 2.5v11a2.5 2.5 0 0 1-2.5 2.5H16.2L9 32.2V26.5H7.5A2.5 2.5 0 0 1 5 24V13a2.5 2.5 0 0 1 2.5-2.5z"
        fill="#f5f0e8"
      />
      <TiaMonogramInBubble />
    </svg>
  );
}
