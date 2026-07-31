# Pitch — Capa de confianza + trascendencia Demo Day

Referencia para Demo Day WayLearn, Bridge, grants SF y landing `/piloto`.

---

## Una frase

**ES:** WhatsApp programa en EE.UU.; Solana prueba; la familia cobra pesos cerca — sin filas.

**EN:** WhatsApp schedules in the U.S.; Solana proves it; family gets usable pesos nearby — no lines.

---

## Elevator (30–60 s)

RemesaBlink automatiza remesas recurrentes US → MX por WhatsApp. El migrante escribe en español (`Enviar 2000 a mi amor`); un agente y reglas on-chain ejecutan cada ciclo. **Cada pago deja un recibo auditable** (`PagoReceipt`) y la familia recibe aviso + camino a **pesos (SPEI sandbox / Etherfuse)**. No pedimos seed phrases ni “entender SOL” en el pitch: pedimos confianza verificable + humanos en el loop.

---

## Dos pilares (trascendencia)

| Pilar | Demo Day (mostrar) | Roadmap (decir, no inventar shipped) |
|-------|--------------------|--------------------------------------|
| **Envío EE.UU.** | WA NLU + Blinks/Actions + keeper | Paymasters / AA (gas invisible); fondeo tarjeta / PYUSD |
| **Recepción MX** | Aviso WA + Blink `convertir-mxn` + SPEI **sandbox** | Yield/LST; microcrédito por historial de remesas |

---

## Pitch deck — 5 pasos

1. **Problema** — Corredor remesas $60B+; comisiones 4–7%; colas; exclusión rural ([PERSONA-MX-US.md](./PERSONA-MX-US.md)).
2. **Solución** — Rails Solana + WhatsApp/Blinks hoy; cuenta de dinero real (pesos) en camino; AA/yield en roadmap.
3. **Por qué Solana** — Sub-segundo, costo &lt;$0.001, Actions/Blinks; demo Receipt + Action URL.
4. **GTM** — Diáspora WA; `/piloto`; aliados tiendita; UTM ([GROWTH-SGE.md](./GROWTH-SGE.md)).
5. **Equipo & ejecución** — Anchor + keeper shipped; 6–12 m: paymaster → SPEI mainnet → yield → crédito. Ruta capital: grants SF → aceleradoras → pre-seed ([CAPITAL-PIPELINE.md](./CAPITAL-PIPELINE.md)).

---

## Cuatro capas (slide / diagrama)

| Capa | RemesaBlink |
| ---- | ----------- |
| Agente | Bot WhatsApp — one-shot + nombres (`mi amor`) |
| Reglas | Anchor — suscripción PDA, `proximo_pago`, monto fijo |
| Auditoría | `PagoReceipt` + Explorer + API composabilidad |
| Humanos | Aviso WA receptora, Blink pesos, aliado comunitario |

---

## Demo Day — secuencia viva (&lt;60 s)

1. WhatsApp: `Enviar 2000 a mi amor` → **Orden confirmada** (nombre, no address).
2. Keeper → WA receptora + comprobante Explorer (1 tap).
3. Blink Phantom → **Recibir pesos** (sandbox Etherfuse) — o captura ensayada si balance BXTou3 = 0.
4. Cierre: *“Chat en EE.UU.; pesos útiles en MX; Solana debajo.”* + 1 frase roadmap (yield / inclusión).

Backup: pasos 1–2 + [OFFRAMP-DEMO-DAY.md](./OFFRAMP-DEMO-DAY.md). **Nunca** inventar SPEI mainnet.

Detalle operativo: [DEMO.md](../DEMO.md) · Escape hatch KYC: wallet `g33Qc6g…` (no `5Hop…`).

---

## Vs. competencia (mensaje)

- **Félix / Remitly:** chat o app, sin recibo on-chain ni recurrencia verificable.
- **WU / OXXO:** confianza física, sin trazabilidad para la diáspora.
- **MVPs IA Bridge:** auditoría de agentes — nosotros la integramos en el flujo de remesa.

---

## Links

- Landing: https://frontend-bay-phi-92.vercel.app/piloto
- Capital / grants: [CAPITAL-PIPELINE.md](./CAPITAL-PIPELINE.md)
- Métricas: [METRICAS-DEMO-DAY.md](./METRICAS-DEMO-DAY.md)
- Arquitectura M3: `docs/ARCHITECTURE-M3.md`
- Trust: [TRUST-MODEL.md](./TRUST-MODEL.md) · PDAs: [PDA-ACCOUNTS.md](./PDA-ACCOUNTS.md)
