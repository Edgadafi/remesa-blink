# Evidencias M3 — Arquitectura On/Off-Chain

| Archivo | Descripción |
|---------|-------------|
| [RemesaBlink-Architecture-M3.pdf](./RemesaBlink-Architecture-M3.pdf) | Entregable PDF (brand kit) |
| [RemesaBlink-Architecture-M3.html](./RemesaBlink-Architecture-M3.html) | HTML intermedio |
| Fuente Markdown | [`../ARCHITECTURE-M3.md`](../ARCHITECTURE-M3.md) — **diagramas Mermaid renderizan en GitHub** |

## Regenerar PDF + diagramas

```bash
npm run docs:diagrams:m3   # solo PNG
npm run docs:pdf:m3        # diagramas + PDF (slogan: Dollars in / Pesos en casa)
```

**WSL (primera vez):** `mmdc` necesita Chrome headless. Si falla con `libnspr4.so` / `libnss3`:

```bash
sudo apt install -y libnss3 libnspr4 libasound2t64 unzip
# o, sin sudo: ver ~/chrome-libs (libs extraídas de .deb) y:
export LD_LIBRARY_PATH=$HOME/chrome-libs/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
npm run docs:pdf:m3
```

### Diagramas (archivos separados)

| Archivo | Contenido |
|---------|-----------|
| `diagrams/m3-08-capa-confianza.png` | Agente → reglas → receipt → humanos |
| `diagrams/m3-01-vista-contexto.png` | Sistema on/off-chain + **capa composabilidad** (receipts, perfiles, lectores) |
| `diagrams/m3-02-flujo-e2e.png` | Secuencia E2E principal |
| `diagrams/m3-09-capa-composabilidad.png` | Escritores (Blink/keeper) → PDAs → API/Explorer/CPI |
| `diagrams/m3-03-mvp-custodia-keeper.png` | Autorización fondos MVP |
| `diagrams/m3-04-fase-e-nocustodial.png` | Objetivo Fase E |
| `diagrams/m3-05-wa-blink-flujo.png` | WhatsApp → Blink |
| `diagrams/m3-06-fallback-ux.png` | Árbol fallback UX |
| `diagrams/m3-07-despliegue-devnet.png` | Despliegue Demo Day (túnel temporal; `api.remesablink.com` pendiente) |

## Subir a Drive

Carpeta equipo: [Drive WayLearn](https://drive.google.com/drive/folders/1whLI4EutUbPz4OCVkwMFdeH5TZxkoQ8o?usp=sharing)

Sugerencia: subcarpeta `M3-Arquitectura-10jul-2026/`
