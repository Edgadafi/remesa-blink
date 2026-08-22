# Notas de campo M4 — plantilla + primeras entradas

Objetivo WayLearn: **5+ entrevistas** antes de Demo Day. Aquí van notas honestas (no inventar quotes).

## Cómo documentar

1. Copiar plantilla abajo a `nota-YYYY-MM-DD-<alias>.md`.
2. Subir resumen a Drive WayLearn (carpeta M4).
3. Actualizar conteo en [METRICAS-DEMO-DAY.md](../METRICAS-DEMO-DAY.md).

### Plantilla

```markdown
# Entrevista — <alias>
- Fecha:
- Rol: remitente | receptora | tiendita
- Canal: WA / presencial / llamada
- Corredor / estado MX:
- Resumen (5 líneas):
- Dolor #1:
- ¿Usaría WhatsApp para programar remesa? sí/no/tal vez
- Quote usable (textual):
- Siguiente paso:
```

---

## Entradas

| # | Fecha | Archivo | Tipo | Cuenta para meta 5+ ICP |
|---|-------|---------|------|-------------------------|
| 1 | 2026-07-29 | [nota-2026-07-29-mi-reina-qa.md](./nota-2026-07-29-mi-reina-qa.md) | Founder QA | Parcial |
| 2 | 2026-07-29 | [nota-2026-07-29-diana-waitlist.md](./nota-2026-07-29-diana-waitlist.md) | Waitlist + quote real | Señal (remitente urbana) |
| 3 | 2026-08-02 | [nota-2026-08-02-cohort-waitlist.md](./nota-2026-08-02-cohort-waitlist.md) | Síntesis cohort 7 pilotos | Pipeline, no entrevista |
| 4–7 | TBD | `nota-YYYY-MM-DD-*.md` | Receptora/remitente 15 min | **Faltan** |

**Conteo honesto:** señales waitlist **sí**; entrevistas profundas ICP rural **0–1 / 5+**. Pack: [ENTREGA-M4-VALIDACION.md](../ENTREGA-M4-VALIDACION.md)

### 2026-07-29 — ensayo founder (remitente / auto-QA)

- **Rol:** remitente (founder QA) + flujo receptora simulado
- **Canal:** WhatsApp bot RemesaBlink
- **Hallazgos:**
  - One-shot `Enviar 2000… a mi mujer` aún no parseaba (fix P0.5).
  - Nombre afectivo `Mi reina` mejora confianza vs address.
  - Reuse PDA con monto distinto ($2000 pedido / $10 activo) confunde — copy “Orden registrada” ayuda.
  - Off-ramp bloqueado por Sumsub email `.test` en wallet `5Hop…` → escape hatch wallet `g33Qc6g…`.
- **Quote usable:** “Quiero mandar a mi mujer / mi amor, no pegar un código largo.”
- **Siguiente:** 1 familia ICP real vía `/piloto` + 4 notas de campo.

### 2026-07-30 — checklist Demo Day / capital (desk research + producto)

- **Rol:** síntesis producto (no usuario externo)
- **Hallazgos:** Inversionistas piden métricas reales, UX &lt;60 s, off-ramp MX, compliance ligero — ver [CAPITAL-PIPELINE.md](../../CAPITAL-PIPELINE.md).
- **Siguiente:** 2–4 entrevistas receptoras rurales (plantilla arriba).

### Pendiente — familia piloto #1–4 (cierre M4)

Para cada una:
1. Registrar en `usuarios_piloto` (`POST /api/pilotos` o form `/piloto`).
2. Copiar plantilla → `nota-YYYY-MM-DD-<alias>.md`.
3. Actualizar tabla de conteo arriba + [METRICAS-DEMO-DAY.md](../../METRICAS-DEMO-DAY.md).
