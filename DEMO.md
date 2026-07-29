# Demo Remesa Blink — Mentora marketing + Demo Day WayLearn

**Milestone:** validación narrativa + MVP demostrable (rumbo a Demo Day **31 ago 2026**).

---

## Mentora marketing (~8–10 min) — familia primero, crypto segundo

**Objetivo:** empatía, ICP, funnel, ask de intro a 1 familia / tiendita piloto.  
**No abrir** Explorer, Phantom jerga, ni PDF de arquitectura salvo que pregunte.

### Preflight (5 min antes)

Preferir **stack local** (no depender de `*.trycloudflare.com`):

```bash
# Terminal 1 — backend
cd ~/remesa-blink/backend && npm run dev

# Terminal 2 — bot (QR si hace falta)
cd ~/remesa-blink/bot && npm start

# Terminal 3 — opcional frontend local
cd ~/remesa-blink/frontend && npm run dev
```

Checks rápidos:

```bash
npm run demo:preflight
# o manual:
curl -s localhost:3000/health   # database ok; bot ok si BOT_INTERNAL_URL
curl -s localhost:3002/health   # whatsappConnected: true
npm run keeper:smoke
```

**Si la mentora ve URLs públicas:** frontend Vercel abajo. Si API en túnel: regenerar solo si hace falta y actualizar `NEXT_PUBLIC_API_URL` (la URL cambia).

**Backup si el bot no está vinculado:** formulario web `/nueva-remesa` en Vercel o `localhost:3003`.

### Guión mentora

| Min | Mostrar | Decir |
|-----|---------|--------|
| **0–1** | Problema (sin slides) | Cola OXXO, comisión, mamá rural sin saber si llegó el dinero este mes. |
| **1–3** | `/piloto` en Vercel | “Envía dólares, retira pesos cerca de ti.” Meta: **10 familias** piloto. CTA claro. |
| **3–5** | Hub o WhatsApp | WA: `hola` → `enviar` (flujo guiado) **o** hub → “Enviar a mi familia” / web. |
| **5–7** | Aviso / `mis envíos` | Ella recibe WhatsApp; él no tiene que recordar cada mes. Comprobante = confianza (no “DeFi”). |
| **7–8** | Growth | Funnel reel → bio UTM → `/piloto` ([docs/GROWTH-SGE.md](./docs/GROWTH-SGE.md)). |
| **8–10** | Ask | Feedback ICP + **1 intro** a familia o tiendita piloto. Leave-behind: [docs/MENTOR-MARKETING-ONEPAGER.md](./docs/MENTOR-MARKETING-ONEPAGER.md). |

### Frases WhatsApp (NLU natural)

| Usuario escribe | Qué pasa |
|-----------------|----------|
| `hola` / `menú` | Menú amigable |
| `enviar` / “quiero mandar dinero” | Flujo guiado: monto → frecuencia → WA familia → wallet destino |
| `mis envíos` | Lista de suscripciones |
| `recompensas` / `cashback` | Estado cashback |
| `soporte` | Contacto / ayuda |
| `/recurrente …` | Alias técnico (evitar en pitch marketing) |

Alias slash siguen vivos para demos técnicas.

### Números / wallets de ensayo

Anotar **antes** de la call (rellenar tras ensayo seco):

| Campo | Valor |
|-------|--------|
| Número del bot (WA) | Pendiente re-QR (`whatsappConnected: false` al ensayo) |
| Wallet destino prueba | `BRjpPywx2GiDAjnyCEiBgH3jZNseWHRLmFGU6kW128pK` |
| Fecha ensayo | `2026-07-28T02:53:57Z` |
| Canal usado | API / backup web (`POST /api/suscripciones`) — id `ad403dbf-…` |
| Notas | WA no vinculado → demo mentora con `/piloto` + `/nueva-remesa` |

Detalle: [docs/DEMO-ENSAYO.md](./docs/DEMO-ENSAYO.md).

---

## Demo Day WayLearn (~3 min) — MVP E2E + Solana visible

### Pre-requisitos (5 min antes)

```bash
docker compose up -d && npm run db:schema   # si usas Postgres local
npm run demo:preflight
npm run keeper:run-once   # opcional: un pago listo en logs
```

Keeper con SOL devnet (`npm run keeper:airdrop` si hace falta).  
USDC opcional: `npm run keeper:usdc-ata` + `npm run keeper:usdc-balance`.

### Guión Demo Day (3:00)

| Tiempo | Qué mostrar | Qué decir |
|--------|-------------|-----------|
| **0:00–0:30** | Problema | "Madre en Michoacán recibe remesa cada mes: colas OXXO, INE, comisiones. Remitente en Texas programa una vez; ella recibe aviso en WhatsApp." |
| **0:30–1:00** | Frontend / hub | Vercel o `:3003`. Inicio → Nueva remesa / Mis remesas. **O** WA `enviar` (NLU). |
| **1:00–1:45** | Crear remesa | Formulario web **o** bot guiado. Monto mínimo. Mostrar tx Explorer **solo aquí** (~30–45 s proof). |
| **1:45–2:15** | Keeper | `npm run keeper:run-once`. Log: **Receipt PDA** + tx + Blink URL. |
| **2:15–2:30** | Composabilidad | Explorer: `PagoReceipt` + `PerfilRemitente`. API: `curl localhost:3000/api/composability/perfil/<wallet>`. |
| **2:30–2:45** | Blink pesos | Si USDC + KYC: abrir `convertir-mxn` → “pesos en tu cuenta”. Guión: [docs/OFFRAMP-DEMO-DAY.md](./docs/OFFRAMP-DEMO-DAY.md). Sin API Etherfuse: mostrar GET metadata + WA. **No** Bitso en vivo. |
| **2:45–3:00** | Cierre | "Cada pago deja receipt on-chain = reputación portable." Stack: Anchor, Actions, keeper. |

Alias técnico (si hace falta): `/recurrente 0.001 SOL diario 5215512345678 <wallet_destino>`.

### Atajos E2E (sin UI)

```bash
npm run e2e:sol    # SOL completo
npm run e2e:usdc   # USDC + keeper (requiere USDC en keeper)
```

---

## Checklist WayLearn (MVP)

- [ ] Flujo usuario claro (web + WA)
- [ ] Frontend ↔ Backend conectados
- [ ] Integración Solana (Anchor + Blinks + devnet)
- [ ] Probado E2E (SOL mínimo; USDC deseable)
- [ ] Composabilidad: receipt + perfil visibles en Explorer o API `/api/composability/perfil/:wallet`
- [ ] Early adopter: **1 familia real** (receptora rural + remitente EE.UU.) en `usuarios_piloto`
- [ ] Persona: [docs/PERSONA-MX-US.md](./docs/PERSONA-MX-US.md)
- [ ] Sprint Demo Day: [docs/SPRINT-DEMO-DAY.md](./docs/SPRINT-DEMO-DAY.md)

---

## URLs útiles

| Recurso | URL |
|---------|-----|
| **Frontend prod (Vercel)** | https://frontend-bay-phi-92.vercel.app |
| **Piloto** | https://frontend-bay-phi-92.vercel.app/piloto |
| **Nueva remesa (backup)** | https://frontend-bay-phi-92.vercel.app/nueva-remesa |
| Frontend local | http://localhost:3003 |
| API / Blinks local | http://localhost:3000 |
| Bot health | http://localhost:3002/health |
| actions.json | http://localhost:3000/actions.json |
| Explorer devnet | https://explorer.solana.com/?cluster=devnet |
| Program ID | `B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2` |
| Composabilidad API | http://localhost:3000/api/composability/perfil/\<wallet\> |
| One-pager mentora | [docs/MENTOR-MARKETING-ONEPAGER.md](./docs/MENTOR-MARKETING-ONEPAGER.md) |
| Growth / UTM | [docs/GROWTH-SGE.md](./docs/GROWTH-SGE.md) |
| Off-ramp pesos (Etherfuse sandbox) | [docs/OFFRAMP-DEMO-DAY.md](./docs/OFFRAMP-DEMO-DAY.md) |
| Docs composable | [docs/COMPOSABILITY.md](./docs/COMPOSABILITY.md) |

**No depender de** `remesablink.com` (aún no live) ni de túnel Cloudflare Quick Tunnel para la mentora.

---

## Deploy público (opcional)

Ver [DEPLOY.md](./DEPLOY.md). Variables críticas: `BASE_URL`, `BLINKS_BASE_URL`, `DATABASE_URL`, `KEEPER_PRIVATE_KEY`, `RUN_KEEPER=true`.

Tras deploy, registrar Blinks en [Dialect registry](https://www.blinks.xyz/inspector) para unfurl en X.

---

## Troubleshooting demo

| Síntoma | Fix |
|---------|-----|
| Preflight FAIL | `npm run demo:preflight` y leer WARN/FAIL |
| Keeper no paga | `proximo_pago` vencido; SOL/USDC en keeper |
| Blink CORS | Backend en `:3000` con `actionCorsMiddleware` |
| Bot no notifica | `BOT_INTERNAL_URL=http://localhost:3002` en backend `.env` |
| `whatsappConnected: false` | Re-QR en terminal bot; **backup** `/nueva-remesa` |
| Túnel Cloudflare muerto | Preferir local; o regenerar `npm run tunnel:quick` + `NEXT_PUBLIC_API_URL` |
| USDC E2E falla | `npm run keeper:usdc-balance` |
| Matar `tsx` a ciegas | **No** — mata backend + bot a la vez |
