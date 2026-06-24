# Deploy backend en Render

**Repo:** https://github.com/Edgadafi/remesa-blink  
**DB:** Supabase proyecto `remesa-blink` — ver [SUPABASE.md](./SUPABASE.md)

---

## Opción A — Blueprint (recomendado)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Conectar GitHub → repo `Edgadafi/remesa-blink`
3. Render detecta `render.yaml` → **Apply**
4. Completar **Environment Variables** (secrets):

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | URI pooler Supabase (`postgres.mfvubhgquumuudnoyiat:...@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`) |
| `KEEPER_PRIVATE_KEY` | Base58 del keeper (devnet) |
| `BASE_URL` | `https://remesa-blink.onrender.com` (ajustar al URL real que asigne Render) |
| `BLINKS_BASE_URL` | Igual que `BASE_URL` |

5. Esperar deploy → verificar `https://<tu-servicio>.onrender.com/health` → `"status":"ok"`, `"database":"ok"`

---

## Opción B — Web Service manual

1. **New** → **Web Service** → repo → **Language: Docker**
2. Root directory: `.` · Dockerfile: `./Dockerfile`
3. Health check path: `/health`
4. Mismas env vars que arriba

---

## Post-deploy

### Vercel (frontend `/piloto`)

```bash
cd frontend
printf '%s' 'https://remesa-blink.onrender.com' | vercel env add NEXT_PUBLIC_API_URL production
vercel --prod --yes
```

(Ajusta la URL si Render usa otro hostname.)

### Keeper devnet

```bash
npm run keeper:airdrop
solana airdrop 2 <KEEPER_PUBKEY> --url devnet
npm run keeper:usdc-ata
# Faucet USDC: https://faucet.circle.com
```

### Verificar API pilotos

```bash
curl https://remesa-blink.onrender.com/health
curl https://remesa-blink.onrender.com/api/pilotos
```

---

## Notas

- **Plan free:** el servicio duerme tras inactividad (~50s cold start).
- **RUN_KEEPER=true:** cron integrado en el mismo contenedor.
- **BOT_INTERNAL_URL:** opcional; sin bot WA las notificaciones keeper fallan silenciosamente.
- No commitear secrets; solo configurar en Render Dashboard.
