# /empezar override — Remesa Blink

Master: `design-system/remesa-blink/MASTER.md`

## Intent

QR start for Demo Day / piloto. Same landing chrome as `/` (papel, nopal header, no 3D corridor).

Card H1 stays **Escanea para empezar**. QR sits in the landing wireframe frame (`LandingBrandFrame` + dot grid). Blink preview below.

## Chrome

- Uses `site-wrap--landing` + `Nav landing`.
- No `EmpezarArt` / `demo-root` full-bleed.
- CTA: formulario `/nueva-remesa`, demo `/demo`, piloto `/piloto`.

## Blink

Canonical Action: `https://holatia.app/api/actions/enviar-remesa-usdc`  
Preview: `frontend/components/BlinkPreview.tsx`
