#!/usr/bin/env bash
# Ejemplo — API composabilidad (requiere backend en :3000)
WALLET="${1:-HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH}"
API="${API_BASE:-http://localhost:3000}"

echo "GET $API/api/composability/perfil/$WALLET"
curl -sS "$API/api/composability/perfil/$WALLET"

echo ""
echo "GET $API/api/pilotos"
curl -sS "$API/api/pilotos"
