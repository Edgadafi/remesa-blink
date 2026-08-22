# Sprint Demo Day — backlog P0 / P1 / P2

**Horizon:** Demo Day WayLearn **31 ago 2026** → evidencia capital (grants primero).  
**Orden estricto (reglas WayLearn):**

```text
1 familia piloto real → E2E estable (SOL) → UX WA simple → 5+ entrevistas → polish
```

Fuera de scope explícito hasta Demo Day: mainnet, paymasters/yield/crédito en código, Bitso MXNB live, fundraising VC activo.

**In scope Demo Day (sandbox):** Etherfuse `convertir-mxn` / onboarding → pesos SPEI — [OFFRAMP-DEMO-DAY.md](./OFFRAMP-DEMO-DAY.md).  
**Narrativa trascendencia + capital:** [PITCH-TRUST-LAYER.md](./PITCH-TRUST-LAYER.md) · [CAPITAL-PIPELINE.md](./CAPITAL-PIPELINE.md) · [METRICAS-DEMO-DAY.md](./METRICAS-DEMO-DAY.md).

### Mapa criterios LATAM → RemesaBlink

| Criterio | Demo Day | Post |
|----------|----------|------|
| UX invisible (&lt;30–60 s) | WA + Blink + nombres | Paymasters |
| Fricción remesa real | Recurrente + SPEI sandbox | SPEI mainnet |
| Cuenta dinero real MX | Off-ramp path | Yield + microcrédito |
| Infra composable | Actions + Receipt | Kit open |
| Métricas / capital | Pilotos + txs testnet honestas | Grants SF → accel → ángeles |

---

## P0 — esta semana / antes de cada demo

| Entregable | Due | Notas |
|------------|-----|--------|
| **Phone path `convertir-mxn`** — wallet demo `g33Qc6g…` (no `5Hop…`) + T&Cs + BXTou3 | Day 1 | [OFFRAMP § Ensayo](./OFFRAMP-DEMO-DAY.md#ensayo-phone--checklist-hoy-2026-07-30) |
| Checklist E2E: `npm run demo:preflight` + opcional `keeper:run-once` | Cada demo | Preferir local sobre `trycloudflare` |
| **Menú enviar ahora / programar (P0.7)** | Esta semana | Bot + web alineados; `npm run smoke:nlu` en `bot/` |
| Registrar **≥1 familia** en `usuarios_piloto` | Esta semana | [PERSONA-MX-US.md](./PERSONA-MX-US.md) |
| Guion &lt;60 s ensayado + backup web | Continuo | [DEMO.md](../DEMO.md) |

## P1 — pre Demo Day

| Entregable | Due | Notas |
|------------|-----|--------|
| Host API estable (vs quick tunnel) | Pre Demo Day | `remesablink.com` pendiente |
| Guion 3 min NLU `enviar … a mi amor` + **enviar ahora / programar** | Continuo | [DEMO.md](../DEMO.md) · [UX-BOT-MEJORAS.md](./UX-BOT-MEJORAS.md) |
| Keeper saldo + smoke | Continuo | `keeper:smoke` |

## P2 — evidencia y polish

| Entregable | Due | Notas |
|------------|-----|--------|
| 5+ entrevistas M4 | Antes Demo Day | [M4-evidencias/notas](./M4-evidencias/notas/README.md) |
| Dossier grant SF (borrador) | Post Demo Day | [CAPITAL-PIPELINE.md](./CAPITAL-PIPELINE.md) |
| Dominio `remesablink.com` | Presupuesto | No bloquear con NXDOMAIN |

---

## Criterio “listo Demo Day”

- [ ] ≥1 familia piloto real registrada
- [ ] E2E SOL estable (suscripción → keeper → Receipt / Blink)
- [ ] WA **enviar ahora** / **programar** **o** web `/nueva-remesa` ensayados &lt; 24 h antes
- [ ] API alcanzable sin túnel **o** plan B documentado
- [ ] Guion &lt; 60 s (ideal) / 3 min &lt; 3:15
- [ ] Off-ramp: T&Cs wallet demo + runbook BXTou3 (o plan B status page)

## Links rápidos

| Recurso | URL / path |
|---------|------------|
| Piloto | https://frontend-bay-phi-92.vercel.app/piloto |
| Preflight | `npm run demo:preflight` |
| One-pager | [MENTOR-MARKETING-ONEPAGER.md](./MENTOR-MARKETING-ONEPAGER.md) |
| Capital | [CAPITAL-PIPELINE.md](./CAPITAL-PIPELINE.md) |
| Métricas | [METRICAS-DEMO-DAY.md](./METRICAS-DEMO-DAY.md) |
| Growth UTM | [GROWTH-SGE.md](./GROWTH-SGE.md) |
| Guía piloto | [GUIA-USUARIO-PILOTO.md](./GUIA-USUARIO-PILOTO.md) |
| UX bot | [UX-BOT-MEJORAS.md](./UX-BOT-MEJORAS.md) |
| Roadmap post | [FASE-E-NO-CUSTODIAL.md](./FASE-E-NO-CUSTODIAL.md) |
