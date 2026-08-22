#!/usr/bin/env bash
# Deploy frontend a holatia.app (Vercel).
# Usar desde WSL Ubuntu — el CLI de Windows no comparte token con WSL.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"

if ! vercel whoami >/dev/null 2>&1; then
  echo "No hay sesión Vercel en WSL. Ejecuta: vercel login"
  echo "(El vercel de Windows/PowerShell usa credenciales distintas.)"
  exit 1
fi

echo "Deploying frontend → production (holatia.app)…"
vercel --prod --yes
echo "OK: https://holatia.app"
