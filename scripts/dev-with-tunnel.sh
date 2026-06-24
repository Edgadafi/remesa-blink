#!/usr/bin/env bash
# Backend (:3000) + Cloudflare Quick Tunnel en un solo comando.
# Ctrl+C detiene ambos (solo el backend que este script haya iniciado).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-3000}"
BACKEND_URL="http://127.0.0.1:${BACKEND_PORT}"
BACKEND_PID=""
TUNNEL_PID=""
STARTED_BACKEND=0
LOG_BACKEND="/tmp/remesa-backend-dev.log"
LOG_TUNNEL="/tmp/remesa-cloudflared.log"

find_cloudflared() {
  if command -v cloudflared >/dev/null 2>&1; then
    command -v cloudflared
    return 0
  fi
  for candidate in "$HOME/.local/bin/cloudflared" /usr/local/bin/cloudflared; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  echo "cloudflared no encontrado. Instala con: npm run tunnel:setup" >&2
  exit 1
}

cleanup() {
  local code="${1:-0}"
  echo ""
  echo "Deteniendo procesos..."
  if [[ -n "$TUNNEL_PID" ]] && kill -0 "$TUNNEL_PID" 2>/dev/null; then
    kill "$TUNNEL_PID" 2>/dev/null || true
  fi
  if [[ "$STARTED_BACKEND" -eq 1 ]] && [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  exit "$code"
}

trap 'cleanup 130' INT
trap 'cleanup 143' TERM

wait_for_backend() {
  local i
  for i in $(seq 1 45); do
    if curl -sf "${BACKEND_URL}/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "Backend no respondió en ${BACKEND_URL}/health tras 45s." >&2
  echo "Últimas líneas de ${LOG_BACKEND}:" >&2
  tail -20 "$LOG_BACKEND" >&2 || true
  exit 1
}

start_backend() {
  if curl -sf "${BACKEND_URL}/health" >/dev/null 2>&1; then
    echo "Backend ya activo en ${BACKEND_URL}"
    return 0
  fi

  echo "Iniciando backend → ${LOG_BACKEND}"
  : >"$LOG_BACKEND"
  (cd "$ROOT/backend" && npm run dev >>"$LOG_BACKEND" 2>&1) &
  BACKEND_PID=$!
  STARTED_BACKEND=1
  wait_for_backend
  echo "Backend listo."
  curl -sf "${BACKEND_URL}/health" || true
  echo ""
}

wait_for_tunnel_url() {
  local i url
  for i in $(seq 1 60); do
    url="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_TUNNEL" 2>/dev/null | head -1 || true)"
    if [[ -n "$url" ]]; then
      echo "$url"
      return 0
    fi
    sleep 1
  done
  return 1
}

print_tunnel_banner() {
  local url="$1"
  cat <<EOF

════════════════════════════════════════════════════════════
  Quick Tunnel: ${url}
  Health:       ${url}/health
  Local:        ${BACKEND_URL}/health

  Si la URL cambió, actualiza Vercel:
    cd frontend
    printf '%s' '${url}' | vercel env add NEXT_PUBLIC_API_URL production
    vercel deploy --prod --force

  Frontend piloto:
    https://frontend-bay-phi-92.vercel.app/piloto
════════════════════════════════════════════════════════════
  Ctrl+C detiene tunnel${STARTED_BACKEND:+ + backend}
EOF
}

CLOUDFLARED="$(find_cloudflared)"
start_backend

echo "Iniciando Quick Tunnel → ${LOG_TUNNEL}"
: >"$LOG_TUNNEL"
"$CLOUDFLARED" tunnel --url "$BACKEND_URL" >>"$LOG_TUNNEL" 2>&1 &
TUNNEL_PID=$!

TUNNEL_URL="$(wait_for_tunnel_url || true)"
if [[ -z "$TUNNEL_URL" ]]; then
  echo "No se detectó URL trycloudflare.com en 60s. Ver ${LOG_TUNNEL}" >&2
  tail -10 "$LOG_TUNNEL" >&2 || true
  cleanup 1
fi

print_tunnel_banner "$TUNNEL_URL"

# Mantener el script vivo mientras cloudflared corre; reimprime logs nuevos.
tail -f "$LOG_TUNNEL" &
TAIL_PID=$!
wait "$TUNNEL_PID" || true
kill "$TAIL_PID" 2>/dev/null || true
cleanup 0
