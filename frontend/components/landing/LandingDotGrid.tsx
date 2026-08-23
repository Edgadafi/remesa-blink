/** Subtle dot grid — MatrixPay-style technical canvas on holatia papel. */
export function LandingDotGrid() {
  return (
    <svg
      className="landing-dot-grid"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="holatia-dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.75" fill="#2c2416" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#holatia-dot-grid)" />
    </svg>
  );
}
