# Criterio 2 M5 — MVP link (Blink) + escena `/demo`

**Decisión:** el link oficial WayLearn = **Solana Action (Blink)** en HTTPS estable.  
**Sitio canónico:** [https://holatia.app](https://holatia.app)

`dial.to` a menudo falla; el unfurl y la UI propia viven en **holatia.app**, no en `*.trycloudflare.com`.

## Flujo humano (QR → WhatsApp → comprobante)

1. Usuario abre `/demo` o `/empezar` y **escanea el QR**.
2. WhatsApp abre el chat con TIA y texto prellenado **`hola`** → menú del bot.
3. Escribe **`enviar`** (o one-shot) → orden → recibo.
4. En el **proyector** se ve el Blink (preview Dialect-style + `/blink` + Inspector). No es solo un log.

Páginas: `/demo` (QR + preview Blink) · `/empezar` (QR para proyectar + comprobante compacto).

Requisito: `NEXT_PUBLIC_WA_SUPPORT` = número del bot Baileys (ej. `5215665269591`).

---

## URLs canónicas (holatia.app)

| Rol | URL |
|-----|-----|
| Escena Demo Day | https://holatia.app/demo |
| Solo QR + Blink compacto | https://holatia.app/empezar |
| Piloto | https://holatia.app/piloto |
| Action GET (unfurl) | https://holatia.app/api/actions/enviar-remesa-usdc |
| `actions.json` | https://holatia.app/actions.json |
| Inspector | https://www.blinks.xyz/inspector?url=https%3A%2F%2Fholatia.app%2Fapi%2Factions%2Fenviar-remesa-usdc |
| UI propia (Phantom) | https://holatia.app/blink?url=https%3A%2F%2Fholatia.app%2Fapi%2Factions%2Fenviar-remesa-usdc |
| dial.to (respaldo) | `https://dial.to/?action=solana-action:https://holatia.app/api/actions/enviar-remesa-usdc` |

**No usar** `frontend-bay-phi-92.vercel.app`, `api.remesablink.com` ni `*.trycloudflare.com` como URL del criterio 2.

El túnel Quick Cloudflare sigue siendo **solo** el API local (webhooks Etherfuse / POST para firmar). El GET del Blink no depende de que la laptop esté encendida.

## Cómo armar el link (Drive / Discord)

1. Frontend en Vercel con dominio **holatia.app**.
2. `NEXT_PUBLIC_SITE_URL=https://holatia.app` (y opcional `NEXT_PUBLIC_BLINKS_BASE_URL=https://holatia.app`).
3. Action: `https://holatia.app/api/actions/enviar-remesa-usdc`
4. Texto para Drive:

```text
https://holatia.app/api/actions/enviar-remesa-usdc
```

Inspector: pegar esa URL en https://www.blinks.xyz/inspector  
UI: https://holatia.app/blink?url= + encodeURIComponent(Action).

5. POST (firmar tx en Phantom) puede usar `BLINKS_UPSTREAM_URL` hacia el API local/túnel. Si el API está abajo, el **unfurl GET sigue vivo**.

## Código

- Action GET/POST (Next): [`frontend/app/api/actions/enviar-remesa-usdc/route.ts`](../../frontend/app/api/actions/enviar-remesa-usdc/route.ts)
- Preview proyector: [`frontend/components/BlinkPreview.tsx`](../../frontend/components/BlinkPreview.tsx)
- Interstitial: [`frontend/app/blink/page.tsx`](../../frontend/app/blink/page.tsx)
- Escena: [`frontend/components/DemoView.tsx`](../../frontend/components/DemoView.tsx) · [`frontend/components/EmpezarView.tsx`](../../frontend/components/EmpezarView.tsx)
- Entrega: [ENTREGA-M5-MVP.md](./ENTREGA-M5-MVP.md)
