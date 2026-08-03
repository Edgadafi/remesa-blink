#!/usr/bin/env bash
# Ensure FRONTEND_PUBLIC_URL is set for WA blink interstitial.
set -euo pipefail
envf=/home/edgar/remesa-blink/backend/.env
front="${1:-https://frontend-bay-phi-92.vercel.app}"
if grep -q '^FRONTEND_PUBLIC_URL=' "$envf" 2>/dev/null; then
  sed -i "s|^FRONTEND_PUBLIC_URL=.*|FRONTEND_PUBLIC_URL=$front|" "$envf"
else
  printf '\nFRONTEND_PUBLIC_URL=%s\n' "$front" >> "$envf"
fi
echo "FRONTEND_PUBLIC_URL=$front"
