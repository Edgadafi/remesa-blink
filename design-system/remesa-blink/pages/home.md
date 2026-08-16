# Home / hub override — Remesa Blink

Master: `design-system/remesa-blink/MASTER.md`

## Deviations

- Conversion CTA is **Empezar con QR** (`/empezar`), not Contact Sales.
- Secondary: Demo MVP + formulario `/nueva-remesa` as backup without WhatsApp.
- Proof layer = 3-step corridor (tú mandas → confirmamos → familia cobra), not logo carousel.
- Keep terracotta headlines on papel. Do not switch to dark mode as default.
- Hub uses `CorridorBackdrop` (WebGL, brand metals). Fallback CSS if reduced-motion or no WebGL.
- Hero H1 (ES): `Tu familia más cerca, cada envío de dinero al instante sin salir de WhatsApp.`
- Hero H1 (EN): `Your family, closer — send money instantly without leaving WhatsApp.`
- Allow the H1 to wrap 2–3 lines at 375px; do not shrink below ~1.75rem.
- Header wordmark is an image (`/brand/remesa-blink-wordmark.png`), not live HTML text. Alt: “Remesa Blink”.
- Hub chrome is bilingual (ES/EN) via `remesa-locale` localStorage. Toggle uses ES/EN text, not flag emoji.
