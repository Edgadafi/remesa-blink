# Off-ramp Demo Day — Etherfuse sandbox → SPEI MXN

**Alcance:** sandbox `api.sand.etherfuse.com` solo. No mainnet. No Bitso MXNB live.  
**Guía familia piloto:** [GUIA-USUARIO-PILOTO.md](./GUIA-USUARIO-PILOTO.md)

## Lecciones (2026-07 phone demo)

1. **IDs KYC inventados no sirven.** `demo-mark-kyc-verified` con `gen_random_uuid()` dejaba `kyc_status=verified` pero Etherfuse respondía **403 Forbidden** en quote/order. Siempre persistir customer/bank **reales** (onboarding o partner org).
2. **Onboarding exige `userInfo`:** `{ email, displayName }` en `POST /ramp/onboarding-url` (sandbox: 400 `missing field userInfo` si falta).
3. **`sourceAsset` sandbox ≠ Circle USDC.** Circles `4zMMC9…` (devnet) y `EPjFW…` (mainnet) → `400 NonStableAsset`. Usar el identifier de:
   ```bash
   GET /ramp/assets?blockchain=solana&currency=USD&wallet=<pubkey>
   ```
   Hoy: **`BXTou3CvPxpFVAJvzvEZcAnRLGCHqT1LHKsFTSQft7s`** (“USDC Etherfuse Devnet”). Override: `ETHERFUSE_SOURCE_ASSET`.
4. Partner org sandbox: `3787b9ab-60ab-44c1-b8f8-2e19a6eed707` · bank activo `9274aa72-7227-47ce-bbd4-49889e35edad` (CLABE …0395).

## Sync beneficiario (wallet Phantom)

```bash
cd backend
npx tsx scripts/demo-sync-etherfuse-beneficiary.ts 5HopANGJo1yjUx8o6RCdt2CCNXqYep23r4fUb2XKtQ5x --use-org-bank
# o sin flag: recupera org del 409 y bank si existe
```

Marcar verified **solo** con IDs reales:

```bash
npx tsx scripts/demo-mark-kyc-verified.ts <wallet> [wa] [customerId] [bankId]
# defaults = partner org + bank Demo Day
```

## Flujo Blink

1. KYC/CLABE: Action `onboarding-mxn` o `POST /api/etherfuse/onboarding-url`
2. Webhook `kyc_updated` → `verified` (o mark/sync scripts si no hay `ETHERFUSE_WEBHOOK_SECRET` + tunnel)
3. Action `convertir-mxn` → quote (mint BXTou3…) + order → firmar `burnTransaction` en Phantom

## Errores UX (español)

| Causa | Mensaje en Blink |
|-------|------------------|
| 403 / IDs falsos / bank missing | `No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.` |
| T&Cs no aceptados | `Falta aceptar términos en el registro de pesos. Abre el enlace de registro.` |
| NonStableAsset | `Activo no soportado para convertir a pesos. Contacta soporte.` |

## Blockers conocidos

- **T&Cs / hosted KYC:** order falla con *Terms and conditions…* hasta abrir ONBOARDING_URL del **personal org** del wallet (puede ser distinto al partner). Partner bank (`9274aa72…`) sirve para quotes; el wallet aún debe aceptar T&Cs.
- **Mint mismatch:** burn de Etherfuse usa USDC sandbox (`BXTou3…`), no Circle USDC del keeper remesa (`4zMMC9…`). Para firmar burn en Phantom hace falta ATA/balance de ese mint **o** status page Etherfuse.
- **Webhook:** configurar `ETHERFUSE_WEBHOOK_SECRET` + URL pública (`/api/webhooks/etherfuse`). Sin eso, usar scripts de sync/mark.
- **Deploy:** cambios en `etherfuse.ts` / blinks hay que **redeploy** el backend (Render/etc.) antes de reintentar Phantom en `frontend-bay-phi-92.vercel.app`.
- **Tunnel / API:** frontend Vercel debe apuntar a backend con `ETHERFUSE_*` reales.

## Probe sourceAsset

```bash
cd backend && npx tsx scripts/demo-quote-assets.ts <wallet>
```

## Webhook Etherfuse (Demo Day)

URL pública: `{BLINKS_BASE_URL}/api/webhooks/etherfuse` (quick tunnel trycloudflare).

Registro sandbox: `POST /ramp/webhook` body `{ id: uuid, url, eventType }` — un registro por `kyc_updated`, `customer_updated`, `order_updated`, `bank_account_updated`. Guardar cada `secret` (base64) en `ETHERFUSE_WEBHOOK_SECRET` (coma-separados). Listar: `POST /ramp/webhooks` con `{}`.

Para ver el webhook KYC: 1) tunnel + secret cargados, 2) onboarding (`onboarding-mxn` o `POST /api/etherfuse/onboarding-url`), 3) completar KYC hosted, 4) llega `kyc_updated` → `kyc_status=verified`. POST sin `x-signature` → 401.

