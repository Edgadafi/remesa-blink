#!/usr/bin/env bash
# Hard restart API + quick tunnel. Safe to run from WSL.
set -euo pipefail
ROOT=/home/edgar/remesa-blink
cd "$ROOT"

echo "== diagnose =="
curl -sS -m 3 -w "\nLOCAL_HTTP:%{http_code}\n" http://127.0.0.1:3000/health || echo LOCAL_DOWN
pgrep -af 'cloudflared tunnel --url|tsx.*backend|remesa-blink/backend' || echo "no matching procs"

echo "== kill =="
fuser -k 3000/tcp 2>/dev/null || true
pkill -f 'cloudflared tunnel --url' 2>/dev/null || true
# don't pkill all node — only backend on 3000 already killed via fuser
sleep 2

echo "== start backend =="
cd "$ROOT/backend"
nohup npm run dev > /tmp/remesa-backend-dev.log 2>&1 &
echo "backend_nohup_pid=$!"
cd "$ROOT"

code=000
for i in $(seq 1 60); do
  code=$(curl -sS -m 2 -o /tmp/remesa-health-local.json -w "%{http_code}" http://127.0.0.1:3000/health 2>/dev/null || echo 000)
  if [[ "$code" == "200" ]]; then
    echo "local health OK after ${i}s"
    break
  fi
  sleep 1
done
if [[ "$code" != "200" ]]; then
  echo "ERROR: backend never healthy" >&2
  tail -50 /tmp/remesa-backend-dev.log >&2 || true
  exit 1
fi

echo "== refresh tunnel =="
bash "$ROOT/scripts/refresh-api-tunnel.sh" | tee /tmp/remesa-tunnel-refresh.out
TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare.com' /tmp/remesa-tunnel-refresh.out | head -1 || true)
if [[ -z "${TUNNEL_URL:-}" ]]; then
  TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare.com' /tmp/remesa-tunnel-api.log 2>/dev/null | head -1 || true)
fi
if [[ -z "${TUNNEL_URL:-}" ]]; then
  echo "ERROR: no tunnel URL" >&2
  exit 1
fi
echo "$TUNNEL_URL" > "$ROOT/tunnel-url.txt"
echo "TUNNEL_URL=$TUNNEL_URL"

echo "== restart backend for new env =="
fuser -k 3000/tcp 2>/dev/null || true
sleep 1
cd "$ROOT/backend"
nohup npm run dev > /tmp/remesa-backend-dev.log 2>&1 &
cd "$ROOT"
for i in $(seq 1 45); do
  code=$(curl -sS -m 2 -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/health 2>/dev/null || echo 000)
  [[ "$code" == "200" ]] && break
  sleep 1
done
echo "local_after_restart=$code"

echo "== public health x3 =="
ok=0
for i in 1 2 3; do
  out=$(curl -sS -m 20 -w "\nHTTP:%{http_code}" "$TUNNEL_URL/health" 2>&1 || true)
  echo "try$i: $out" | head -c 400
  echo
  echo "$out" | grep -q 'HTTP:200' && ok=1
  sleep 3
done

if [[ "$ok" != "1" ]]; then
  echo "WARN: public health not 200 yet — one more tunnel refresh" >&2
  bash "$ROOT/scripts/refresh-api-tunnel.sh" | tee /tmp/remesa-tunnel-refresh.out
  TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare.com' /tmp/remesa-tunnel-refresh.out | head -1)
  echo "$TUNNEL_URL" > "$ROOT/tunnel-url.txt"
  sleep 5
  curl -sS -m 20 -w "\nHTTP:%{http_code}\n" "$TUNNEL_URL/health" || true
fi

# webhooks (best effort)
if [[ -f "$ROOT/backend/scripts/demo-register-etherfuse-webhooks.ts" ]]; then
  echo "== webhooks =="
  (cd "$ROOT/backend" && npx tsx scripts/demo-register-etherfuse-webhooks.ts "$TUNNEL_URL" 2>&1 | tail -20) || true
fi

echo "DONE url=$TUNNEL_URL"
cat "$ROOT/tunnel-url.txt"
