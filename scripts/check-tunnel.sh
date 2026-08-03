#!/usr/bin/env bash
set -uo pipefail
echo "=== tunnel log ==="
grep -E 'trycloudflare|ERR|Registered|failed|http' /tmp/remesa-tunnel-api.log | tail -50 || true
echo "=== resolve ==="
python3 - <<'PY'
import socket
host='plots-parade-tahoe-novelty.trycloudflare.com'
try:
    print(socket.getaddrinfo(host, 443)[0][4][0])
except Exception as e:
    print('resolve_fail', e)
PY
echo "=== curl ==="
curl -sS -m 20 -w '\nhttp:%{http_code}\n' https://plots-parade-tahoe-novelty.trycloudflare.com/health || true
# Also extract whatever URL is in the log now
url=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare.com' /tmp/remesa-tunnel-api.log | tail -1 || true)
echo "latest_url=$url"
if [[ -n "$url" ]]; then
  curl -sS -m 20 -w '\nhttp:%{http_code}\n' "$url/health" || true
fi
