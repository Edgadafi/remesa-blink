# Supabase — RemesaBlink (Postgres)

**Importante:** Supabase aloja la **base de datos PostgreSQL**, no el servidor Express (keeper, Blinks, cron). El API se despliega en **Render / Railway** con `DATABASE_URL` apuntando a Supabase.

---

## Proyecto dedicado

| Campo | Valor |
|-------|-------|
| **Nombre** | remesa-blink |
| **Project ref** | `mfvubhgquumuudnoyiat` |
| **API URL** | https://mfvubhgquumuudnoyiat.supabase.co |
| **Dashboard** | https://supabase.com/dashboard/project/mfvubhgquumuudnoyiat |
| **Región** | us-east-1 |
| **Host DB** | `db.mfvubhgquumuudnoyiat.supabase.co` |

> **Incidente (22 jul 2026):** desde Vercel, DNS/tenant `mfvubhgquumuudnoyiat` **no responde** (`ENOTFOUND` / tenant not found). Mientras tanto `/api/pilotos` en producción falla con 500.  
> **Acción:** Dashboard Supabase → restaurar proyecto **remesa-blink** o crear uno nuevo → actualizar `DATABASE_URL` en Vercel (frontend) + Render → `psql "$DATABASE_URL" -f db/schema.sql` → redeploy. Ver [PILOTO-NOTIFY.md](./PILOTO-NOTIFY.md).

---

## Historial

- **Revertido (24 jun 2026):** tablas RemesaBlink eliminadas del proyecto **Retiro iLATAM** (`jfjjsqacwelagleggyal`) — migración `remesa_blink_rollback`.
- **Creado:** proyecto **remesa-blink** dedicado con schema completo (`remesa_blink_initial_schema`, `remesa_blink_cashback_blinks`).

> Para crear el proyecto dedicado fue necesario **pausar** `elcanario.com.mx` (límite 2 proyectos free). Restaurar en Dashboard → elcanario → Restore project si lo necesitas.

---

## Tablas

`suscripciones`, `pagos`, `usuarios_piloto`, `cashback_programa`, `cashback_transacciones`, `cashback_referidos`, `blinks_pendientes`, `beneficiarios_etherfuse`, `lealtad_niveles`, `lealtad_miembros`, `lealtad_eventos`, `lealtad_beneficios_aplicados`, `soporte_tickets`

Migración Club TIA: `db/migrations/004_lealtad_club_tia.sql` · Doc: [PROGRAMA-LEALTAD-CLUB-TIA.md](./PROGRAMA-LEALTAD-CLUB-TIA.md)  
Migración soporte: `db/migrations/005_soporte_tickets.sql`

---

## DATABASE_URL (backend)

Dashboard → **Project Settings → Database → Connection string** → **URI** (Transaction pooler, puerto **6543**):

```
postgresql://postgres.mfvubhgquumuudnoyiat:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

Usar en `backend/.env` y en Render/Railway como `DATABASE_URL`.

---

## API Express (URL pública del backend)

| Servicio | URL |
|----------|-----|
| **Supabase (REST/Auth)** | https://mfvubhgquumuudnoyiat.supabase.co |
| **RemesaBlink API** | Pendiente Render — ver [DEPLOY.md](../DEPLOY.md) |

Variables Render sugeridas:

```env
DATABASE_URL=postgresql://postgres.mfvubhgquumuudnoyiat:...@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
BASE_URL=https://remesa-blink.onrender.com
BLINKS_BASE_URL=https://remesa-blink.onrender.com
CORS_ORIGIN=https://frontend-bay-phi-92.vercel.app,http://localhost:3003
```

Vercel:

```env
NEXT_PUBLIC_API_URL=https://remesa-blink.onrender.com
```

---

## Regenerar schema

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/migrations/002_enable_rls.sql
```

---

## Row Level Security (RLS)

Migración `db/migrations/002_enable_rls.sql` — aplicada en proyecto **remesa-blink**.

| Tabla | Acceso anon (PostgREST) | Backend (DATABASE_URL) |
|-------|-------------------------|-------------------------|
| `usuarios_piloto` | INSERT waitlist + RPC `piloto_total()` | Full |
| Resto | Denegado | Full |

La landing `/piloto` usa `piloto_total()` para el contador (no expone filas con WhatsApp).
