#!/usr/bin/env bash
# Túnel efímero (sin dominio) — útil para pruebas rápidas.
# URL cambia en cada ejecución. Para backend+tunnel juntos: npm run dev:tunnel
set -euo pipefail

find_cloudflared() {
  if command -v cloudflared >/dev/null 2>&1; then
    command -v cloudflared
    return 0
  fi
  for candidate in "$HOME/.local/bin/cloudflared" /usr/local/bin/cloudflared; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  echo "cloudflared no encontrado. Usa npm run tunnel:setup o npm run dev:tunnel" >&2
  exit 1
}

PORT="${BACKEND_PORT:-3000}"
echo "Backend debe estar en http://127.0.0.1:${PORT} (npm run dev o npm run dev:tunnel)"
exec "$(find_cloudflared)" tunnel --url "http://127.0.0.1:${PORT}"
