#!/usr/bin/env bash
# Check Etherfuse env without printing secrets. Tolerates messy .env.
cd /home/edgar/remesa-blink/backend || exit 1

has_key=no
has_secret=no
api_url=unset
blinks=unset
bot=unset

if [[ -f .env ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    key="${line%%=*}"
    val="${line#*=}"
    val="${val%\"}"
    val="${val#\"}"
    case "$key" in
      ETHERFUSE_API_KEY) [[ -n "$val" ]] && has_key=yes ;;
      ETHERFUSE_WEBHOOK_SECRET) [[ -n "$val" ]] && has_secret=yes ;;
      ETHERFUSE_API_URL) api_url="$val" ;;
      BLINKS_BASE_URL) blinks="$val" ;;
      BOT_INTERNAL_URL) bot="$val" ;;
    esac
  done < .env
fi

echo "apiKey=$has_key"
echo "apiUrl=$api_url"
echo "webhookSecret=$has_secret"
echo "blinks=$blinks"
echo "botInternal=$bot"
echo -n "health="
curl -sS -m 3 http://127.0.0.1:3000/health 2>/dev/null || echo backend_down
echo
ss -ltn 2>/dev/null | grep -E '3000|3002' || true
if [[ -f /tmp/remesa-tunnel-api.log ]]; then
  echo "tunnels:"
  grep -oE 'https://[a-z0-9-]+\.trycloudflare.com' /tmp/remesa-tunnel-api.log | tail -3 || true
fi
