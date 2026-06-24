#!/usr/bin/env bash
# Configura Cloudflare Named Tunnel para el backend RemesaBlink (gratis, sin tarjeta).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CF_DIR="$ROOT/cloudflare"
CRED_DIR="$CF_DIR/credentials"
TUNNEL_NAME="${TUNNEL_NAME:-remesa-blink-api}"
TUNNEL_HOSTNAME="${TUNNEL_HOSTNAME:-api.remesablink.com}"

mkdir -p "$CRED_DIR"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Instalando cloudflared..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
    sudo apt-get update && sudo apt-get install -y cloudflared
  else
    echo "Instala cloudflared manualmente: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    exit 1
  fi
fi

echo "=== Paso 1: login Cloudflare (se abre el navegador) ==="
cloudflared tunnel login

echo "=== Paso 2: crear túnel '$TUNNEL_NAME' ==="
if cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
  echo "Túnel '$TUNNEL_NAME' ya existe."
else
  cloudflared tunnel create "$TUNNEL_NAME"
fi

TUNNEL_ID="$(cloudflared tunnel list --output json 2>/dev/null | python3 -c "
import json,sys
name=sys.argv[1]
for t in json.load(sys.stdin):
    if t.get('name')==name:
        print(t['id']); break
" "$TUNNEL_NAME" 2>/dev/null || true)"

if [[ -z "${TUNNEL_ID:-}" ]]; then
  TUNNEL_ID="$(cloudflared tunnel list | awk -v n="$TUNNEL_NAME" '$0 ~ n {print $1; exit}')"
fi

CRED_FILE="$CRED_DIR/${TUNNEL_NAME}.json"
if [[ -n "${TUNNEL_ID:-}" && ! -f "$CRED_FILE" ]]; then
  DEFAULT_CRED="$HOME/.cloudflared/${TUNNEL_ID}.json"
  if [[ -f "$DEFAULT_CRED" ]]; then
    cp "$DEFAULT_CRED" "$CRED_FILE"
    echo "Credenciales copiadas a $CRED_FILE"
  fi
fi

cat > "$CF_DIR/config.yml" <<EOF
tunnel: ${TUNNEL_NAME}
credentials-file: ${CRED_FILE}

ingress:
  - hostname: ${TUNNEL_HOSTNAME}
    service: http://127.0.0.1:3000
  - service: http_status:404
EOF

echo "=== Paso 3: DNS CNAME → túnel ==="
cloudflared tunnel route dns "$TUNNEL_NAME" "$TUNNEL_HOSTNAME" || {
  echo "Si falla, crea manualmente en Cloudflare DNS:"
  echo "  CNAME ${TUNNEL_HOSTNAME} → ${TUNNEL_ID}.cfargotunnel.com (proxied)"
}

PUBLIC_URL="https://${TUNNEL_HOSTNAME}"
echo ""
echo "=== Listo ==="
echo "URL pública API: ${PUBLIC_URL}"
echo ""
echo "Actualiza backend/.env:"
echo "  BASE_URL=${PUBLIC_URL}"
echo "  BLINKS_BASE_URL=${PUBLIC_URL}"
echo "  CORS_ORIGIN=https://frontend-bay-phi-92.vercel.app,http://localhost:3003"
echo ""
echo "Vercel (frontend):"
echo "  NEXT_PUBLIC_API_URL=${PUBLIC_URL}"
echo ""
echo "Arrancar:"
echo "  npm run dev          # terminal 1 — backend :3000"
echo "  npm run tunnel:run   # terminal 2 — túnel"
echo ""
echo "Probar: curl ${PUBLIC_URL}/health"
