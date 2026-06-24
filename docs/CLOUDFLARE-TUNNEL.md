# Cloudflare Named Tunnel — backend gratis (sin tarjeta)

Alternativa a Render cuando piden método de pago. Expone el backend Express (`:3000`) con HTTPS fijo.

| Capa | Dónde |
|------|--------|
| Frontend | Vercel — https://frontend-bay-phi-92.vercel.app |
| PostgreSQL | Supabase — proyecto `remesa-blink` |
| API + keeper + Blinks | **WSL/local** + Cloudflare Tunnel |

---

## Requisitos

1. Cuenta [Cloudflare](https://dash.cloudflare.com) (gratis)
2. Dominio en Cloudflare (ej. `remesablink.com`) — para hostname fijo `api.remesablink.com`
3. `cloudflared` en WSL

---

## Setup automático (una vez)

```bash
cd /home/edgar/remesa-blink

# Opcional: cambiar hostname
export TUNNEL_HOSTNAME=api.tudominio.com

chmod +x scripts/cloudflare-tunnel-setup.sh
./scripts/cloudflare-tunnel-setup.sh
```

El script: login → crea túnel `remesa-blink-api` → `cloudflare/config.yml` → CNAME DNS.

Archivos locales (gitignored):

- `cloudflare/config.yml`
- `cloudflare/credentials/remesa-blink-api.json`

---

## Uso diario (demo / piloto)

**Terminal 1 — backend**

```bash
npm run dev
```

**Terminal 2 — túnel named**

```bash
npm run tunnel:run
```

**Probar**

```bash
curl https://api.remesablink.com/health
# → "status":"ok", "database":"ok"
```

---

## Túnel rápido (sin dominio)

URL temporal `*.trycloudflare.com`:

```bash
# Recomendado — backend + tunnel en una terminal
npm run dev:tunnel
```

El script espera `/health`, imprime la URL `*.trycloudflare.com` y los comandos para Vercel. **Ctrl+C** detiene tunnel y backend (si los inició el script).

Alternativa en dos terminales:

```bash
npm run dev          # terminal 1
npm run tunnel:quick # terminal 2 — copia la URL que imprime
```

Actualiza Vercel `NEXT_PUBLIC_API_URL` con esa URL (cambia cada reinicio).

---

## Variables de entorno

### `backend/.env`

```env
BASE_URL=https://api.remesablink.com
BLINKS_BASE_URL=https://api.remesablink.com
CORS_ORIGIN=https://frontend-bay-phi-92.vercel.app,http://localhost:3003
DATABASE_URL=postgresql://postgres.mfvubhgquumuudnoyiat:...@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
KEEPER_PRIVATE_KEY=...
RUN_KEEPER=true
PROGRAM_ID=B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2
```

### Vercel (frontend)

```bash
cd frontend
printf '%s' 'https://api.remesablink.com' | vercel env add NEXT_PUBLIC_API_URL production
vercel --prod --yes
```

---

## Demo Day

- Mantén WSL + backend + túnel encendidos durante la demo, **o**
- Usa un mini-PC / VPS barato con el mismo `config.yml` y `systemd` para `cloudflared` + backend

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `502` en `/health` | Backend no corre en `:3000` → `npm run dev` |
| CORS error en `/piloto` | `CORS_ORIGIN` incluye URL Vercel exacta |
| `database: error` | Revisa `DATABASE_URL` Supabase pooler + SSL |
| DNS no resuelve | Espera 1–5 min; verifica CNAME proxied en Cloudflare |
