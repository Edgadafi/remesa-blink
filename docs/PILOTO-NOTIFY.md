# Notificaciones piloto — email a remesatia@gmail.com

El formulario `/piloto` **guarda en Postgres/Supabase** (`usuarios_piloto`). El correo **remesatia@gmail.com** es contacto de soporte y, con Resend configurado, **recibe un aviso automático** por cada registro nuevo.

**URL producción:** https://frontend-bay-phi-92.vercel.app/piloto

---

## Flujo esperado (QA)

1. Usuario llena el form → `POST /api/pilotos`
2. Fila nueva en `usuarios_piloto` (organizada por `created_at`, `rol`, `whatsapp`)
3. Confirmación **en pantalla** (“Gracias — te contactamos en 48 h…”)
4. Email a **remesatia@gmail.com** con el detalle del registro (si Resend está activo)
5. Opcional: botón WhatsApp de soporte

---

## Ver registros (datos organizados)

[Supabase Dashboard](https://supabase.com/dashboard/project/mfvubhgquumuudnoyiat/editor) → **Table Editor** → `usuarios_piloto`

Columnas clave: `id`, `created_at`, `whatsapp`, `rol`, `nombre_opcional`, `estado`, `municipio`, `zona`, `canal_confianza`, `notas`.

Export: Table Editor → **Export** → CSV.

---

## Variables Vercel (frontend) — obligatorias para “funciona a la perfección”

En Vercel → proyecto **frontend** → **Settings → Environment Variables** → Production:

| Variable | Para qué | Obligatorio |
|----------|----------|-------------|
| `DATABASE_URL` | Insert/count vía Postgres (pooler Supabase) | **Sí** (ya suele estar) |
| `RESEND_API_KEY` | Enviar email de aviso | **Sí** para correo |
| `PILOTO_NOTIFY_EMAIL` | Destino (`remesatia@gmail.com`) | Recomendado |
| `RESEND_FROM` | Remitente Resend | Recomendado |
| `SUPABASE_SERVICE_ROLE_KEY` | Alternativa REST con RETURNING id | Opcional |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Fallback RPC/REST | Opcional |
| `NEXT_PUBLIC_WA_SUPPORT` | Botón WA en éxito (landing `/piloto`) | **Mismo número del bot** de remesas. Actual: `5215665269591` |

### Activar Resend (5 min)

1. Cuenta en [resend.com](https://resend.com) con **remesatia@gmail.com**
2. **API Keys** → crear → `re_...`
3. En Vercel añade:
   - `RESEND_API_KEY` = `re_...`
   - `PILOTO_NOTIFY_EMAIL` = `remesatia@gmail.com`
   - `RESEND_FROM` = `RemesaBlink <onboarding@resend.dev>` (pruebas)
4. **Redeploy** production

**Nota:** Con `onboarding@resend.dev` solo puedes enviar **al email de la cuenta Resend** hasta verificar dominio propio.

---

## Cómo probar en 2 minutos

```bash
# Contador
curl -sS "https://frontend-bay-phi-92.vercel.app/api/pilotos"

# Registro de prueba
curl -sS -X POST "https://frontend-bay-phi-92.vercel.app/api/pilotos" \
  -H "Content-Type: application/json" \
  -d '{"whatsapp":"5215559607277","rol":"promotor","nombre_opcional":"Edgar QA","notas":"prueba email"}'
```

Respuesta esperada `201`:

```json
{
  "ok": true,
  "usuario": { "id": "...", "whatsapp": "...", "rol": "..." },
  "email_notify": { "sent": true },
  "stored_in": "supabase.usuarios_piloto"
}
```

- `email_notify.sent: false` + `reason: "RESEND_API_KEY not configured"` → falta la key en Vercel.
- Revisa bandeja / spam de **remesatia@gmail.com**.
- Confirma la fila en Table Editor.

---

## Local

```bash
# frontend/.env.local
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
PILOTO_NOTIFY_EMAIL=remesatia@gmail.com
```

Sin `RESEND_API_KEY`, el registro **sí se guarda**; solo se omite el email (log en servidor).
