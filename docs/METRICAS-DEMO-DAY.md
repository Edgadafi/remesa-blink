# Métricas Demo Day — solo números reales

**Regla:** no inventar TVL, mainnet volume ni “% retención”. Actualizar tras cada ensayo.

Última revisión: **2026-08-02**.

---

## Snapshot (rellenar / actualizar)

| Métrica | Valor | Fuente / cómo medir |
|---------|-------|---------------------|
| Familias / usuarios en `usuarios_piloto` | **7** (2 receptora, 3 remitente, 2 tiendita; 1 rural Michoacán) | Export 2026-08-02 · `docs/M4-evidencias/usuarios_piloto-export-REDACTED.csv` |
| Suscripciones activas (DB) | _contar_ `suscripciones` | Postgres |
| Pagos keeper ejecutados (devnet) | _contar_ `pagos` + Explorer | DB + cluster |
| Tiempo liquidación percibido | &lt;1 s (Solana finality demo) | Narrativa + Explorer timestamp |
| Costo fee medio (SOL transfer / ix) | orden &lt;$0.001 USD | Fee en Explorer (anotar 1 tx ejemplo) |
| Off-ramp SPEI sandbox | Path integrado; **Plan B** (Processing/Unfunded) — burn BXTou3 pendiente sandbox Etherfuse | [OFFRAMP-DEMO-DAY.md](./OFFRAMP-DEMO-DAY.md) § Plan B |
| Entrevistas M4 documentadas | **2 señales + 1 QA** (gap: 4+ ICP profundas) | `docs/M4-evidencias/notas/` · [ENTREGA-M4](./M4-evidencias/ENTREGA-M4-VALIDACION.md) |
| Pack M4 Drive | Empaquetado 2026-08-02 — subir manual | [M4-UPLOAD-DRIVE.md](./M4-UPLOAD-DRIVE.md) |
| WA bot connected | ver `curl :3002/health` | Ensayo |
| Club TIA — miembros ≥ Nopal | _contar_ tras migración 004 | `SELECT COUNT(*) FROM lealtad_miembros WHERE nivel NOT IN ('semilla')` |
| Club TIA — volumen_usd_90d p50 | _medir tras volumen real_ | `lealtad_miembros` (no inventar) |
| Club TIA — canjes (tipo `canje`) | _contar_ | `cashback_transacciones` |

### Tx de referencia (ejemplo — actualizar)

| Campo | Valor |
|-------|--------|
| Cluster | devnet |
| Program ID | `B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2` |
| Ejemplo fee / CU | Anotar tras `keeper:run-once` o `e2e:sol` |
| Explorer | https://explorer.solana.com/?cluster=devnet |

---

## Checklist inversionista (honestidad)

| Piden | Mostramos |
|-------|-----------|
| Volumen prueba | Conteos DB + Explorer (devnet) |
| UX &lt;60 s | Guion [DEMO.md](../DEMO.md) / [PITCH-TRUST-LAYER.md](./PITCH-TRUST-LAYER.md) |
| Off-ramp local | Etherfuse SPEI **sandbox** + plan mainnet |
| Compliance | Sumsub/Etherfuse + slide legal |

---

## Comandos útiles

```bash
curl -s localhost:3000/api/pilotos | head
curl -s localhost:3000/health
curl -s localhost:3000/api/lealtad/niveles
npm run demo:preflight
npm run keeper:run-once   # opcional — anotar signature
# Migración Club TIA (una vez):
# psql "$DATABASE_URL" -f db/migrations/004_lealtad_club_tia.sql
```
