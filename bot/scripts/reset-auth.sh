#!/usr/bin/env bash
# Borra sesión Baileys corrupta (Bad MAC / No matching sessions) y fuerza re-QR.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
fuser -k 3002/tcp 2>/dev/null || true
rm -rf auth_info
mkdir -p auth_info
echo "[bot] auth_info limpio. Arranca: npm start  y escanea el QR de nuevo."
