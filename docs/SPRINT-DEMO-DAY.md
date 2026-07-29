# Sprint Demo Day — backlog P0 / P1 / P2

**Horizon:** post-mentora marketing → Demo Day WayLearn **31 ago 2026**.  
**Orden estricto (reglas WayLearn):**

```text
1 familia piloto real → E2E estable (SOL) → UX WA simple → 5+ entrevistas → polish
```

Fuera de scope explícito: mainnet, Fase E no-custodial, Bitso MXNB live, refactors amplios.

**In scope Demo Day (sandbox):** Etherfuse `convertir-mxn` / onboarding → pesos SPEI — ver [OFFRAMP-DEMO-DAY.md](./OFFRAMP-DEMO-DAY.md).

---

## P0 — esta semana / antes de cada demo

| Entregable | Due | Notas |
|------------|-----|--------|
| Checklist E2E noche previa: `npm run demo:preflight` + opcional `keeper:run-once` | Antes de **cada** demo | Preferir local sobre `trycloudflare` |
| Registrar **≥1 familia** en `usuarios_piloto` (form `/piloto`) | Esta semana | ICP: [PERSONA-MX-US.md](./PERSONA-MX-US.md) |
| Guion mentora ensayado + backup web si WA sin QR | Continuo | [DEMO.md](../DEMO.md), [DEMO-ENSAYO.md](./DEMO-ENSAYO.md) |

## P1 — pre Demo Day

| Entregable | Due | Notas |
|------------|-----|--------|
| Sustituir dependencia `*.trycloudflare.com` por host API estable (VPS barato o named tunnel cuando haya dominio) | Pre Demo Day | `remesablink.com` aún no live |
| Guion Demo Day **3 min** actualizado (NLU `enviar`, no solo `/recurrente`) | Semana próxima | Ya en [DEMO.md](../DEMO.md) § Demo Day — ensayar en vivo |
| Keeper con saldo mínimo + smoke verde | Continuo | `npm run keeper:smoke` / airdrop |

## P2 — evidencia y polish

| Entregable | Due | Notas |
|------------|-----|--------|
| 5+ entrevistas M4 + evidencia en `docs/M4-evidencias/` | Antes Demo Day | Plantilla en README de esa carpeta |
| Dominio `remesablink.com` (+ `api.`) | Cuando haya presupuesto | No bloquear demo con NXDOMAIN |

---

## Criterio “listo Demo Day”

- [ ] ≥1 familia piloto real registrada
- [ ] E2E SOL estable (suscripción → keeper → Receipt / Blink)
- [ ] WA `enviar` **o** web `/nueva-remesa` ensayados &lt; 24 h antes
- [ ] API alcanzable desde frontend prod sin túnel efímero (ideal) **o** plan B documentado
- [ ] Guion 3 min &lt; 3:15 en ensayo

## Links rápidos

| Recurso | URL / path |
|---------|------------|
| Piloto | https://frontend-bay-phi-92.vercel.app/piloto |
| Preflight | `npm run demo:preflight` |
| One-pager | [MENTOR-MARKETING-ONEPAGER.md](./MENTOR-MARKETING-ONEPAGER.md) |
| Growth UTM | [GROWTH-SGE.md](./GROWTH-SGE.md) |
