#!/usr/bin/env bash
# Preflight demo — mentora marketing / Demo Day (local preferido sobre túnel).
# Uso: npm run demo:preflight   OR  bash scripts/demo-preflight.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${API_BASE:-http://127.0.0.1:3000}"
BOT="${BOT_BASE:-http://127.0.0.1:3002}"
FAIL=0

ok() { echo "  OK  $*"; }
bad() { echo "  FAIL $*"; FAIL=1; }
warn() { echo "  WARN $*"; }

echo "=== Remesa Blink demo preflight ==="
echo "API=$API  BOT=$BOT"
echo

echo "[1] Backend /health"
if BODY="$(curl -sf -m 8 "$API/health" 2>/dev/null)"; then
  ok "API reachable"
  echo "     $BODY"
  echo "$BODY" | grep -q '"database":"ok"' && ok "database ok" || bad "database not ok"
  if echo "$BODY" | grep -q '"bot":"ok"'; then
    ok "API ve bot interno"
  else
    warn "API no ve bot (BOT_INTERNAL_URL / bot caído) — notificaciones WA fallarán"
  fi
else
  bad "API no responde en $API — arranca: cd backend && npm run dev"
fi
echo

echo "[2] Bot WhatsApp /health"
if BODY="$(curl -sf -m 8 "$BOT/health" 2>/dev/null)"; then
  ok "Bot :3002 reachable"
  echo "     $BODY"
  if echo "$BODY" | grep -q '"whatsappConnected":true'; then
    ok "WhatsApp vinculado"
  else
    warn "whatsappConnected=false — escanea QR en terminal del bot (cd bot && npm start)"
    warn "Backup demo: web https://frontend-bay-phi-92.vercel.app/nueva-remesa o localhost:3003"
  fi
else
  bad "Bot no responde en $BOT — arranca: cd bot && npm start"
fi
echo

echo "[3] Keeper smoke (SOL liquidez)"
if (cd "$ROOT" && npm run keeper:smoke >/tmp/remesa-keeper-smoke.log 2>&1); then
  ok "keeper:smoke"
  tail -5 /tmp/remesa-keeper-smoke.log | sed 's/^/     /'
else
  bad "keeper:smoke falló — ver /tmp/remesa-keeper-smoke.log ; npm run keeper:airdrop"
  tail -15 /tmp/remesa-keeper-smoke.log | sed 's/^/     /' || true
fi
echo

echo "[4] URLs demo (recordatorio)"
echo "     Piloto:  https://frontend-bay-phi-92.vercel.app/piloto"
echo "     Hub:     https://frontend-bay-phi-92.vercel.app/"
echo "     Local:   http://localhost:3003"
echo "     Guion:   DEMO.md § Mentora marketing"
echo

if [[ "$FAIL" -ne 0 ]]; then
  echo "=== PREFLIGHT FAIL — corrige antes de la call ==="
  exit 1
fi
echo "=== PREFLIGHT OK — listo para ensayar ==="
exit 0
