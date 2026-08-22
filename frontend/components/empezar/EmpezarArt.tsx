/**
 * /empezar scene: bilingual slogan in HTML + corridor SVG + live USD→WhatsApp→MXN flow.
 * No hero-banner.png. Decorative only (aria-hidden).
 */
export function EmpezarArt() {
  return (
    <div
      className="empezar-art"
      data-empezar-art="slogan-vivo"
      data-slogan="Send dollars, recibe pesos sin salir de WhatsApp."
      aria-hidden="true"
    >
      <svg
        className="empezar-art-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <rect width="1440" height="900" fill="#f5f0e8" />
        <ellipse cx="220" cy="160" rx="320" ry="180" fill="#4a7c59" opacity="0.12" />
        <ellipse cx="1220" cy="140" rx="380" ry="200" fill="#c9a227" opacity="0.16" />

        {/* USA — skyline + Liberty hint */}
        <g fill="#2c2416" opacity="0.28">
          <rect x="48" y="468" width="36" height="168" />
          <rect x="92" y="420" width="44" height="216" />
          <rect x="144" y="444" width="32" height="192" />
          <rect x="184" y="492" width="40" height="144" />
          <path d="M268 628 L268 318 L292 318 L292 292 L318 292 L318 318 L342 318 L342 628 Z" />
          <circle cx="305" cy="268" r="28" />
          <path d="M292 252 L305 228 L318 252" fill="none" stroke="#2c2416" strokeWidth="5" />
          <path d="M318 340 L392 248" stroke="#2c2416" strokeWidth="9" strokeLinecap="round" />
        </g>
        <circle cx="392" cy="236" r="14" fill="#c9a227" />

        {/* MX — pyramid + nopal pads (not the national coat of arms) */}
        <g fill="#2c2416" opacity="0.26">
          <path d="M1088 628 L1228 318 L1368 628 Z" />
          <path d="M1148 628 L1228 448 L1308 628 Z" fill="#2d5016" opacity="0.9" />
        </g>
        <g transform="translate(1188 548)">
          <ellipse cx="36" cy="28" rx="22" ry="30" fill="#4a7c59" />
          <ellipse cx="64" cy="18" rx="20" ry="28" fill="#2d5016" />
          <ellipse cx="52" cy="48" rx="24" ry="22" fill="#2d5016" />
          <ellipse cx="28" cy="52" rx="8" ry="10" fill="#c45c3e" />
          <ellipse cx="70" cy="8" rx="7" ry="9" fill="#c45c3e" />
        </g>
        <g transform="translate(1324 572)">
          <ellipse cx="28" cy="20" rx="16" ry="24" fill="#4a7c59" />
          <ellipse cx="48" cy="32" rx="18" ry="16" fill="#2d5016" />
        </g>

        <path
          d="M0 640 C 240 560 420 700 680 620 C 940 540 1180 680 1440 600 L 1440 900 L 0 900 Z"
          fill="#4a7c59"
          opacity="0.35"
        />
        <path
          d="M0 720 C 260 660 520 780 800 710 C 1080 640 1280 760 1440 700 L 1440 900 L 0 900 Z"
          fill="#2d5016"
        />
        <path
          d="M-40 708 C 280 628 520 788 760 668 C 1000 548 1240 728 1480 648"
          fill="none"
          stroke="#c9a227"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <p className="empezar-slogan">
        <span className="empezar-slogan-l1">Send dollars</span>
        <span className="empezar-slogan-l2">recibe pesos</span>
        <span className="empezar-slogan-l3">sin salir de WhatsApp.</span>
      </p>

      <div className="empezar-flow">
        <span className="empezar-bill empezar-bill--1">$</span>
        <span className="empezar-bill empezar-bill--2">$</span>
        <span className="empezar-bill empezar-bill--3">$</span>
        <span className="empezar-usd empezar-usd--1">USD</span>

        <div className="empezar-channel">
          <div className="empezar-channel-pulse">
            <svg
              className="empezar-channel-svg"
              viewBox="0 0 120 168"
              width="88"
              height="124"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="28" y="8" width="64" height="152" rx="14" fill="#2c2416" />
              <rect x="36" y="22" width="48" height="112" rx="6" fill="#25d366" />
              <rect x="50" y="142" width="20" height="6" rx="3" fill="#f5f0e8" opacity="0.55" />
              <path
                d="M6 54h72c6.6 0 12 5.4 12 12v28c0 6.6-5.4 12-12 12H32l-18 14v-14H6c-6.6 0-12-5.4-12-12V66c0-6.6 5.4-12 12-12z"
                fill="#25d366"
              />
              <path
                d="M18 60h68c5.5 0 10 4.5 10 10v24c0 5.5-4.5 10-10 10H40l-16 12v-12H18c-5.5 0-10-4.5-10-10V70c0-5.5 4.5-10 10-10z"
                fill="#fffdf8"
              />
            </svg>
          </div>
        </div>

        <span className="empezar-peso empezar-peso--1">$</span>
        <span className="empezar-peso empezar-peso--2">$</span>
        <span className="empezar-peso empezar-peso--3">$</span>
        <span className="empezar-mxn empezar-mxn--1">MXN</span>
      </div>
    </div>
  );
}
