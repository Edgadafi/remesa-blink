#!/usr/bin/env bash
# Añade columna tx_signature a suscripciones si falta (demo Explorer).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
if [[ -f "$ROOT/backend/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/backend/.env"
  set +a
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL no definida"
  exit 1
fi
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS tx_signature VARCHAR(88);
SQL
echo "OK: suscripciones.tx_signature"
