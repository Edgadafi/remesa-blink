# Landing Waitlist — Especificación `/piloto`

**Objetivo:** 10 familias piloto cualificadas antes del Demo Day (31 ago 2026) → `POST /api/pilotos`.

| Rol | Meta |
|-----|------|
| Remitente (EE.UU.) | 4 |
| Receptora (MX) | 4 |
| Promotor / aliado GTM | 2 |

**Marca:** [BRAND-IDENTITY.md](./BRAND-IDENTITY.md)

---

## Ruta

- **Path:** `/piloto` (`frontend/app/piloto/`)
- **Query:** `?ref=comerciantes|migrantes|pyme|tiendita` → `canal_detalle`
- **Referidos:** `?referido=<uuid>` → `referido_por_id`

---

## Secciones

1. **Hero** — TU FAMILIA MÁS CERCA, CADA MES; contador `{total}/10`
2. **Problema** — colas OXXO, INE, comisiones (sin crypto en titular)
3. **Cómo funciona** — 3 pasos (programar → Solana confirma → familia recibe)
4. **Social proof** — placeholder Michoacán–Texas
5. **Formulario** → `POST /api/pilotos`
6. **Footer** — privacidad + soporte

---

## Estado implementación

| Item | Estado |
|------|--------|
| API `POST /api/pilotos` | Hecho |
| Página `/piloto` | Hecho (`frontend/app/piloto/`) |
| Deploy público | Vercel (`frontend/`) |
