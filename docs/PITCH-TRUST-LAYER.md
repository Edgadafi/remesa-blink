# Pitch — Capa de confianza (agente + reglas + receipt + humanos)

Referencia para Demo Day, Bridge, WayLearn y landing `/piloto`.

---

## Una frase

**ES:** El agente en WhatsApp programa; Solana audita; tu familia vigila.

**EN:** The WhatsApp agent schedules; Solana audits; your family watches.

---

## Elevator (30 s)

RemesaBlink automatiza remesas recurrentes US → MX por WhatsApp. El remitente configura una vez; un agente conversacional y reglas on-chain ejecutan cada ciclo. **Cada pago deja un recibo auditable** (`PagoReceipt`) y la familia en México recibe aviso — sin app nueva, sin filas en OXXO. No pedimos confianza ciega en la IA: pedimos confianza verificable + humanos en el loop (remitente, receptora, tiendita aliada).

---

## Cuatro capas (slide / diagrama)

| Capa | RemesaBlink |
| ---- | ----------- |
| Agente | Bot WhatsApp — intención en español |
| Reglas | Anchor — suscripción PDA, `proximo_pago`, monto fijo |
| Auditoría | `PagoReceipt` + Explorer + API composabilidad |
| Humanos | `/mis-remesas`, aviso WA a receptora, aliado comunitario |

---

## Vs. competencia (mensaje)

- **Félix / Remitly:** chat o app, pero sin recibo on-chain ni recurrencia programada verificable.
- **WU / OXXO:** confianza física, sin trazabilidad digital para la diáspora.
- **MVPs IA Bridge:** capa de auditoría de agentes — nosotros la integramos en el flujo de remesa, no como producto aparte.

---

## Demo Day — secuencia visual (30 s)

1. WhatsApp: `/recurrente` → suscripción creada.
2. Keeper ejecuta → Explorer: **PagoReceipt**.
3. Receptora recibe mensaje WA con link.
4. Cierre: *“El agente ejecuta; Solana prueba; la familia confirma.”*

---

## Links

- Landing: https://frontend-bay-phi-92.vercel.app/piloto
- Arquitectura M3: `docs/ARCHITECTURE-M3.md` §1.1
- Diagrama: `docs/M3-evidencias/diagrams/m3-08-capa-confianza.png`
- UX confianza (Pauline Moon): `docs/UX-TRUST-DESIGN.md`
- **Modelo de confianza (canónico):** `docs/TRUST-MODEL.md`
- **Esquema PDAs y cuentas:** `docs/PDA-ACCOUNTS.md`
