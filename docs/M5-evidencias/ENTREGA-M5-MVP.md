# Entrega Milestone 5 — MVP funcional (devnet)

**Programa:** WayLearn Solana Latam Labs · Remesa Blink  
**Deadline GitBook:** viernes **21 ago 2026** · **Meta interna:** **20 ago 2026**  
**Checkpoint:** mié **19 ago** 13:00 CDMX  
**Cluster:** Solana **devnet** (no mainnet)  
**M4:** insignia recibida · feedback mentors → [MENTOR-FEEDBACK-M4.md](../MENTOR-FEEDBACK-M4.md)  
**Números piloto:** **9** (meta **10** en prospección — [PIPELINE-CUANTITATIVO.md](../PIPELINE-CUANTITATIVO.md))

Fuente criterios: [Milestones](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/milestones.md) · [Programa semanal](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/programa-semanal.md)

---

## Límites de comunicación (mentor Isaac — honestidad)

| Decimos / mostramos | No decimos |
|---------------------|------------|
| MVP **devnet**; Blinks; keeper; Receipt PDA | “Producción mainnet” |
| Off-ramp Etherfuse **sandbox** · Plan B | “SPEI listo en mainnet” |
| **9** pilotos en waitlist (10º en prospección); ICP profundas en curso | “Validación campo cerrada al 100%” |
| PROVA = capa auditoría **opcional** del agente | Demo centrada en PROVA |

Detalle PROVA: [PROVA-AUDIT-LAYER.md](../PROVA-AUDIT-LAYER.md). Entrevistas: [ENTREVISTAS-ICP-PLAN.md](../ENTREVISTAS-ICP-PLAN.md).

---

## Links obligatorios (GitBook)

| Entregable | Link |
|------------|------|
| **Repositorio público** | https://github.com/Edgadafi/remesa-blink |
| **MVP en Devnet (criterio 2)** | **Blink URL** (abajo) — escena de marca: `/demo` |
| **Escena marca** | https://holatia.app/demo |
| **Piloto** | https://holatia.app/piloto |
| **Backup flujo sin WhatsApp** | https://holatia.app/nueva-remesa |
| **Video Demo (≤2 min)** | [RemesaBlink-Demo-M5.mp4](./RemesaBlink-Demo-M5.mp4) (~1:46, 1080p + **VO narrado**) — [VIDEO-DEMO-M5-GUION.md](./VIDEO-DEMO-M5-GUION.md) |
| **Program ID** | `B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2` |
| **Explorer tx ref.** | https://explorer.solana.com/tx/3wgXLQaibVWuAX2cB6qEc52FJjwtfifdFKq2w6bfD5Lj3YjYnRQPcqDwFNJhZcMNz1ZE4uNNoRMZQQxtKrAbf9zM?cluster=devnet |

README runnable: raíz del repo ([README.md](../../README.md) § MVP en Devnet).

### Criterio 2 — texto para pegar en Drive (canónico)

> **MVP link (Solana Devnet):** Solana Action HTTPS en holatia.app  
> `https://holatia.app/api/actions/enviar-remesa-usdc`  
> Inspector: `https://www.blinks.xyz/inspector?url=` + esa URL  
> UI: `https://holatia.app/blink?url=` + encodeURIComponent(Action)  
>  
> **Escena de marca:** https://holatia.app/demo · QR: https://holatia.app/empezar  
>  
> **Cluster:** Solana **devnet** · Program `B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2`  
> **Comprobante:** Explorer tx de referencia (arriba)  
> **Off-ramp:** Etherfuse **sandbox** — Plan B (Unfunded/Processing = pesos en camino). No SPEI mainnet.  
> **Canal humano:** escanear QR en `/demo` o `/empezar` → WhatsApp (`hola` → `enviar`). No es el link del criterio 2.

```text
https://holatia.app/api/actions/enviar-remesa-usdc
```

Inspector: `https://www.blinks.xyz/inspector?url=` + encodeURIComponent(Action HTTPS).  
UI local: `/blink?url=` + encodeURIComponent(Action HTTPS).

---

## Criterios MVP — estado

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Flujo de usuario claro | Cumple | WA NLU (`enviar` / one-shot) + web `/nueva-remesa` + `/piloto` |
| Frontend ↔ Backend | Cumple | Next.js Vercel → API Express (local/túnel) + `POST /api/pilotos` |
| Integración Solana demostrable | Cumple | Anchor `remesas_recurrentes` en devnet; Blinks; keeper; receipts |
| Funcional y probado | Cumple | `npm run demo:preflight` · `npm run e2e:sol` / keeper smoke |
| Video ≤2 min narrado | Cumple (pack) | [RemesaBlink-Demo-M5.mp4](./RemesaBlink-Demo-M5.mp4) ~1:46 · 1080p · VO ES |

---

## Cómo probar (revisor / mentor)

### Opción A — Web (sin bot)

1. Abrir https://holatia.app/nueva-remesa  
2. Completar remesa de prueba (monto pequeño, wallet dest válida).  
3. Confirmar en UI; si API pública no alcanza backend local, usar Opción B/C.

### Opción B — WhatsApp local

```bash
cd ~/remesa-blink
npm run dev          # API :3000
cd bot && npm start  # WA :3002 — whatsappConnected true
npm run demo:preflight
```

En el chat del bot: `hola` → `enviar` **o** `Enviar 2000 a mi amor` → confirmar → ver **Orden confirmada** → Explorer.

### Opción C — E2E sin UI

```bash
npm run e2e:sol
# o
npm run keeper:smoke
```

Anotar signature en [METRICAS-DEMO-DAY.md](../METRICAS-DEMO-DAY.md) y abajo.

---

## Tx de referencia (devnet) — E2E SOL 2026-08-13

| Campo | Valor |
|-------|--------|
| Fecha | 2026-08-13 |
| Registro (create) | `4KXPMHCvNqJ6nCccP6zVER2tNsYZiMTweAh5yMgyeXeJgpC5CXfMv9EnuuEf39xrgk65hEqzrmpvqGsFhS8Zw1Nr` |
| Pago keeper SOL | `3wgXLQaibVWuAX2cB6qEc52FJjwtfifdFKq2w6bfD5Lj3YjYnRQPcqDwFNJhZcMNz1ZE4uNNoRMZQQxtKrAbf9zM` |
| Receipt PDA | `H3LLspuoiMQNCWypgT61JWmuFj3X8DdqbMmL4G9cjgh3` |
| Suscripción | `d25b883c-4849-4163-96ed-4dd0aa203433` |
| Explorer pago | https://explorer.solana.com/tx/3wgXLQaibVWuAX2cB6qEc52FJjwtfifdFKq2w6bfD5Lj3YjYnRQPcqDwFNJhZcMNz1ZE4uNNoRMZQQxtKrAbf9zM?cluster=devnet |
| Preflight | `bash scripts/ensure-preflight.sh` → **PREFLIGHT OK** (API+DB+bot+keeper). Si WA `whatsappConnected=false`, demo con `/nueva-remesa`. |

Keeper USDC smoke (misma fecha): `5V1Q956CF8wN2QpwjNRk6a2QFavtoWm3SGpt23nvZYjx9vusVTTx2dQ5MzVJNkm9a1hQ7mtwFvsNzCw1tQkJE6r6`.

---

## Off-ramp (Plan B — honestidad)

Etherfuse **sandbox**. Si status = Unfunded / Processing:

> “Sandbox: orden lista / pesos en camino.”

**Nunca** afirmar SPEI mainnet. Detalle: [OFFRAMP-DEMO-DAY.md](../OFFRAMP-DEMO-DAY.md).

---

## Pack Drive

Carpeta: `M5-MVP-funcional-ago-2026/`  
Checklist subida: [M5-UPLOAD-DRIVE.md](../M5-UPLOAD-DRIVE.md)

Contenido mínimo:

1. Este archivo (`ENTREGA-M5-MVP.md`)
2. `RemesaBlink-Demo-M5.mp4` (≤2 min, 1080p, audio)
3. Screenshots en `screenshots/` (orden WA o web + Explorer + Blink/status)
4. Enlace o copia del README § MVP
5. Opcional mentors: [PIPELINE-CUANTITATIVO.md](../PIPELINE-CUANTITATIVO.md) · [MENTOR-FEEDBACK-M4.md](../MENTOR-FEEDBACK-M4.md)

---

## Discord (aviso post-Drive)

Ver plantilla en [M5-UPLOAD-DRIVE.md](../M5-UPLOAD-DRIVE.md).

---

## Fuera de scope M5

Mainnet, SPEI producción, pitch deck completo (→ **M6** 25 ago), presentación viva (→ **M7** 31 ago).
