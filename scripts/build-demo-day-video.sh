#!/usr/bin/env bash
# Holatia Demo Day — MP4 1080p ≤2 min (stills + Spanish VO).
# Output: docs/M5-evidencias/Holatia-Demo-Day-2min.mp4
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRAND="$ROOT/docs/brand"
OUT="$ROOT/docs/M5-evidencias/Holatia-Demo-Day-2min.mp4"
FFMPEG="${FFMPEG:-$HOME/.local/bin/ffmpeg}"
[[ -x "$FFMPEG" ]] || FFMPEG=ffmpeg
WORKDIR=$(mktemp -d)
export WORKDIR ROOT
trap 'rm -rf "$WORKDIR"' EXIT

scale() {
  local src="$1" dst="$2"
  "$FFMPEG" -y -i "$src" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xF5F0E8" \
    -frames:v 1 "$dst"
}

WA_URL="${WA_START_URL:-https://wa.me/5215665269591?text=hola}"
node -e "
const QR=require('$ROOT/frontend/node_modules/qrcode');
QR.toFile(process.argv[2], process.argv[1], {width: 900, margin: 2, color:{dark:'#2C2416', light:'#F5F0E8'}});
" "$WA_URL" "$WORKDIR/qr-raw.png"

"$FFMPEG" -y -i "$WORKDIR/qr-raw.png" \
  -vf "scale=720:720,pad=1920:1080:(ow-iw)/2:(oh-ih)/2+40:color=0xF5F0E8" \
  -frames:v 1 "$WORKDIR/s-qr.png"

scale "$BRAND/video-guia-s1-portada.png" "$WORKDIR/s1.png"
scale "$BRAND/video-guia-s2-fila.png" "$WORKDIR/s2.png"
scale "$BRAND/video-guia-infografia-2pasos.png" "$WORKDIR/s3.png"
scale "$BRAND/video-guia-s5-aviso-wa.png" "$WORKDIR/s5.png"
scale "$BRAND/video-guia-s6-endcard.png" "$WORKDIR/s6.png"

VO="$WORKDIR/vo.mp3"
python3 - <<'PY' || true
import os, urllib.parse, urllib.request, sys
from pathlib import Path

chunks = [
    "Cada mes, millones de familias en Estados Unidos mandan a Mexico.",
    "Cola en la tiendita, comision opaca, y mama sin saber si este mes si llego el dinero.",
    "holatia es TIA en WhatsApp: programas la remesa una vez; tu familia recibe aviso.",
    "Escaneas el QR en holatia punto app. Se abre WhatsApp con TIA.",
    "Escribes: enviar trescientos a mi amor, cada mes. Sin menus complicados.",
    "Orden confirmada. Ves el nombre de tu familia, no una direccion criptografica.",
    "Cada envio deja comprobante en Solana, en devnet: verificable, barato, en segundos.",
    "Ella recibe aviso por WhatsApp. El mismo flujo vive como Solana Blink.",
    "Hoy en sandbox Etherfuse: orden lista, pesos en proceso.",
    "Buscamos diez familias piloto. holatia punto app slash piloto. TIA en WhatsApp, Solana debajo.",
]
out_dir = Path(os.environ.get("WORKDIR", "/tmp"))
parts = []
ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
for i, text in enumerate(chunks):
    q = urllib.parse.urlencode({"ie": "UTF-8", "client": "tw-ob", "tl": "es-MX", "q": text})
    url = "https://translate.google.com/translate_tts?" + q
    dest = out_dir / f"vo{i}.mp3"
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Referer": "https://translate.google.com/"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r, open(dest, "wb") as f:
            f.write(r.read())
        if dest.stat().st_size > 500:
            parts.append(str(dest))
    except Exception as e:
        print("TTS chunk fail", i, e, file=sys.stderr)
if not parts:
    sys.exit(2)
concat = out_dir / "list-vo.txt"
concat.write_text("".join(f"file '{p}'\n" for p in parts))
print("OK", len(parts), "chunks")
PY

if [[ -f "$WORKDIR/list-vo.txt" ]]; then
  "$FFMPEG" -y -f concat -safe 0 -i "$WORKDIR/list-vo.txt" -c copy "$VO"
else
  if command -v espeak-ng >/dev/null; then
    espeak-ng -v es-mx -s 140 -w "$WORKDIR/vo.wav" \
      "holatia es TIA en WhatsApp. Programas la remesa. Comprobante en Solana devnet. Diez familias piloto."
    "$FFMPEG" -y -i "$WORKDIR/vo.wav" -c:a libmp3lame "$VO"
  else
    echo "No TTS available" >&2
    exit 1
  fi
fi

# Durations tuned to ~118s total video; apad matches VO length
cat > "$WORKDIR/list.txt" <<EOF
file '$WORKDIR/s2.png'
duration 14
file '$WORKDIR/s1.png'
duration 10
file '$WORKDIR/s-qr.png'
duration 18
file '$WORKDIR/s3.png'
duration 22
file '$WORKDIR/s5.png'
duration 24
file '$WORKDIR/s6.png'
duration 20
file '$WORKDIR/s6.png'
EOF

"$FFMPEG" -y -f concat -safe 0 -i "$WORKDIR/list.txt" -i "$VO" \
  -map 0:v -map 1:a \
  -c:v libx264 -pix_fmt yuv420p -r 30 -shortest -af "apad,atrim=0:120" -c:a aac -b:a 192k \
  -t 120 \
  -movflags +faststart \
  "$OUT"

ls -lh "$OUT"
"$FFMPEG" -i "$OUT" 2>&1 | grep -E "Duration|Audio|Video" || true
echo "OK $OUT"
echo "Copy to Downloads: cp '$OUT' /mnt/c/Users/edgar/Downloads/Holatia-Demo-Day-2min.mp4"
