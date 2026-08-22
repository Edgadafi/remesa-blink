# Preflight M5 — resultado y ops

**Fecha:** 2026-08-13  
**Comando:** `bash scripts/ensure-preflight.sh` (arranca stack + `npm run demo:preflight`)

## Resultado

```
=== PREFLIGHT OK — listo para ensayar ===
```

| Check | Resultado |
|-------|-----------|
| API `:3000` | OK · cluster `devnet` · Program ID `B1G72Cc…` · database ok · bot ok |
| Bot `:3002` | OK reachable |
| WhatsApp | Puede ser `whatsappConnected=false` tras reinicio — **no bloquea** preflight |
| Keeper smoke | OK · ~5.8 SOL en keeper |

## Backup sin WhatsApp (documentado)

Si el QR no está escaneado:

1. https://frontend-bay-phi-92.vercel.app/nueva-remesa  
2. o `npm run e2e:sol` para evidencia on-chain  
3. Guion demo: [DEMO.md](../../DEMO.md)

## Túnel Blink público (solo si hace falta unfurl)

```bash
bash scripts/restart-tunnel-now.sh
# Actualizar BLINKS_BASE_URL / webhooks Etherfuse con la URL nueva
```

URL antigua en logs (`*.trycloudflare.com`) **no** es canónica — preferir local `:3000` o regenerar.

## Scripts

| Script | Uso |
|--------|-----|
| `scripts/start-demo-stack.sh` | API + bot (setsid) |
| `scripts/ensure-preflight.sh` | Start si hace falta + preflight |
| `npm run demo:preflight` | Solo checks |
| `npm run e2e:sol` | Suscripción + pago SOL + receipt |
