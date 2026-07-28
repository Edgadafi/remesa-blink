#!/usr/bin/env bash
# Re-apply Baileys MACOS platform patch after npm install (WhatsApp pairing 2026).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VC="$ROOT/node_modules/@whiskeysockets/baileys/lib/Utils/validate-connection.js"
if [[ ! -f "$VC" ]]; then
  exit 0
fi
if grep -q 'Platform.WEB' "$VC"; then
  sed -i 's/platform: proto.ClientPayload.UserAgent.Platform.WEB/platform: proto.ClientPayload.UserAgent.Platform.MACOS/' "$VC"
  echo "[bot] patched Baileys Platform.WEB → MACOS"
fi
