# Demo Day Runbook — Milestone 7 (31 ago 2026)

**Formato GitBook:** pitch ≤ **3 min** + demo ≤ **2 min** = total ≤ **5 min**/equipo  
**Simulacro sugerido:** **27 ago 2026**

---

## T-48 h (29 ago)

- [ ] `npm run demo:preflight` verde
- [ ] Ensayo completo pitch (M6) + demo Plan B
- [ ] Tx Explorer de respaldo abierta en favoritos
- [ ] Laptop cargada; hotspot listo; zoom UI 125%

## T-24 h (30 ago)

- [ ] Dry run ≤5:00 con cronómetro (grabar ensayo)
- [ ] Bot WA `whatsappConnected: true` **o** solo web documentado
- [ ] Si Blink público: `bash scripts/restart-tunnel-now.sh` + anotar URL
- [ ] Cerrar pestañas sensibles (`.env`, claves)

## T-1 h

```bash
bash scripts/start-demo-stack.sh
npm run demo:preflight
```

- [ ] Abrir: `/piloto`, chat WA o `/nueva-remesa`, Explorer, Blink status
- [ ] Wallet destino ensayo anotada (no program ID)
- [ ] Frase Plan B memorizada

## T-5 min

- [ ] Micrófono / pantalla compartida OK
- [ ] Modo no molestar
- [ ] Guion 1 hoja: [PITCH-DECK-M6.md](./PITCH-DECK-M6.md) + [DEMO.md](../DEMO.md)

---

## Secuencia en vivo (≤5 min)

| Tiempo | Modo | Contenido |
|--------|------|-----------|
| 0:00–3:00 | Pitch | Slides M6 (problema → solución → Solana → tracción → ask) |
| 3:00–5:00 | Demo | WA/web orden → Explorer → Blink Plan B |

**Frase Plan B:** “Sandbox: pesos en camino / orden lista.”  
**Nunca:** SPEI mainnet, TVL inventado, “ya en producción mainnet”.  
**Números:** solo [PIPELINE-CUANTITATIVO.md](./PIPELINE-CUANTITATIVO.md) (**9** pilotos · meta 10).  
**PROVA:** si preguntan — “capa de auditoría del agente, no el demo” ([PROVA-AUDIT-LAYER.md](./PROVA-AUDIT-LAYER.md)).

---

## Fallbacks

| Falla | Acción |
|-------|--------|
| Bot WA caído | `/nueva-remesa` en Vercel o localhost |
| API caída | Video M5 + Explorer tx guardada |
| Etherfuse Unfunded | Plan B narrativo + screenshot |
| Túnel muerto | Localhost + Dialect inspector solo si hay URL pública |

---

## Post Demo Day

- [ ] Anotar preguntas del jurado
- [ ] Actualizar `METRICAS-DEMO-DAY.md` si mostraron números nuevos
- [ ] Agradecer mentors en Discord

Referencias: [SPRINT-DEMO-DAY.md](./SPRINT-DEMO-DAY.md) · [OFFRAMP-DEMO-DAY.md](./OFFRAMP-DEMO-DAY.md) · [ENTREGA-M5-MVP.md](./M5-evidencias/ENTREGA-M5-MVP.md)
