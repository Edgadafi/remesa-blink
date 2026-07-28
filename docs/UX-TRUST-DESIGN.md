# UX de confianza — RemesaBlink

**Fuente:** Sesión WayLearn con Pauline Moon · Solana Latam Labs · 15 jul 2026  
**Principio rector (Diana Torres):** *Nosotros estamos vendiendo confianza.*

Aplica a: landing `/piloto`, bot WhatsApp, página intermedia Action (M4), Blinks, notificaciones receptora.

Referencias visuales (capturas sesión): `assets/*Pauilnesession*.png` en workspace Cursor.

---

## Las 7 lecciones → RemesaBlink

| # | Lección (Pauline) | Implicación RemesaBlink |
|---|-------------------|-------------------------|
| 01 | **Value first** — muestra valor antes del wallet | Landing y WA: “Tu mamá recibe aviso cada mes” antes de “conecta Phantom” |
| 02 | **Hide the blockchain** — outcomes, not transactions | Copy: “Envío de $300 a María” — nunca “Approve tx 0x…” en pantallas usuario |
| 03 | **Same action, two screens** — human vs raw tx | Blink/Action: monto grande, destinatario por nombre, total claro; ocultar instrucciones Anchor |
| 04 | **Loading & error states ARE the app** | 3 s sin feedback = “se perdió mi dinero”; diseñar pending/timeout/rechazo |
| 05 | **Pending · Confirmed · Failed — all designed** | Tres estados por flujo: programar remesa, ejecutar pago, reclamar/convertir |
| 06 | **Trustworthy on screen** — fees, tiempo, progreso | Mostrar monto, comisión, tiempo estimado, “PRIVATE SEND IN PROGRESS” equivalente |
| 07 | **Trust is a design job** — confirmaciones grandes, microcopy | Números grandes, un CTA primario, una frase tranquilizadora por pantalla |

---

## Mapa de pantallas y estados

### A. Remitente — WhatsApp (`/recurrente`)

| Estado | Hoy | Diseño objetivo (M4) |
|--------|-----|----------------------|
| **Pending** | “Enviando…” implícito | “Estamos programando tu remesa de **$300** para **María**…” |
| **Confirmed** | Bloque texto con tx | “✅ Listo. Cada **15 días** enviaremos **$300 USDC**. Tu familia recibirá aviso.” + `/mis-remesas` |
| **Failed** | `Error: …` API | “No se pudo programar. **Tu dinero no se movió.** Escríbenos o intenta de nuevo.” |

**Reglas:** no mostrar `tx_signature` como dato principal; link Explorer en “Ver comprobante (opcional)”.

---

### B. Receptora — WhatsApp (post-pago)

| Estado | Hoy (`notificaciones.ts`) | Diseño objetivo |
|--------|---------------------------|-----------------|
| **Pending** | No existe | “Tu familia te envió **$300**. Estamos preparando tu link…” (keeper procesando) |
| **Confirmed** | “Remesa recibida… 🔗 Para reclamar” | “✅ **Recibiste $300** de [nombre hijo]. Toca para ver en tu celular (2 min).” |
| **Failed** | Silencio si bot cae | “Hubo un problema con el aviso. Tu envío **sí llegó** — contacta tiendita aliada o [soporte].” |

**Microcopy (lección 07):** una frase tranquilizadora — *“Es el mismo link que te manda tu hijo; no es spam.”*

---

### C. Receptora — Landing Action / Blink (M4 — pendiente)

Página intermedia §4.3 `ARCHITECTURE-M3.md`: 3 pasos + QR + tiendita.

| Estado | Diseño |
|--------|--------|
| **Pending** | “Esperando tu wallet…” + barra progreso + “No cierres esta pantalla” |
| **Confirmed** | “✅ **$300 USDC** en tu wallet” o “MXN en camino (~15 min)” — botón Done |
| **Failed** | “No se completó — **tu dinero está seguro**” + Try again + WhatsApp tiendita |

**Human screen (lección 03):**

```
Enviando a: Mamá (Michoacán)
$300.00 USDC
Comisión: incluida
Tiempo: ~2 minutos
[ Recibir en mi celular ]
```

**Evitar:** “Signature request”, “Instruction #1”, direcciones completas en titular.

---

### D. Landing `/piloto`

| Lección | Aplicación |
|---------|------------|
| Value first | Hero = outcome familiar; wallet no aparece en hero |
| Trust | Pasos 1–3 ya orientados a agente → auditoría → familia (i18n jul 2026) |
| Loading | Form: “Enviando…” → success 48 h (hecho); mejorar error con next step |
| Confirmación | Monto meta piloto visible (`{n}/10 familias`) |

---

### E. App web (`FormNuevaRemesa`) — dev/demo

| Gap | Acción M4 |
|-----|-----------|
| Solo “Enviando…” / error genérico | Estados Pending / Confirmed / Failed con copy humano |
| Phantom connect técnico | “Conectar wallet” → “Verificar que eres tú” |

---

## Checklist pre–Demo Day

- [ ] Cada flujo tiene **3 pantallas diseñadas** (pending, ok, error)
- [ ] Montos en **$** o MXN legible; crypto secundario
- [ ] **Un CTA primario** por pantalla (verde/dorado brand)
- [ ] Errores con **next step** (retry, WA soporte, tiendita)
- [ ] Banner **“Remesa en proceso”** si hay delay >3 s (receptora)
- [ ] Explorer/link técnico **colapsado** (“Ver detalle técnico”)
- [ ] Probar copy con **receptora no crypto** (M4 entrevistas)

---

## Copy banco (ES) — listo para implementar

### WA — suscripción confirmada (remitente)

```
✅ Remesa programada

Cada 15 días enviaremos $300 a tu familia en México.
Ellos recibirán un aviso por WhatsApp — tú no tienes que recordar.

Ver mis remesas: /mis-remesas
```

### WA — remesa recibida (receptora)

```
✅ Remesa de tu familia

Recibiste $300 USDC (~$5,100 MXN aprox.).

Toca el link para verlo en tu celular (toma 2 minutos):
[link]

¿Dudas? Pregunta en la tiendita de confianza o responde AYUDA.
```

### Error — firma rechazada (Blink)

```
No se completó el envío

Tu dinero sigue seguro. Puedes intentar de nuevo o pedir ayuda
en la tiendita aliada.

[ Intentar de nuevo ]
```

---

## Relación con arquitectura

| Capa técnica | Capa UX (usuario ve) |
|--------------|----------------------|
| `registrar_suscripcion` | “Programamos tu remesa” |
| Keeper cron | “Envío automático en curso” (banner) |
| `PagoReceipt` PDA | “Comprobante disponible” (link opcional) |
| Etherfuse SPEI | “Pesos en camino a tu cuenta (~15 min)” |

Ver también: [PITCH-TRUST-LAYER.md](./PITCH-TRUST-LAYER.md), [ARCHITECTURE-M3.md](./ARCHITECTURE-M3.md) §4.

---

*WayLearn · RemesaBlink · UX Trust · Jul 2026*
