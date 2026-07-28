#!/usr/bin/env bash
# Ensayo seco demo — crea 1 suscripción mínima vía API (path backup web).
set -euo pipefail
API="${API_BASE:-http://127.0.0.1:3000}"
DEST="${DEMO_DEST_WALLET:-BRjpPywx2GiDAjnyCEiBgH3jZNseWHRLmFGU6kW128pK}"
WA_FROM="${DEMO_REMITENTE_WA:-5215500000001}"
WA_TO="${DEMO_DEST_WA:-5215500000002}"

echo "=== Ensayo seco $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "API=$API"
echo "destinatario_solana=$DEST"
echo "remitente_wa=$WA_FROM destinatario_wa=$WA_TO"
echo

echo "[bot]"
curl -sf -m 5 "$API/../" >/dev/null 2>&1 || true
BOT_H="$(curl -sf -m 5 http://127.0.0.1:3002/health || echo '{}')"
echo "$BOT_H"
echo

echo "[POST /api/suscripciones]"
RESP="$(curl -sf -m 30 -X POST "$API/api/suscripciones" \
  -H "Content-Type: application/json" \
  -d "{\"remitente_wa\":\"$WA_FROM\",\"destinatario_wa\":\"$WA_TO\",\"destinatario_solana\":\"$DEST\",\"monto\":0.001,\"frecuencia\":\"mensual\",\"tipo_activo\":\"SOL\"}")"
echo "$RESP"
echo

echo "[GET /api/suscripciones/$WA_FROM]"
curl -sf -m 15 "$API/api/suscripciones/$WA_FROM"
echo
echo
echo "[piloto/nueva HTTP]"
curl -sf -m 10 -o /dev/null -w "piloto:%{http_code}\n" "https://frontend-bay-phi-92.vercel.app/piloto" || echo "piloto:fail"
curl -sf -m 10 -o /dev/null -w "nueva-remesa:%{http_code}\n" "https://frontend-bay-phi-92.vercel.app/nueva-remesa" || echo "nueva:fail"
echo "=== fin ensayo ==="
