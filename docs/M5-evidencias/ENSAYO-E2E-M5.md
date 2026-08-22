# Ensayo E2E M5 — evidencia 2026-08-13

## Automatizado (cumplido)

```bash
bash scripts/ensure-preflight.sh   # PREFLIGHT OK
npm run e2e:sol                    # E2E SOL OK
```

| Paso | Resultado |
|------|-----------|
| Suscripción + Anchor | tx `4KXPMHCv…` |
| Keeper pago SOL | tx `3wgXLQaib…` |
| Receipt PDA | `H3LLspuoi…` |
| DB + cashback | OK |

Explorer: https://explorer.solana.com/tx/3wgXLQaibVWuAX2cB6qEc52FJjwtfifdFKq2w6bfD5Lj3YjYnRQPcqDwFNJhZcMNz1ZE4uNNoRMZQQxtKrAbf9zM?cluster=devnet

## Phone / web (ensayar antes de checkpoint 19 ago)

| Paso | Canal | Estado |
|------|-------|--------|
| Orden | WA `Enviar … a mi amor` **o** `/nueva-remesa` | Re-ensayar si WA QR fresco |
| Recibo | Explorer link arriba | Listo |
| Blink Plan B | Status Unfunded/Processing → frase sandbox | Ver [OFFRAMP-DEMO-DAY.md](../OFFRAMP-DEMO-DAY.md) |
| Screenshots | `screenshots/01..03` | Capturar para Drive |

Wallet off-ramp ensayo: `g33Qc6g…` (no `5Hop…`). T&Cs Etherfuse.
