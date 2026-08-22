# Guía usuario piloto — Remesa Blink (WhatsApp)

**Audiencia:** familia piloto + quien ensaya el bot antes de Demo Day (31 ago 2026).  
**ICP:** [PERSONA-MX-US.md](./PERSONA-MX-US.md) · Confianza: [UX-TRUST-DESIGN.md](./UX-TRUST-DESIGN.md)  
**Mejoras pendientes (nombres, monto reuse):** [UX-BOT-MEJORAS.md](./UX-BOT-MEJORAS.md)

---

## Cómo empezar

1. Abre el chat de WhatsApp del bot Remesa Blink (número del piloto).
2. Escribe **ayuda** (o saluda) para ver el menú.
3. Menú TIA (escribe **ayuda** o un número):
   - **1** · **enviar ahora** — un envío hoy (primer pago al confirmar)
   - **2** · **programar** — remesa recurrente (semana / mes / quincena)
   - **3** · **mis envíos** · **4** · **recompensas** (Club TIA) · **5** · **soporte**
   - En cualquier momento: **cancelar** para salir del flujo

Soporte: escribe *soporte* en el **mismo chat** del bot (menú de motivos). Email: `remesatia@gmail.com`.

---

## Flujo real (prueba)

Ensayo remitente → destinatario en México.

### Opción A — enviar ahora (Demo Day)

| Paso | Usuario escribe | Bot responde (resumen) |
|------|-----------------|-------------------------|
| 1 | `1` o `enviar ahora` | Pide monto |
| 2 | `2000` o `Enviar 2000 a mi mujer` | Confirma monto; **salta frecuencia** → pide WhatsApp |
| 3 | `5215559607277` | Pide wallet Solana |
| 4 | Wallet | Primer pago **hoy** → **Orden confirmada** (aviso WA cuando keeper pague) |

> Piloto: si solo quieres **un envío** sin repetir, confirma con soporte después — on-chain queda suscripción mensual placeholder.

### Opción B — one-shot con frecuencia en la frase

| Paso | Usuario escribe | Bot responde (resumen) |
|------|-----------------|-------------------------|
| 1 | `Enviar 2000 dólares a mi mujer` | De acuerdo *$2000* a *mi mujer* → pide frecuencia |
| 2 | `Cada semana` | Pide WhatsApp de *mi mujer* |
| 3 | `5215559607277` | Pide código app de dinero |
| 4 | Wallet Solana | “Programando… → *mi mujer*” → **Orden confirmada** |

### Opción C — programar paso a paso

| Paso | Usuario escribe | Bot responde (resumen) |
|------|-----------------|-------------------------|
| 1 | `2` o `programar` | Pide monto (ej. *300* o frase completa) |
| 2 | `1000` | Confirma monto; pide frecuencia |
| 3 | `Cada mes` | Pide **a quién** (nombre / apodo) |
| 4 | `mi amor` | Pide WhatsApp (con lada) |
| 5 | `5215559607277` | Pide *código de su app de dinero* (wallet) |
| 6 | Wallet Solana | “Programando…” → **Orden confirmada** |

**Demo Day — nombre del contacto:** preferir apodo cariñoso **`mi amor`** / **`mi mujer`** / **`mi reina`**. También: `mi corazón`, `mi vida`, `mi chula` (MX). ICP familia rural: `Mamá` / `Tía Rosa`. Nombres con espacios OK (máx. 40 caracteres).

**Confirmación nueva (ejemplo):**

> ✅ Orden confirmada  
> A *mi amor* (+5215559607277)  
> *$1000* · cada mes  
> Escribe *mis envíos* para verla.

**Confirmación en reuso (monto distinto):**

> ✅ Orden registrada  
> A *mi amor* (+521…)  
> *$10* · cada mes  
> Pediste *$1000*; el monto activo sigue en *$10* (no se cambió).  
> Escribe *mis envíos*…

Notas de la prueba:

- Soft exits: **cancelar** / **soporte** / **ayuda**.
- Confirmaciones y **mis envíos** muestran alias + WA (no address completa).
- Si la PDA on-chain ya existía para ese destinatario, el monto mostrado es el **on-chain**, no el que acabas de tipear (abajo).

### Qué guarda el sistema (hoy)

Tabla `suscripciones` (`db/schema.sql`):

| Campo | Uso en el flujo |
|-------|-----------------|
| `remitente_wa` | Tu WhatsApp (quien programa) |
| `nombre_contacto` | Alias (ej. `mi amor`); VARCHAR(40) |
| `destinatario_wa` | WA del destinatario (paso 5) |
| `destinatario_solana` | Wallet pegada (paso 6) |
| `monto` | Monto en unidades on-chain (USDC ×1e6 / SOL ×1e9) |
| `frecuencia` | `diario` / `semanal` / `mensual` |
| `tipo_activo` | `USDC` (default del bot) o `SOL` |
| `pda_address` | Cuenta Anchor; **una por keeper + destinatario** |

---

## Troubleshooting piloto

### “Pedí $1000 y me confirma $10” (u otro monto)

**Causa:** la remesa a esa wallet **ya estaba activa**. El programa on-chain no crea otra suscripción ni cambia el monto: reusa la PDA y el bot confirma con el monto **guardado en cadena** (`reused: true`). En la prueba: pediste 1000 → confirmó **$10** (el valor previo).

**Qué hacer:**

1. Escribe **mis envíos** y mira el monto real programado.
2. Si necesitas otro monto en demo: usa **otra wallet de destino** (otra PDA), o pide al equipo reset/devnet antes del ensayo.
3. No asumas que “Remesa ya activa” actualizó el monto — **no lo hace**.

Producto/copy previsto: [UX-BOT-MEJORAS.md](./UX-BOT-MEJORAS.md) § monto en reuse.

### “Dice misma cuenta / esa cuenta”

Es el path de reuso. El dinero **no se movió** otra vez solo por reprogramar. Ver mensaje: “No hay envío nuevo…”.

### Wallet / “dirección” no válida

Pega la dirección completa (32–44 caracteres Base58). Si falla 2–3 veces: **soporte** o **cancelar** y reintenta **enviar**.

### No llega aviso a la familia

- Verifica lada (`521…` México).
- Bot y API deben estar vivos (`whatsappConnected` / preflight).
- En piloto el aviso post-pago depende del keeper + notificaciones.

### Quiero cancelar a mitad

Escribe **cancelar**. Luego **enviar** de nuevo.

### Si ves «Unfunded» / «Selling Token» (página de seguimiento)

Al recibir pesos (Blink **Recibir pesos**), a veces se abre una página de Etherfuse que dice **Selling Token** y estado **Unfunded**.

**Qué significa (en simple):**

- La **orden ya se creó** (paso “Order Created” con ✓).
- Todavía **falta enviar** el dinero de prueba (token USDC sandbox `BXTou3…`) desde Phantom.
- Si Phantom no tiene ese token, la página dirá Unfunded — **es normal**, no rompiste nada.

**Qué hacer:**

1. Lee el mensaje del Blink **antes** de abrir el enlace (explica exactamente esto).
2. En Phantom, usa la misma wallet que te pidió el Blink (en ensayo Demo Day suele ser `g33Qc6g…`).
3. Si el equipo aún no fondeó el token de prueba: basta mostrar “orden lista / pesos en proceso (sandbox)” — no hace falta pelear con el botón Connect.
4. Si sí hay token: Connect en esa página → confirmar envío → el estado pasa a “Token Sent”.

Detalle técnico para el equipo: [OFFRAMP-DEMO-DAY.md](./OFFRAMP-DEMO-DAY.md).

---

## Checklist rápido antes de enseñar a una familia

- [ ] Ensayo **enviar** completo &lt; 24 h antes (monto nuevo + wallet **nueva** si quieres ver monto pedido).
- [ ] **mis envíos** muestra la remesa.
- [ ] Número de soporte y `/piloto` a mano.
- [ ] Explicar en voz: “si ya tenías remesa a esa cuenta, el bot no cambia el monto — te muestra el que ya estaba”.

---

## Links

| Recurso | Path / URL |
|---------|------------|
| Form piloto | https://frontend-bay-phi-92.vercel.app/piloto |
| Backlog UX bot | [UX-BOT-MEJORAS.md](./UX-BOT-MEJORAS.md) |
| Sprint Demo Day | [SPRINT-DEMO-DAY.md](./SPRINT-DEMO-DAY.md) |
| Copy bot | `bot/src/copy.ts` |
| Flujo bot | `bot/src/index.ts` |
