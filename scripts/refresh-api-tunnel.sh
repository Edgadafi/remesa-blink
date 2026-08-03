#!/usr/bin/env bash
# Refresh Cloudflare quick tunnel → backend :3000 and print URL.
set -euo pipefail
pkill -f 'cloudflared tunnel --url http://127.0.0.1:3000' 2>/dev/null || true
sleep 1
rm -f /tmp/remesa-tunnel-api.log
nohup /home/edgar/.local/bin/cloudflared tunnel --url http://127.0.0.1:3000 \
  > /tmp/remesa-tunnel-api.log 2>&1 &
echo "cloudflared_pid=$!"

for i in $(seq 1 30); do
  url=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare.com' /tmp/remesa-tunnel-api.log 2>/dev/null | head -1 || true)
  if [[ -n "${url:-}" ]]; then
    echo "TUNNEL_URL=$url"
    # Update BLINKS_BASE_URL in backend/.env (create or replace line)
    envf=/home/edgar/remesa-blink/backend/.env
    if grep -q '^BLINKS_BASE_URL=' "$envf" 2>/dev/null; then
      sed -i "s|^BLINKS_BASE_URL=.*|BLINKS_BASE_URL=$url|" "$envf"
    else
      printf '\nBLINKS_BASE_URL=%s\n' "$url" >> "$envf"
    fi
    if grep -q '^BASE_URL=' "$envf" 2>/dev/null; then
      sed -i "s|^BASE_URL=.*|BASE_URL=$url|" "$envf"
    else
      printf 'BASE_URL=%s\n' "$url" >> "$envf"
    fi
    echo "Updated BLINKS_BASE_URL + BASE_URL in backend/.env"
    curl -sS -m 10 "$url/health" || true
    echo
    exit 0
  fi
  sleep 1
done
echo "ERROR: tunnel URL not found in log" >&2
tail -20 /tmp/remesa-tunnel-api.log >&2 || true
exit 1
