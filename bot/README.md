# Bot WhatsApp (Baileys)

Cliente WhatsApp que expone los mismos flujos que el backend: suscripciones recurrentes, consulta de remesas, cashback y notificaciones cuando el **keeper** ejecuta un pago.

## Variables de entorno

Copia `.env.example` a `.env` (si no existe, define al menos):

| Variable | Descripción |
|----------|-------------|
| `API_BASE_URL` | URL del backend Express (ej. `http://localhost:3000`). |
| `BOT_INTERNAL_PORT` | Puerto del mini servidor Express (default `3002`). El keeper llama a `POST http://.../internal/send`. |
| `BOT_INTERNAL_SECRET` | Opcional. Si está definido, las peticiones a `/internal/send` deben enviar `Authorization: Bearer <valor>`. |
| `DEBUG` | Si está definido, más logs de Baileys. |

## Sesión (`auth_info/`)

Baileys guarda la sesión en `bot/auth_info/`. Tras escanear el QR una vez, no hace falta repetir en local.

En **Railway / Render** el disco suele ser efímero: al reiniciar el servicio se pierde la sesión y hay que volver a enlazar el QR, salvo que montes un volumen persistente. Para un hackathon suele bastar con correr el bot en tu máquina y apuntar `BOT_INTERNAL_URL` del deploy del backend a un túnel (ngrok) o dejar notificaciones desactivadas si el bot no está accesible.

## Endpoints internos

| Método | Ruta | Uso |
|--------|------|-----|
| `POST` | `/internal/send` | Body JSON: `{ to, text }` — `to` es número WhatsApp solo dígitos. El keeper/notificaciones lo usan. |
| `GET` | `/health` | `{ ok, whatsappConnected, pid }` — comprobar que el proceso y la sesión WA están vivos. |

## Comandos de usuario

Habla natural: *enviar*, *mis envíos*, *recompensas*, *ayuda*, *soporte*.

Ver tabla en el [README principal](../README.md) (sección “Comandos del bot”).

Los slash (`/recurrente`, etc.) siguen como alias avanzados.

## Arranque

```bash
cd bot && npm install && npm start
```

Asegúrate de que `API_BASE_URL` apunta a un backend con DB y Solana configurados.
