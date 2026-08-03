# Off-ramp Demo Day — Etherfuse sandbox → SPEI MXN

**Alcance:** sandbox `api.sand.etherfuse.com` solo. No mainnet. No Bitso MXNB live.  
**Guía familia piloto:** [GUIA-USUARIO-PILOTO.md](./GUIA-USUARIO-PILOTO.md)

## Ensayo phone — checklist HOY (2026-07-30)

**Wallet Phantom demo (usar ESTA — escape hatch 2026-07-30):** `g33Qc6gRALNuj4GHgRXifXMhihTbrVuS24zEv9pB5Ji`  
**Si Sumsub muestra `@….test` (email read-only) → wallet quemada.** No se puede parchear el email vía API Etherfuse. Regenerar:

```bash
cd backend
# Misma wallet g33… (recomendado): solo URL fresca — no imprime secret
node scripts/demo-escape-hatch-wallet.cjs --reuse
# Wallet nueva (Sumsub @….test): SIN --reuse → PUBKEY + ONBOARDING_URL + SECRET (gitignored .demo-wallet.json)
# Phantom: Import Private Key una vez; no compartir; borrar .demo-wallet.json tras import
```

**Wallet quemada (NO usar para KYC):** `5HopANGJo1yjUx8o6RCdt2CCNXqYep23r4fUb2XKtQ5x` · customer `a62ca159-…` · Sumsub `piloto+5hop@remesatia.test`  
**Email onboarding canónico:** `remesatia@gmail.com` (nunca `.test`)  
**Customer/bank demo (escape hatch):** `4969e66e-28c9-4908-b622-5e8f5cdf10fa` / `690a57f3-c597-445e-afa4-2db2e4b40767`  
**Tunnel vivo (BLINKS_BASE_URL):** `https://manufactured-network-commander-sheets.trycloudflare.com` (`/health` **200** verificado 2026-08-03)  
**Mint burn:** `BXTou3CvPxpFVAJvzvEZcAnRLGCHqT1LHKsFTSQft7s` (USDC Etherfuse Devnet — ≠ Circle `4zMMC9…`)

**Decisión 2026-07-30 19:30 CST:** onramp `a46255da-…` se quedó en UI **Processing** / API `funded` >15 min; saldo `BXTou3` = 0. **No esperar más.** Usar **Plan B Demo Day** abajo (guion honesto). Reintentar fondeo solo si Etherfuse marca Completed después.

---

## Plan B Demo Day — sin burn / sin Completed (canónico)

**Usar esto en el pitch si Etherfuse sandbox se atasca (Processing / Unfunded / balance 0).**

### Qué mostrar (60 s)

| Seg | Pantalla | Qué decir |
|-----|----------|-----------|
| 0–15 | WA `Enviar 2000 a mi amor` | Orden confirmada; familia primero. |
| 15–35 | Explorer / `mis envíos` | Comprobante on-chain; Solana audita. |
| 35–50 | Blink Recibir pesos → status | Orden sandbox creada; **Unfunded / Processing** = “pesos en proceso en testnet”. |
| 50–60 | Cierre | “En producción: SPEI automático tras burn. Hoy sandbox Etherfuse; path integrado.” |

### Qué NO decir
- No: “ya llegaron los pesos al banco”.
- No: SPEI mainnet / producción.
- No: insistir Connect en UI Etherfuse si confunde.

### Evidencia técnica ya lograda
- KYC Sumsub sandbox verified (`g33…`)
- Quote offramp ~173 MXN / 10 USDC
- Order offramp + status page
- Onramp MXN 100 → Processing (funds sent)
- Partner-bank fallback en Blink

### Onramp stuck (Buying Token / Processing)

Order ejemplo: https://sandbox.etherfuse.com/ramp/order/a46255da-cb71-49d5-a2af-b1afb3dcf162  
Si no pasa a **Completed** en ~10–15 min → abandonar espera; Plan B.

---


| Qué | URL |
|-----|-----|
| Onboarding (T&Cs + KYC + CLABE) | Wallet g33…: `cd backend && node scripts/demo-escape-hatch-wallet.cjs --reuse` → `ONBOARDING_URL=` (~15 min). Solo sin `--reuse` si hay que mintar wallet nueva (quemada `@….test`) |
| Action | `https://manufactured-network-commander-sheets.trycloudflare.com/api/actions/convertir-mxn` |
| Blink interstitial | `https://frontend-bay-phi-92.vercel.app/blink?url=` + URL-encode del Action |

**Blink listo (tunnel actual):**  
https://frontend-bay-phi-92.vercel.app/blink?url=https%3A%2F%2Fmanufactured-network-commander-sheets.trycloudflare.com%2Fapi%2Factions%2Fconvertir-mxn

### Pasos en el teléfono

1. Abrir **ONBOARDING_URL** fresca en el navegador del phone (misma wallet / completar T&Cs + datos).
2. Abrir **Blink interstitial** en Phantom (o Safari → Phantom).
3. Monto de prueba (ej. `10`) → aprobar. Si aún no hay T&Cs: mensaje ES *Falta aceptar términos…* (OK).
4. Tras T&Cs: order puede devolver `burnTransaction` — firmar en Phantom **solo** si hay balance del mint BXTou3… (ver fondeo abajo).

### Verificado localmente (check)

- [x] Backend `:3000` + Cloudflare quick tunnel → `/health` **200**
- [x] `BLINKS_BASE_URL` = tunnel actual (en `backend/.env`, no commit)
- [x] Webhooks Etherfuse re-registrados (4 eventos) → URL tunnel + `ETHERFUSE_WEBHOOK_SECRET` (4 secrets CSV) en `.env`
- [x] POST webhook sin `x-signature` → **401**
- [x] Beneficiario sync `--use-org-bank`: partner customer/bank + `kyc=verified` en DB; personal org `a62ca159-…` sin bank hasta hosted KYC
- [x] Quote Etherfuse `sourceAsset=BXTou3…` → **200** (partner org + customer demo g33…, 2026-07-30)
- [x] GET `/api/actions/convertir-mxn` vía tunnel → **200**
- [x] POST convertir-mxn (wallet demo) → **400** ES T&Cs (esperado pre-onboarding)
- [x] Order g33… (partner bank) → **400** `Terms and conditions have not been completed…` (bloquea burn hasta KYC phone)
- [x] Order g33… (bank demo personal) → **400** `Proxy account not found` (usar partner bank tras T&Cs)
- [ ] Founder completa T&Cs en phone y reintenta Blink
- [ ] Burn firmado con mint BXTou3… (fondeo sandbox)
- [x] Runbook fondeo BXTou3 (script balance + onramp/swap + plan B status page) — 2026-07-30
- [x] Balance probe g33…: ATA **inexistente**, uiAmount **0**, Etherfuse assets `balance:"0"` (2026-07-30)
- [x] Tunnel `manufactured-network-commander-sheets.trycloudflare.com` + local `:3000` `/health` → **200** (2026-07-30)

### Fondear mint BXTou3… (demo burn) — runbook

Etherfuse sandbox: **no hay faucet** de ese USDC ([docs test-environment](https://docs.etherfuse.com/test-environment)).  
Circle faucet (`faucet.circle.com` → `4zMMC9…`) **no sirve** para este burn.

**Mint:** `BXTou3CvPxpFVAJvzvEZcAnRLGCHqT1LHKsFTSQft7s` (“USDC Etherfuse Devnet”)  
**Wallet demo:** `g33Qc6gRALNuj4GHgRXifXMhihTbrVuS24zEv9pB5Ji`

#### 1) Verificar balance (ATA + assets)

```bash
cd backend
npx tsx scripts/demo-bxTou3-balance.ts g33Qc6gRALNuj4GHgRXifXMhihTbrVuS24zEv9pB5Ji
```

- Lee RPC (`SOLANA_RPC_URL` / devnet) → ATA del mint BXTou3…
- Llama `GET /ramp/assets?blockchain=solana&currency=USD&wallet=…`
- Si balance **0**: imprime siguientes pasos en español (este runbook)

Probe quote/assets genérico:

```bash
npx tsx scripts/demo-quote-assets.ts g33Qc6gRALNuj4GHgRXifXMhihTbrVuS24zEv9pB5Ji
```

#### 2) Fondear (orden preferida)

| Opción | Qué hacer | Docs |
|--------|-----------|------|
| **A. Onramp sandbox** | En dashboard / API sandbox: depósito MXN test → mint BXTou3… a la wallet demo | [Testing Onramps](https://docs.etherfuse.com/) |
| **B. Swap** | Swap desde otro asset sandbox hacia “USDC Etherfuse Devnet” (identifier BXTou3…) | Testing Swaps (Etherfuse) |
| **C. Whitelist** | Pedir a Etherfuse tokens de pago / whitelist del pubkey demo en sandbox | Soporte Etherfuse |

Tras fondear → repetir paso 1 hasta `Balance BXTou3 > 0`.

#### 3) Plan B (balance 0 en el ensayo)

Si el burn no se puede firmar (ATA 0):

1. Founder abre **ONBOARDING_URL** fresca y acepta **T&Cs** + KYC + CLABE (`remesatia@gmail.com`).
2. Blink `convertir-mxn` → quote OK; order puede fallar por T&Cs hasta paso 1, o devolver `burnTransaction` + **`statusPage`**.
3. Guion Demo Day: mostrar **status page** Etherfuse (“pesos en camino”) aunque Phantom no firme el burn aún.
4. No fingir SPEI real sin order; ser honestos: *sandbox, burn pendiente de fondeo*.

### Si ves «Unfunded» / «Selling Token» (sandbox.etherfuse.com)

Eso **no es un fallo raro**: significa “orden creada, todavía no enviamos el token sandbox”.

1. En el Blink ya viste el mensaje: orden lista; falta el USDC sandbox (`BXTou3…`).
2. En Phantom (devnet) importa/conecta la wallet de la orden — Demo Day: `g33Qc6g…B5Ji`.
3. Si esa wallet **no tiene** BXTou3…, la página de Etherfuse seguirá en **Unfunded** y el paso “Token Sent” pendiente. Es esperado.
4. **Demo Day Plan B (honesto):** muestra *Order Created* + *Unfunded* como “pesos en proceso en sandbox” — **no** hace falta Connect en la página de Etherfuse ni fingir SPEI.
5. **Ruta completa:** fondea BXTou3… en `g33…` → Connect en esa página con la misma wallet → “Token Sent” → burn.

No rediseñamos la UI de Etherfuse; el copy claro vive en el Blink + este runbook. Ver también [GUIA-USUARIO-PILOTO.md](./GUIA-USUARIO-PILOTO.md).

#### 4) Onboarding fresco (misma wallet, sin keypair nueva)

```bash
cd backend
# Reusa g33… / .demo-wallet.json — imprime ONBOARDING_URL= (caduca ~15 min). No imprime secret con --reuse.
node scripts/demo-escape-hatch-wallet.cjs --reuse
```

Solo si Sumsub quedó con `@….test` u otra wallet quemada: **sin** `--reuse` (genera keypair nueva — no commitear `.demo-wallet.json`).

### Ops rápido si el tunnel muere

```bash
# Backend detached (WSL session-safe)
bash backend/scripts/_tmp_keep_backend.sh
# Nuevo tunnel + update BLINKS_BASE_URL
bash backend/scripts/_tmp_start_demo_stack.sh
# Re-registrar webhooks al nuevo host
cd backend && npx tsx scripts/demo-register-etherfuse-webhooks.ts "$BLINKS_BASE_URL"
# Pegar CSV en ETHERFUSE_WEBHOOK_SECRET y reiniciar backend
```

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

## Fallback partner org bank (Demo Day)

Si el customer personal (ej. `4969e66e…`) tiene **0 banks** en Etherfuse pero la DB dice `kyc=verified`, `convertir-mxn` ya no corta con SPEI/KYC.

`resolveOfframpIds` (sandbox **siempre**, o `ETHERFUSE_DEMO_USE_ORG_BANK=1`) hace quote/order con:

- customer `3787b9ab-60ab-44c1-b8f8-2e19a6eed707`
- bank `9274aa72-7227-47ce-bbd4-49889e35edad`

Sync DB explícito (opcional, alinea IDs):

```bash
cd backend
npx tsx scripts/demo-sync-etherfuse-beneficiary.ts g33Qc6gRALNuj4GHgRXifXMhihTbrVuS24zEv9pB5Ji --use-org-bank
```

Env:

```bash
ETHERFUSE_DEMO_USE_ORG_BANK=1   # fuerza fallback también fuera de sand.* (raro)
```

## Errores UX (español)

| Causa | Mensaje en Blink |
|-------|------------------|
| 403 / IDs falsos / bank missing (sin fallback) | `No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.` |
| Proxy account not found | `Cuenta bancaria no lista en Etherfuse. Completa CLABE…` |
| Order OK sin `burnTransaction` (create thin; GET enrich) | **200** completed + `link` statusPage + mensaje *Orden lista; falta USDC sandbox (BXTou3…)… Unfunded es normal* — no dead-end 400 |
| T&Cs no aceptados | `Falta aceptar términos en el registro de pesos. Abre el enlace de registro.` |
| NonStableAsset | `Activo no soportado para convertir a pesos. Contacta soporte.` |
| Balance BXTou3 = 0 | Firmar burn falla en wallet → Plan B status page (ver fondeo) |

## Blockers conocidos

- **Sumsub email `@….test` (read-only):** Etherfuse **no** expone PATCH/PUT/DELETE customer email. Soft-delete wallet (`DELETE /ramp/wallet/{id}`) **no** libera el pubkey (sigue 409 → mismo org). Escape: `scripts/demo-escape-hatch-wallet.ts` → wallet nueva + `remesatia@gmail.com`.
- **T&Cs / hosted KYC (g33…):** tras Sumsub verified, `convertir-mxn` usa partner bank vía `resolveOfframpIds` si personal tiene 0 banks. Si order no trae `burnTransaction`, Blink muestra mensaje ES + status page (no SPEI/KYC genérico). Balance BXTou3 ATA = **0** sigue bloqueando firma en Phantom → Plan B status page.
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

```bash
cd backend
npx tsx scripts/demo-register-etherfuse-webhooks.ts https://<tunnel>.trycloudflare.com
# Imprime ETHERFUSE_WEBHOOK_SECRET_CSV — pegar en .env (coma-separados) y reiniciar backend
```

Registro sandbox: `POST /ramp/webhook` body `{ id: uuid, url, eventType }` — un registro por `kyc_updated`, `customer_updated`, `order_updated`, `bank_account_updated`. Guardar cada `secret` en `ETHERFUSE_WEBHOOK_SECRET` (coma-separados). Listar: `POST /ramp/webhooks` con `{}`.

Para ver el webhook KYC: 1) tunnel + secret cargados, 2) onboarding (`onboarding-mxn` o `POST /api/etherfuse/onboarding-url`), 3) completar KYC hosted, 4) llega `kyc_updated` → `kyc_status=verified`. POST sin `x-signature` → 401.

