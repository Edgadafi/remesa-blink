type RemesaBlinkIsotypeProps = {
  className?: string;
};

/** Geometric stamp: nopal square + gold northbound chevron (corridor / nopal leaf). */
export function RemesaBlinkIsotype({ className }: RemesaBlinkIsotypeProps) {
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
        d="M8.5 27.5 20 11.5 31.5 27.5"
        fill="none"
        stroke="#c9a227"
        strokeWidth="3.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}
