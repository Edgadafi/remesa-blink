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
| `enviar` / “quiero mandar dinero” | Flujo guiado |
| `Enviar 2000 a mi amor` | One-shot: monto + nombre; pide frecuencia |
| `mis envíos` | Lista con alias (`a mi amor`) |
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

## Demo Day WayLearn (~3 min / ideal &lt;60 s) — dos pilares

### Pre-requisitos (5 min antes)

```bash
docker compose up -d && npm run db:schema   # si usas Postgres local
npm run demo:preflight
npm run keeper:run-once   # opcional: un pago listo en logs
```

Keeper con SOL devnet (`npm run keeper:airdrop` si hace falta).  
Off-ramp phone: [docs/OFFRAMP-DEMO-DAY.md](./docs/OFFRAMP-DEMO-DAY.md) — wallet **`g33Qc6g…`** (no `5Hop…`), email `remesatia@gmail.com`.

### Guión corto (&lt;60 s) — preferido para inversionistas

| Seg | Qué mostrar | Qué decir |
|-----|-------------|-----------|
| **0–15** | Problema | Cola OXXO, 4–7%, mamá rural sin saber si llegó. |
| **15–35** | WA | `Enviar 2000 a mi amor` → **Orden confirmada** (nombre, no código). |
| **35–50** | Aviso / Explorer | Ella recibe WhatsApp; comprobante on-chain = confianza. |
| **50–60** | Blink pesos | **Recibir pesos** → status Etherfuse. Si **Unfunded/Processing**: Plan B — *“sandbox: orden lista / pesos en proceso”* ([OFFRAMP Plan B](./docs/OFFRAMP-DEMO-DAY.md)). Sin inventar SPEI. |

### Guión Demo Day extendido (3:00)

| Tiempo | Qué mostrar | Qué decir |
|--------|-------------|-----------|
| **0:00–0:30** | Problema | Madre en Michoacán; remitente en Texas programa una vez. |
| **0:30–1:00** | WA / hub | `enviar` one-shot **o** `/piloto` + `/nueva-remesa`. |
| **1:00–1:45** | Crear remesa | Nombre `mi amor`; mask wallet; Explorer solo aquí. |
| **1:45–2:15** | Keeper | Receipt PDA + Blink URL. |
| **2:15–2:40** | Blink pesos | `convertir-mxn` sandbox Etherfuse. Sin API: metadata + WA. **No** Bitso live. |
| **2:40–3:00** | Cierre + capital | Receipt = reputación. Roadmap: paymaster → SPEI mainnet → yield. Grants SF primero ([CAPITAL-PIPELINE](./docs/CAPITAL-PIPELINE.md)). |

Alias técnico (evitar en pitch): `/recurrente …`.

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
- [ ] Pitch / capital: [docs/PITCH-TRUST-LAYER.md](./docs/PITCH-TRUST-LAYER.md) · [docs/CAPITAL-PIPELINE.md](./docs/CAPITAL-PIPELINE.md)

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
| Capital / grants | [docs/CAPITAL-PIPELINE.md](./docs/CAPITAL-PIPELINE.md) |
| Métricas | [docs/METRICAS-DEMO-DAY.md](./docs/METRICAS-DEMO-DAY.md) |
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
| Túnel Cloudflare muerto | Preferir local; o regenerar tunnel + `BLINKS_BASE_URL` |
| Sumsub email `@….test` | Wallet quemada — escape hatch `g33Qc6g…` ([OFFRAMP](./docs/OFFRAMP-DEMO-DAY.md)) |
| USDC E2E falla | `npm run keeper:usdc-balance` |
| Matar `tsx` a ciegas | **No** — mata backend + bot a la vez |
