#!/usr/bin/env bash
# Levanta Next.js en :3003 y deja log en /tmp/remesa-dev-web.log
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="/tmp/remesa-dev-web.log"
if ss -tlnp 2>/dev/null | grep -q ':3003'; then
  echo "Puerto 3003 ya en uso — abre http://localhost:3003/piloto (o ejecuta: fuser -k 3003/tcp && npm run dev)"
  exit 0
fi
cd "$ROOT/frontend"
echo "Iniciando next dev → $LOG"
nohup npm run dev >>"$LOG" 2>&1 &
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:3003/piloto >/dev/null 2>&1; then
    echo "✓ Ready — http://localhost:3003/piloto"
    curl -s http://127.0.0.1:3003/api/pilotos || true
    echo ""
    exit 0
  fi
  sleep 1
done
echo "Timeout. Ver log: tail -30 $LOG"
tail -20 "$LOG"
exit 1
