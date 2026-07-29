# Growth — Explorador Local

Script de prospección para encontrar tienditas / aliados locales (abarrote, cibercafé, miscelánea) vía Google Places y generar un CSV con enlaces de WhatsApp listos para contacto humano.

## Requisitos

1. Cuenta de Google Cloud con **Places API** (Text Search + Place Details) habilitada.
2. API key con restricción razonable (IP / HTTP referrer según tu uso).
3. Node.js 20+.

## Instalación

```bash
cd scripts/growth
cp .env.example .env
# Edita .env y pon GOOGLE_PLACES_API_KEY=...
npm install
```

Desde la raíz del monorepo:

```bash
npm run growth:explorador
```

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `GOOGLE_PLACES_API_KEY` | sí | Clave de Places API |
| `MAX_RESULTS_PER_QUERY` | no | Máx. resultados por query (default `10`) |
| `OUTPUT_CSV` | no | Ruta del CSV (default `./out/prospectos_aliados.csv`) |
| `QUERIES` | no | Queries separadas por `\|` (si no hay argv) |

## Uso

```bash
# Defaults (Sahuayo / Lagos de Moreno / Silao)
npm run explorador

# Queries por CLI
npm run explorador -- "Abarrotes en Pénjamo, Guanajuato" "Miscelánea en La Piedad, Michoacán"

# Desde la raíz
npm run growth:explorador -- "Cibercafé en Sahuayo, Michoacán"
```

El CSV incluye: `nombre`, `direccion`, `telefono`, `municipio`, `query`, `whatsAppLink`.

## Compliance / uso responsable

- **No envía WhatsApp automáticamente.** Solo genera links `wa.me` para que una persona abra el chat.
- El pitch **no usa jerga Solana/crypto**; habla de familias, remesas y comisión por ayuda.
- En la conversación humana, **aclara el modelo de comisión** (qué se paga, por qué remesa, y que no es “ganar dinero fácil”).
- Respeta cuotas de Places API y las políticas de Google / WhatsApp (no spam masivo).
- Deduplica por teléfono / `place_id`; descarta negocios sin teléfono válido MX.
