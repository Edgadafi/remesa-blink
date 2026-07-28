# M1 Evidencias — WayLearn Milestone 1

Carpeta de anexos para subir a Google Drive junto con [ROADMAP-M1-DRIVE.md](../ROADMAP-M1-DRIVE.md).

**Fecha:** 26 jun 2026 · **Program ID devnet:** `B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2`

---

## Contenido

| Archivo | Descripción |
|---------|-------------|
| [MANIFEST.md](./MANIFEST.md) | Checklist de evidencias |
| `backend-tests.log` | 42 tests backend OK |
| `frontend-build.log` | Next.js build OK (incl. `/piloto`) |
| `e2e-sol.log` | Salida `npm run e2e:sol` (si keeper/RPC disponibles) |
| `e2e-usdc.log` | Salida `npm run e2e:usdc` (requiere USDC en keeper) |
| `curl-composability.sh` | Ejemplo API composabilidad |
| `explorer-links.md` | URLs Solana Explorer devnet |

---

## Capturas manuales pendientes (usuario)

1. Screenshot Solana Explorer — tx suscripción + Receipt PDA
2. Screenshot frontend `http://localhost:3003` (wallet conectada)
3. Screenshot landing `http://localhost:3003/piloto`
4. Export PDF del Google Doc (ver [M1-UPLOAD-DRIVE.md](../M1-UPLOAD-DRIVE.md))

---

## Regenerar evidencias

```bash
# Tests
cd backend && npm test | tee ../docs/M1-evidencias/backend-tests.log

# Build frontend
cd frontend && npm run build | tee ../docs/M1-evidencias/frontend-build.log

# E2E (requiere backend/.env + keeper fondeado)
npm run e2e:sol  | tee docs/M1-evidencias/e2e-sol.log
npm run e2e:usdc | tee docs/M1-evidencias/e2e-usdc.log
```
