#!/usr/bin/env bash
set -euo pipefail
fuser -k 3000/tcp 3002/tcp 2>/dev/null || true
pkill -f '/home/edgar/remesa-blink/backend/node_modules/.bin/tsx' 2>/dev/null || true
pkill -f '/home/edgar/remesa-blink/bot/node_modules/.bin/tsx' 2>/dev/null || true
sleep 2

cd /home/edgar/remesa-blink/backend
setsid env CORS_ORIGIN="*" npm run dev > /tmp/remesa-backend-dev.log 2>&1 < /dev/null &
cd /home/edgar/remesa-blink/bot
setsid npm start > /tmp/remesa-bot.log 2>&1 < /dev/null &
sleep 6

echo "=== ports ==="
ss -ltn | grep -E '3000|3002' || true
echo "=== health ==="
curl -sS http://127.0.0.1:3000/health || true
echo
echo "=== pagos ==="
curl -sS http://127.0.0.1:3000/api/suscripciones/5210000000000/pagos || true
echo
echo "=== bot ==="
grep -E 'Conectado|Internal API|Error' /tmp/remesa-bot.log | tail -5 || true
