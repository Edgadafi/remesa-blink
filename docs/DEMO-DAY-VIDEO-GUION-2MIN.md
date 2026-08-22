# Video Demo Day — Guion 2 min (1080p + audio)

**Formato WayLearn:** demo ≤ **2:00** · **1920×1080** · MP4 · audio narrado claro  
**Marca en pantalla:** **holatia / TIA** (familia primero; Solana como comprobante)  
**Cluster:** Solana **devnet** · Program `B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2`  
**Archivo Drive sugerido:** `Holatia-Demo-Day-2min.mp4`  
**Build automático (stills + VO):** `bash scripts/build-demo-day-video.sh` → `docs/M5-evidencias/Holatia-Demo-Day-2min.mp4`

---

## Antes de grabar (preflight 5 min)

```bash
bash scripts/start-demo-stack.sh   # backend + bot
npm run demo:preflight
```

**Pestañas abiertas (screen-record live):**

| # | URL | Para qué |
|---|-----|----------|
| 1 | https://holatia.app/demo | QR + preview Blink (proyector) |
| 2 | WhatsApp → TIA | Flujo `enviar` one-shot |
| 3 | https://explorer.solana.com/?cluster=devnet | Tx del keeper / suscripción |
| 4 | https://holatia.app/blink?url=… | Action USDC (opcional) |
| 5 | Blink **Recibir pesos** / status Etherfuse | Plan B sandbox |

**Backup si WA cae:** https://holatia.app/nueva-remesa

**Reglas honestas (no inventar):**

- Decir **devnet** y **sandbox** cuando aplique.
- Plan B Etherfuse: *“orden lista / pesos en proceso”* — nunca “ya llegó al banco”.
- Números piloto: solo los de [PIPELINE-CUANTITATIVO.md](./PIPELINE-CUANTITATIVO.md).

**Captura:** OBS o CapCut screen record · 1920×1080 · 30 fps · zoom UI 125–150% · ocultar QR de auth y claves.

---

## Shot list — 120 segundos

### ACTO 1 — Problema (0:00–0:18)

| Tiempo | Visual | Audio (VO) |
|--------|--------|------------|
| **0:00–0:06** | B-roll: fila OXXO / tiendita (stills `docs/brand/video-guia-s2-fila.png`) o título sobre fondo tierra | *“Cada mes, millones de familias en EE.UU. mandan a México.”* |
| **0:06–0:12** | Texto overlay: **cola · comisión · ¿ya llegó?** | *“Cola en la tiendita, comisión opaca, y mamá sin saber si este mes sí llegó el dinero.”* |
| **0:12–0:18** | Logo holatia / TIA (`video-guia-s1-portada.png` o `/intro`) | *“holatia es TIA en WhatsApp: programas la remesa una vez; tu familia recibe aviso.”* |

**On-screen (opcional):** subtítulo ES · sin jerga DeFi.

---

### ACTO 2 — Flujo usuario WA (0:18–0:55)

| Tiempo | Visual | Audio (VO) |
|--------|--------|------------|
| **0:18–0:28** | `holatia.app/demo` → escaneo QR → chat WA abre con *hola* | *“Escaneas el QR en holatia.app. Se abre WhatsApp con TIA.”* |
| **0:28–0:40** | Usuario escribe: **`Enviar 300 a mi amor`** → bot pide frecuencia → **`cada mes`** | *“Escribes como en el chat: enviar trescientos a mi amor, cada mes. Sin menús complicados.”* |
| **0:40–0:48** | WA destinatario + wallet (código de su app) → **⏳ Programando…** | *“Confirmas a quién va, su WhatsApp y el código de su app de dinero.”* |
| **0:48–0:55** | **✅ Orden confirmada** — *A mi amor (+52…)* · *$300 · cada mes* | *“Orden confirmada. Ves el nombre de tu familia, no una dirección críptica.”* |

**Demo tip:** usar one-shot; no mostrar `/recurrente` ni comandos slash.

---

### ACTO 3 — Integración Solana (0:55–1:35)

| Tiempo | Visual | Audio (VO) |
|--------|--------|------------|
| **0:55–1:08** | Keeper corre / log “pago enviado” **o** `npm run keeper:run-once` | *“Un keeper en devnet ejecuta el pago recurrente on-chain, sin que tú vuelvas a la fila.”* |
| **1:08–1:22** | Explorer devnet: tx + **Program ID** + cuenta PDA / receipt | *“Cada envío deja comprobante en Solana: verificable, barato, en segundos. Programa Anchor en devnet.”* |
| **1:22–1:35** | WhatsApp **aviso a la receptora** (`video-guia-s5-aviso-wa.png` o live) + **mis envíos** con alias | *“Ella recibe aviso por WhatsApp. Tú consultas mis envíos con el mismo apodo: mi amor.”* |

**Solana beats obligatorios (jurado WayLearn):**

1. Program ID visible ≥3 s  
2. Tx firmada en Explorer  
3. Blink / Action como capa de composabilidad (siguiente acto)

---

### ACTO 4 — Blink + pesos (1:35–1:52)

| Tiempo | Visual | Audio (VO) |
|--------|--------|------------|
| **1:35–1:44** | Preview Blink en `/demo` o Inspector → **Enviar remesa USDC** | *“El mismo flujo vive como Solana Blink: un enlace que cualquier wallet puede abrir.”* |
| **1:44–1:52** | Blink **Recibir pesos** → status Etherfuse (Unfunded/Processing OK) | *“Para retirar pesos, la familia abre el enlace. Hoy en sandbox Etherfuse: orden lista, pesos en proceso.”* |

**Plan B (si sandbox falla):** congelar frame de status + VO anterior; no cortar el video.

---

### ACTO 5 — Cierre + CTA (1:52–2:00)

| Tiempo | Visual | Audio (VO) |
|--------|--------|------------|
| **1:52–2:00** | `holatia.app/piloto` + end card (`video-guia-s6-endcard.png`) | *“Buscamos diez familias piloto MX–US. holatia.app slash piloto. TIA en WhatsApp, Solana debajo.”* |

---

## Guión VO completo (lectura continua ~115 s)

> Cada mes, millones de familias en EE.UU. mandan a México.  
> Cola en la tiendita, comisión opaca, y mamá sin saber si este mes sí llegó el dinero.  
> holatia es TIA en WhatsApp: programas la remesa una vez; tu familia recibe aviso.  
> Escaneas el QR en holatia.app. Se abre WhatsApp con TIA.  
> Escribes como en el chat: enviar trescientos a mi amor, cada mes. Sin menús complicados.  
> Confirmas a quién va, su WhatsApp y el código de su app de dinero.  
> Orden confirmada. Ves el nombre de tu familia, no una dirección críptica.  
> Un keeper en devnet ejecuta el pago recurrente on-chain, sin que tú vuelvas a la fila.  
> Cada envío deja comprobante en Solana: verificable, barato, en segundos. Programa Anchor en devnet.  
> Ella recibe aviso por WhatsApp. Tú consultas mis envíos con el mismo apodo.  
> El mismo flujo vive como Solana Blink: un enlace que cualquier wallet puede abrir.  
> Para retirar pesos, la familia abre el enlace. Hoy en sandbox Etherfuse: orden lista, pesos en proceso.  
> Buscamos diez familias piloto MX–US. holatia.app slash piloto. TIA en WhatsApp, Solana debajo.

**Locución:** español neutro LATAM · ~130–140 palabras/min · pausas en “Orden confirmada” y Explorer.

---

## Especificaciones de export

| Campo | Valor |
|-------|--------|
| Resolución | **1920×1080** (16:9 horizontal Demo Day) |
| FPS | 30 |
| Video codec | H.264 (libx264), yuv420p |
| Audio | AAC 48 kHz · pico **−6 a −3 dB** · voz por encima de música |
| Música | Opcional: bed instrumental bajo (−18 dB), sin tapar VO |
| Duración máx. | **2:00** (cortar silencios intro/outro) |
| Nombre archivo | `Holatia-Demo-Day-2min.mp4` |

---

## Dos modos de producción

### A — Rápido (stills + VO, sin WA live)

```bash
bash scripts/build-demo-day-video.sh
cp docs/M5-evidencias/Holatia-Demo-Day-2min.mp4 /mnt/c/Users/edgar/Downloads/
```

Usa assets en `docs/brand/` + QR WA. Ideal entrega GitBook hoy.

### B — Premium (screen-record live + VO en CapCut)

1. Grabar ACTO 2–4 en una sola sesión (OBS, 1080p).  
2. Importar VO (grabación humana o TTS).  
3. B-roll ACTO 1 y 5 desde `docs/brand/`.  
4. Subtítulos ES; revisar ortografía *holatia*, *Solana*, *devnet*.  
5. Export CapCut → copiar a Drive carpeta `WayLearn-Demo-Day-2026/`.

---

## Checklist post-export

- [ ] Duración ≤ 2:00  
- [ ] 1080p confirmado (propiedades del archivo)  
- [ ] VO audible en laptop sin auriculares  
- [ ] Flujo: problema → WA → orden → Explorer → aviso → Blink → piloto  
- [ ] Menciona **devnet** + **sandbox**  
- [ ] No afirma SPEI mainnet ni KPIs inventados  
- [ ] Subido a Drive + link en entrega WayLearn  

Referencias: [DEMO.md](../DEMO.md) · [DEMO-DAY-RUNBOOK.md](./DEMO-DAY-RUNBOOK.md) · [MVP-LINK-BLINK.md](./M5-evidencias/MVP-LINK-BLINK.md)
