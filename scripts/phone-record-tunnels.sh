#!/usr/bin/env bash
# Backend + 2 Quick Tunnels (API + Web) con nohup — sobreviven al cierre del script.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CF="${HOME}/.local/bin/cloudflared"
[[ -x "$CF" ]] || CF="$(command -v cloudflared)"
LOG_B=/tmp/remesa-backend-dev.log
LOG_TA=/tmp/remesa-tunnel-api.log
LOG_TF=/tmp/remesa-tunnel-web.log
LOG_F=/tmp/remesa-frontend-dev.log

echo "== Limpieza puertos 3000/3003 =="
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3003/tcp 2>/dev/null || true
pkill -f "cloudflared tunnel --url" 2>/dev/null || true
sleep 2

echo "== Backend =="
: >"$LOG_B"
nohup env CORS_ORIGIN="*" bash -lc "cd '$ROOT/backend' && npm run dev" >>"$LOG_B" 2>&1 &
disown || true

for i in $(seq 1 45); do
  if curl -sf http://127.0.0.1:3000/health >/dev/null; then
    echo "backend OK"; curl -s http://127.0.0.1:3000/health; echo; break
  fi
  sleep 1
  [[ "$i" -eq 45 ]] && { echo FAIL; tail -40 "$LOG_B"; exit 1; }
done

echo "== Tunnel API =="
: >"$LOG_TA"
nohup "$CF" tunnel --url http://127.0.0.1:3000 >>"$LOG_TA" 2>&1 &
disown || true
API_URL=""
for i in $(seq 1 60); do
  API_URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_TA" 2>/dev/null | head -1 || true)"
  [[ -n "$API_URL" ]] && break
  sleep 1
done
[[ -z "$API_URL" ]] && { echo no API tunnel; tail -20 "$LOG_TA"; exit 1; }
echo "API_URL=$API_URL"
printf '%s\n' "$API_URL" > /tmp/remesa-tunnel-api.url

echo "== Frontend =="
: >"$LOG_F"
nohup env NEXT_PUBLIC_API_URL="$API_URL" NEXT_PUBLIC_BLINKS_BASE_URL="$API_URL" \
  bash -lc "cd '$ROOT/frontend' && npm run dev" >>"$LOG_F" 2>&1 &
disown || true

for i in $(seq 1 90); do
  if curl -sf -o /dev/null http://127.0.0.1:3003/; then echo "frontend OK"; break; fi
  sleep 1
  [[ "$i" -eq 90 ]] && { echo frontend FAIL; tail -40 "$LOG_F"; exit 1; }
done

echo "== Tunnel WEB =="
: >"$LOG_TF"
nohup "$CF" tunnel --url http://127.0.0.1:3003 >>"$LOG_TF" 2>&1 &
disown || true
WEB_URL=""
for i in $(seq 1 60); do
  WEB_URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_TF" 2>/dev/null | head -1 || true)"
  [[ -n "$WEB_URL" ]] && break
  sleep 1
done
[[ -z "$WEB_URL" ]] && { echo no WEB tunnel; tail -20 "$LOG_TF"; exit 1; }
printf '%s\n' "$WEB_URL" > /tmp/remesa-tunnel-web.url

# smoke public
sleep 3
echo "== Smoke =="
curl -sS -m 20 "${API_URL}/health" | head -c 200; echo
curl -sS -m 25 -o /dev/null -w "web:%{http_code}\n" "${WEB_URL}/piloto" || true

cat <<EOF

════════════════════════════════════════════════════════════
  CELULAR (no apagues WSL)

  Hub:          ${WEB_URL}/
  Piloto:       ${WEB_URL}/piloto
  Nueva remesa: ${WEB_URL}/nueva-remesa
  API health:   ${API_URL}/health
════════════════════════════════════════════════════════════
EOF
