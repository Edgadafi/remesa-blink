# UX Bot WhatsApp — mejoras (plan Demo Day)

**Estado:** P0 + **P0.5 fluency** (julio 2026). P1+ pendiente.  
**Origen:** QA capturas WhatsApp + `bot/src/copy.ts` / `bot/src/index.ts` / `suscripciones`.  
**Guía piloto:** [GUIA-USUARIO-PILOTO.md](./GUIA-USUARIO-PILOTO.md) · Confianza: [UX-TRUST-DESIGN.md](./UX-TRUST-DESIGN.md)  
**Milestone:** UX WA simple pre Demo Day WayLearn (31 ago 2026).

---

## Diagnóstico corto (hoy)

| Tema | Estado actual |
|------|----------------|
| Flujo | `enviar` (one-shot OK) → monto → frecuencia → **nombre** → WA familia → wallet → API |
| One-shot | `enviar 2000 a mi mujer` prellena monto+nombre; salta pasos; eco “De acuerdo…” |
| Destinatario en UI | `nombre_contacto` + WA — **nunca** “tu familia en México” si hay nombre |
| Confirmación | Bloque único `✅ Orden confirmada` / `Orden registrada` (reuse) |
| Wallet | Pedida siempre (P1: reuso); copy: “código de su app de dinero” |
| Reuse PDA | Si `reused` y monto pedido ≠ on-chain → nota 1 línea, monto activo claro |
| Sesión bot | `EnviarDraft` + `nextEnviarStep()` |

Alineado con Pauline / UX-TRUST: *Hide the blockchain* — outcomes por **nombre**, no direcciones.

---

## Opciones: nombre del contacto (en vez de pegar wallet)

### (A) Preguntar nombre + guardar alias — **P0 hecho**

- Paso `enviar_nombre`: *¿Cómo se llama tu familiar?* → `nombre_contacto` en `suscripciones` + draft.
- Wallet: aún siempre (P1: “¿misma cuenta?”).
- Confirmaciones / mis envíos: **a mi amor (+52…)** (o Mamá); `maskAddr` disponible; sin address completa.

### (B) Lista de contactos guardados

- Tras 1er envío: “1. mi amor  2. Mamá” en chat.
- Mejor UX recurrente; requiere persistencia de contactos + NLU de selección.
- Más trabajo que (A); ideal post primera familia estable.

### (C) Aplazar / opcional wallet (ruta SPEI-only)

- Flujo “solo WhatsApp + nombre” hasta onboarding Etherfuse/CLABE.
- Encaja offramp Demo Day; **no** cierra E2E on-chain actual sin wallet destino.
- Diferir como camino paralelo, no reemplazo del MVP remesa on-chain esta semana.

### Recomendación MVP Demo Day → **(A) + reuso inteligente de wallet**

No (B) completo ni (C) como único path hasta que E2E wallet→pago esté estable en ensayo.

---

## MVP recomendado — nombres de contacto (5 bullets)

1. **Orden del flujo:** monto → frecuencia → *¿Cómo se llama?* → WA familia → wallet **solo si** no hay contacto previo con wallet (o usuario elige “otra cuenta”). *(P0: wallet siempre; P1-1: reuso)*
2. **Persistir** `nombre_contacto` (VARCHAR 40) en `suscripciones` (+ draft en `session.ts`). ✅
3. **Confirmaciones y mis envíos:** `a *mi amor* (+521…)` — nunca “esa cuenta” / “misma cuenta” sin nombre; **nunca** address completa. ✅
4. **Wallet:** pedir una vez; después “¿Usamos la misma cuenta de mi amor?” → sí (mask `5Hop…tQ5x`) / no (pegar nueva). Copy P0: evitar “dirección”; “código de su app de dinero”. ✅ léxico / ⏳ reuso P1
5. **Reuse PDA + monto:** si `reused` y montos difieren → mensaje explícito. ✅

---

## Backlog priorizado

### P0 — antes de demos con familia / mentora

| ID | Ítem | Estado |
|----|------|--------|
| P0-1 | **Nombre en flujo + DB** | ✅ Hecho — `enviar_nombre`, columna, API, confirm / mis envíos |
| P0-2 | **Enmascarar wallet** | ✅ Hecho — `maskAddr()`; confirmaciones sin address full |
| P0-3 | **Copy reuse monto** | ✅ Hecho — `montoPedido` vs on-chain en `buildSuscripcionConfirmada` |
| P0-4 | **Léxico anti-crypto** | ✅ Hecho — ask wallet / labels / errores sin “dirección” |
| P0.5-1 | **One-shot parse** (monto+nombre[+freq]) | ✅ Hecho — `parseEnviarOneshoot`, skip pasos |
| P0.5-2 | **Pending + orden con nombre** | ✅ Hecho — `buildRecurrentePending` + `Orden confirmada` |
| P0.6-1 | **NLU coloquial** (mandarle, quincena, monto solo) | ✅ |
| P0.7-1 | **Menú enviar ahora vs programar** (Félix-style) | ✅ Hecho — `enviar_modo`, `primer_pago_inmediato` API |
| P0.8-1 | **Estimado MXN en confirmación** (Etherfuse quote) | ✅ Hecho — `GET /api/etherfuse/quote-estimate` + copy bot |

### P1 — pre Demo Day (si P0 estable)

| ID | Ítem | Notas |
|----|------|--------|
| P1-1 | **Wallet solo 1ª vez / “misma que la vez pasada”** | Lookup última `destinatario_solana` por remitente+WA (o por nombre); branch en `enviar_wallet` |
| P1-2 | ~~Pending con nombre~~ | ✅ Movido a P0.5-2 |
| P1-3 | **Producto: cambiar monto** | Decidir: bloquear re-enviar con monto distinto (“escribe soporte”) vs instrucción on-chain `update` (más scope Anchor) |
| P1-4 | **Lista corta contactos (B light)** | Si ≥1 contacto: “Responde *1* mi amor o *nuevo*” — sin UI rica |

### P2 — polish / post primera familia

| ID | Ítem | Notas |
|----|------|--------|
| P2-1 | Tabla `contactos` (remitente_wa, alias, wa, solana) | Normalizar fuera de `suscripciones` |
| P2-2 | Ruta SPEI-only sin wallet en chat (C) | Tras onboarding Etherfuse; alinear [SPRINT-DEMO-DAY.md](./SPRINT-DEMO-DAY.md) offramp |
| P2-3 | Nombre en notificaciones receptora | “De Edgar” / “Para mi amor” en WA post-pago |
| P2-4 | Slash `/recurrente` con alias | Legacy; baja prioridad vs NLU `enviar` |

---

## Copy objetivo (shipped en P0 + P0.5)

**One-shot (ejemplo)**

```text
U: Enviar 2000 dólares a mi mujer
B: De acuerdo: *$2000* a *mi mujer*.
   ¿Cada cuánto lo mandamos?
   • cada mes / cada semana / cada día
```

**Pedir nombre** (Demo Day default: apodo cariñoso; Mamá sigue OK)

```text
¿A quién se lo mandamos?
Como le dices tú: mi amor, mi mujer, Mamá, mi reina…
```

**Pending**

```text
⏳ Programando tu remesa…
*$2000* · cada semana → *Mi reina*
```

**Confirmación nueva / reuse mismo monto**

```text
✅ Orden confirmada

A *Mi reina* (+521…)
*$2000* · cada semana

Escribe *mis envíos* para verla.
```

**Confirmación reuse (monto distinto al pedido)**

```text
✅ Orden registrada

A *Mi reina* (+521…)
*$10* · cada semana
Pediste *$2000*; el monto activo sigue en *$10* (no se cambió).

Escribe *mis envíos* para verla · *soporte* si quieres otro monto.
```

Smoke: `cd bot && npm run smoke:nlu`
---

## Fuera de scope (este doc)

- Mainnet / cambiar seeds PDA.
- Refactor amplio NLU.
- P1+ (lista contactos, SPEI-only, update monto on-chain).

## Criterio “listo” para demo con nombre

- [x] Usuario programa sin ver address completa en confirmación.
- [x] **mis envíos** muestra alias + WA.
- [x] Reuse con monto distinto: mensaje honest (piloto no se asusta con $10 vs $1000).
- [x] Ensayo en [GUIA-USUARIO-PILOTO.md](./GUIA-USUARIO-PILOTO.md) actualizado (Demo Day: *mi amor*).
