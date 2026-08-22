# Remesa Blink - Sistema de Remesas Recurrentes

Sistema de remesas recurrentes con programa Anchor en Solana, backend Express, bot WhatsApp (Baileys), Blinks y keeper cron.

**Demo en vivo:** ver [DEMO.md](./DEMO.md) (guión ~3 min + checklist WayLearn).

**Composabilidad on-chain:** eventos `PagoEjecutado`, PDAs `PagoReceipt` y perfiles por wallet. Ver [docs/COMPOSABILITY.md](./docs/COMPOSABILITY.md).

**Usuarios reales (corredor MX ↔ EE.UU.):** persona no bancarizada, receptora rural, confianza vía tiendita/comerciantes/PYMEs/familia. Ver [docs/PERSONA-MX-US.md](./docs/PERSONA-MX-US.md) y registro [docs/VALIDACION-USUARIOS.md](./docs/VALIDACION-USUARIOS.md) · API `POST /api/pilotos` · landing `/piloto`.

**Crecimiento (SGE / IA):** playbook orgánico con hooks + funnel → [docs/GROWTH-SGE.md](./docs/GROWTH-SGE.md).

## Estructura

```
remesa-blink/
├── anchor/remesas_recurrentes/   # Programa Anchor
├── backend/                      # API Express + Keeper
├── bot/                          # Bot WhatsApp (Baileys)
├── blinks/                       # Servidor Blinks (legacy / standalone)
├── frontend/                     # Next.js — interfaz web (suscripciones, cashback, enlaces Blinks)
├── db/                           # Schema PostgreSQL
└── README.md
```

## Requisitos

- Node.js 18+
- PostgreSQL
- Solana CLI (Anchor)
- Rust

## 1. Programa Anchor

```bash
cd anchor/remesas_recurrentes
yarn install
anchor build
anchor deploy --provider.cluster devnet
```

Anota el `PROGRAM_ID` (en Anchor.toml) para el backend.

## 2. Base de datos

**Opción A - Docker** (recomendado para desarrollo local):
```bash
docker compose up -d
sleep 5 && npm run db:schema
```
Asegura `DATABASE_URL=postgresql://user:pass@localhost:5432/remesa_blink` en `backend/.env` (ver `docker-compose.yml`).

**Opción B - PostgreSQL local**:
```bash
sudo apt install postgresql postgresql-client
sudo service postgresql start
sudo -u postgres createdb remesa_blink
# Ajusta user/pass en backend/.env para tu usuario PostgreSQL
npm run db:schema
```

**Opción C - Neon/Supabase** (gratis, sin instalar):
1. Crea cuenta en [neon.tech](https://neon.tech) o [supabase.com](https://supabase.com)
2. Crea un proyecto y copia la connection string
3. Ponla en `backend/.env` como `DATABASE_URL`
4. `npm run db:schema` (desde la raíz del proyecto)

## 3. Variables de entorno

Copia los `.env.example` en cada módulo y configura:

**backend/.env**
- `DATABASE_URL`: PostgreSQL
- `SOLANA_RPC_URL`: https://api.devnet.solana.com
- `PROGRAM_ID`: ID del programa Anchor
- `KEEPER_PRIVATE_KEY`: Clave base58 del keeper (wallet que ejecuta pagos)

**bot/.env**
- `API_BASE_URL`: http://localhost:3000

**blinks/.env**
- `PORT`: 3001
- `BLINKS_BASE_URL`: URL pública del servidor Blinks

**frontend/.env** (copia desde `frontend/.env.example`)
- Abres la app en **`http://localhost:3003`** (`npm run dev:web`).
- **`NEXT_PUBLIC_API_URL`**: URL del **backend** (normalmente `http://localhost:3000`), no la del frontend. Si la pones en 3003, las peticiones fallan porque Next no es el API.
- `NEXT_PUBLIC_BLINKS_BASE_URL`: opcional; si los Blinks están en otro origen que el API

## 4. Faucet (SOL de prueba)

```bash
solana airdrop 2 <KEEPER_ADDRESS> --url devnet
```

## 5. Ejecutar servicios

En terminales separadas (o desde raíz con `npm run`):

```bash
# Backend API + Blinks (unificado)
npm run dev
# o: cd backend && npm run dev

# Keeper (cron cada hora)
npm run keeper

# Bot WhatsApp
cd bot && npm install && npm run start

# Frontend web (Next.js en :3003 — evita choque con backend :3000)
cd frontend && npm install && npm run dev
# o desde raíz: npm run dev:web
```

**Scripts desde raíz:**
- `npm run dev` — Backend + Blinks
- `npm run dev:web` — Interfaz web Next.js (`frontend/`)
- `npm run build:web` / `npm run start:web` — Build y producción del frontend
- `npm run keeper` — Keeper cron
- `npm run keeper:airdrop` — Dirección para airdrop
- `npm run keeper:usdc-ata` — Crear ATA USDC del keeper
- `npm run e2e:sol` — E2E: suscripción SOL + keeper + cashback
- `npm run e2e:usdc` — E2E: suscripción USDC + keeper
- `npm run preflight` — smoke keeper + balance USDC
- `npm run anchor:test` — tests Anchor (local validator)

## 6. Flujo de prueba

1. **Registrar suscripción SOL**: `/recurrente 0.01 diario 521234567890 F3bBUduLLoLFxCpEmPuQXvHwM2yshiHFuTvAcGJ4ANm3`
2. **Registrar suscripción USDC**: `/recurrente 10 USDC diario 521234567890 F3bBUduLLoLFxCpEmPuQXvHwM2yshiHFuTvAcGJ4ANm3`
3. **Ver suscripciones**: `/mis-remesas`
4. **Cashback**: `/cashback`, `/generar-codigo`
5. **Blinks**: `enviar-remesa` (SOL), `enviar-remesa-usdc` (USDC), `convertir-mxn` (USDC→MXN), `onboarding-mxn` (KYC+CLABE)

### Flujo USDC → MXN (Etherfuse)

1. Destinatario completa onboarding: `POST /api/etherfuse/onboarding-url` con `{ destinatario_solana, destinatario_wa? }` → obtiene URL Etherfuse (KYC + CLABE)
2. Etherfuse envía webhook `kyc_updated` → actualizamos `beneficiarios_etherfuse.kyc_status = 'verified'`
3. Keeper ejecuta pago USDC → incluye Blink `convertir-mxn` (si KYC ok) o `onboarding-mxn` (si pendiente)
4. Destinatario usa Blink `convertir-mxn` → firma burn USDC → recibe MXN en SPEI

## Comandos del bot

Lenguaje natural (recomendado para piloto / Demo Day):

| Escribes | Qué hace |
|----------|----------|
| hola / ayuda | Menú |
| enviar | Guía paso a paso (monto → frecuencia → nombre → WA familia → wallet) |
| mis envíos | Lista remesas activas |
| recompensas | Cashback / referidos |
| soporte | Contacto humano |
| cancelar | Sale del flujo *enviar* |

Alias técnicos (siguen funcionando): `/recurrente`, `/mis-remesas`, `/cashback`, `/ayuda`, `/generar-codigo`, `/canjear`, `/soporte`.

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/suscripciones | Registrar suscripción |
| GET | /api/suscripciones/:wa | Listar suscripciones |
| POST | /api/cashback/generar-codigo | Generar código referido |
| POST | /api/cashback/registrar-referido | Registrar referido |
| GET | /api/cashback/:wa | Resumen cashback |
| POST | /api/cashback/canjear | Canjear cashback |
| POST | /api/etherfuse/onboarding-url | URL KYC+CLABE (destinatario_solana, destinatario_wa?) |

## Cronograma de implementación (7 días)

| Día | Tareas |
|-----|--------|
| 1 | Programa Anchor, deploy devnet |
| 2 | Schema PostgreSQL, backend DB |
| 3 | Endpoints suscripciones y cashback |
| 4 | Keeper cron |
| 5 | Bot Baileys |
| 6 | Blinks, pruebas E2E |
| 7 | README, ajustes |
