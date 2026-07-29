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

**Importante — prueba del bot:** el número que escanea el QR *es* el bot. Debes escribirle desde **otro** WhatsApp. No uses el mismo teléfono: antes el bot procesaba sus propios mensajes (`fromMe`), el menú contenía la palabra “enviar” y entraba en loop (“dirección no válida”). Eso ya está corregido (se ignoran mensajes `fromMe` salvo `BOT_ALLOW_FROM_ME=1`).

### Errores `Bad MAC` / `No matching sessions` / `Timed Out` (init queries)

Suelen aparecer tras reinicios bruscos o con JIDs `@lid` (WhatsApp 2026). Con Baileys **7.0.0-rc13** el bot resuelve `remoteJidAlt` / LID→PN.

Si el log sigue lleno de decrypt errors:

```bash
cd ~/remesa-blink/bot
npm run reset-auth   # borra auth_info
npm start            # escanea QR otra vez
```

Luego escribe desde **otro** WA a `+521…` (el número que imprime el bot al conectar).

En **Railway / Render** el disco suele ser efímero: al reiniciar el servicio se pierde la sesión y hay que volver a enlazar el QR, salvo que montes un volumen persistente. Para un hackathon suele bastar con correr el bot en tu máquina y apuntar `BOT_INTERNAL_URL` del deploy del backend a un túnel (ngrok) o dejar notificaciones desactivadas si el bot no está accesible.

## Endpoints internos

| Método | Ruta | Uso |
|--------|------|-----|
| `POST` | `/internal/send` | Body JSON: `{ to, text }` — `to` es número WhatsApp solo dígitos. El keeper/notificaciones lo usan. |
| `GET` | `/health` | `{ ok, whatsappConnected, pid }` — comprobar que el proceso y la sesión WA están vivos. |

## Comandos de usuario

Habla natural: *enviar*, *mis envíos*, *recompensas*, *ayuda*, *soporte*.

Flujo *enviar*: one-shot (`enviar 2000 a mi mujer`) o paso a paso: monto → frecuencia → **nombre** → WhatsApp → código de su app de dinero.

Tras éxito: bloque **Orden confirmada** (o **Orden registrada** si reusa PDA con otro monto).

Smoke NLU: `npm run smoke:nlu`.

Ver tabla en el [README principal](../README.md) (sección “Comandos del bot”).

Los slash (`/recurrente`, etc.) siguen como alias avanzados.

## Arranque

```bash
cd bot && npm install && npm start
```

Asegúrate de que `API_BASE_URL` apunta a un backend con DB y Solana configurados.
