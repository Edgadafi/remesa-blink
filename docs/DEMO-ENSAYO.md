# Ensayo seco — Demo mentora

Registro del ensayo obligatorio antes de la call. Actualizar tras cada ensayo.

## Resultado 2026-07-28

| Campo | Valor |
|-------|--------|
| Fecha (UTC) | `2026-07-28T02:53:57Z` |
| Canal usado | **API / backup web** (`POST /api/suscripciones`) — mismo path que `/nueva-remesa` |
| WhatsApp | `whatsappConnected: **false**` → **re-QR obligatorio** antes de demo WA en vivo |
| Número del bot (WA) | _(pendiente: escanear QR en `cd bot && npm start`)_ |
| Wallet destino prueba | `BRjpPywx2GiDAjnyCEiBgH3jZNseWHRLmFGU6kW128pK` (keeper pubkey) |
| Remitente WA prueba | `5215500000001` |
| Destinatario WA prueba | `5215500000002` |
| Suscripción id | `ad403dbf-bf3e-4e95-b7d5-90ef696ef2f5` |
| Monto | `0.001 SOL` mensual |
| PDA | `FqbaaRzK4tBteVcSEirbQ7UaAEWUFw5yXHvVMAzxiyWq` |
| Tx crear | `2sKfqkzyeg6S9YeE5sgyFG5i1jEVemG4LJarGcix52sFVozFVTFwS2tfzzNsJf9xQxGyYXodW6gYQGocdYQezz3z` |
| Preflight | `npm run demo:preflight` → **OK** (API + DB + bot process + keeper ~5.84 SOL) |
| Piloto Vercel | `200` https://frontend-bay-phi-92.vercel.app/piloto |
| Nueva remesa Vercel | `200` https://frontend-bay-phi-92.vercel.app/nueva-remesa |

### Plan mentora mañana

1. Abrir `/piloto` (Vercel) primero.
2. Si WA sigue sin QR → **backup**: `/nueva-remesa` (no improvisar Explorer).
3. Si hay tiempo 30 min antes: re-vincular bot y un `enviar` real.

### Cómo repetir

```bash
npm run demo:preflight
bash scripts/demo-ensayo-seco.sh
# o WA manual: hola → enviar → monto mínimo
```

### Criterio “listo mañana”

- [x] health API + bot process verdes; WA false → backup web ensayado
- [x] Guion en [DEMO.md](../DEMO.md) § Mentora
- [x] One-pager [MENTOR-MARKETING-ONEPAGER.md](./MENTOR-MARKETING-ONEPAGER.md)
- [x] Keeper con saldo (&gt;5 SOL smoke)
- [ ] WA `whatsappConnected: true` (nice-to-have; no bloquea con backup)
