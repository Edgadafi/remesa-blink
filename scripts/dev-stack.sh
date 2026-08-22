#!/usr/bin/env bash
# Levanta backend (:3000) + bot WA (:3002) en background.
set -eo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

wait_health() {
  local port="$1"
  curl -sf -m 2 "http://127.0.0.1:${port}/health" >/dev/null 2>&1
}

echo "=== Remesa Blink dev stack ==="

if ! wait_health 3000; then
  (cd "$ROOT/backend" && nohup npm run dev >>/tmp/remesa-api.log 2>&1 &)
  echo "  …   api arrancando (:3000)"
else
  echo "  OK  api ya responde"
fi

if ! wait_health 3002; then
  (cd "$ROOT/bot" && nohup npm start >>/tmp/remesa-bot.log 2>&1 &)
  echo "  …   bot arrancando (:3002)"
else
  echo "  OK  bot ya responde"
fi

for _ in $(seq 1 25); do
  if wait_health 3000 && wait_health 3002; then
    echo
    echo "=== Stack OK ==="
    curl -sf http://127.0.0.1:3000/health
    echo
    curl -sf http://127.0.0.1:3002/health
    echo
    exit 0
  fi
  sleep 2
done

echo "=== TIMEOUT — revisa /tmp/remesa-api.log y /tmp/remesa-bot.log ==="
exit 1
