#!/usr/bin/env bash
set -euo pipefail
echo "trycloudflare.com:"
python3 - <<'PY'
import socket
for h in ['trycloudflare.com','cloudflare.com','google.com']:
  try:
    print(h, socket.getaddrinfo(h, 443)[0][4][0])
  except Exception as e:
    print(h, 'FAIL', e)
PY
cd /home/edgar/remesa-blink/backend
npx tsx scripts/demo-list-state.ts
# Smoke Etherfuse API key (no secrets printed)
npx tsx -e '
import "dotenv/config";
const url = (process.env.ETHERFUSE_API_URL || "") + "/health";
const key = process.env.ETHERFUSE_API_KEY || "";
console.log("etherfuse_url", process.env.ETHERFUSE_API_URL);
console.log("key_len", key.length);
try {
  const r = await fetch(url, { headers: key ? { Authorization: "Bearer " + key } : {} });
  console.log("etherfuse_health_status", r.status);
} catch (e) {
  console.log("etherfuse_fetch_err", e instanceof Error ? e.message : e);
}
'
