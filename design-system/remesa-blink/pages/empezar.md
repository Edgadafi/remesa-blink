# /empezar override — Remesa Blink

Master: `design-system/remesa-blink/MASTER.md`

## Intent

QR projection page for Demo Day / piloto. Card H1 stays **Escanea para empezar**. The bilingual slogan lives in the decorative art, not as a second H1 on the card.

Below the QR: **Blink preview** (comprobante Solana). Opaque Papel card, gold rail, nopal CTA «Ver el Blink aquí». Not a second H1.

## Background + dynamic component (`EmpezarArt`)

Slogan HTML: **Send dollars / recibe pesos / sin salir de WhatsApp.** No `hero-banner.png` on this page.

## Blink

Canonical Action: `https://holatia.app/api/actions/enviar-remesa-usdc`  
Preview: `frontend/components/BlinkPreview.tsx`
