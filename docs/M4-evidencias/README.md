# Evidencias M4 — Diseño PDAs + modelo de confianza

Documentos de diseño (sin implementación de código en este sprint).

| Archivo | Descripción |
|---------|-------------|
| [PDA-ACCOUNTS.md](../PDA-ACCOUNTS.md) | Esquema PDAs, seeds, signers, source of truth, gaps G1–G10 |
| [TRUST-MODEL.md](../TRUST-MODEL.md) | Modelo de confianza: 4 capas producto, 3 dominios, promesa→prueba |
| [UX-TRUST-DESIGN.md](../UX-TRUST-DESIGN.md) | Copy WA y estados UX (Pauline Moon session) |
| [PITCH-TRUST-LAYER.md](../PITCH-TRUST-LAYER.md) | Elevator pitch y Demo Day |
| [GUIA-ABORDAJE-PILOTOS.md](../GUIA-ABORDAJE-PILOTOS.md) | Abordaje familias piloto (registro + 1ª remesa) |
| [VIDEO-GUIA-USUARIO-PILOTO.md](../VIDEO-GUIA-USUARIO-PILOTO.md) | Guion vertical 60–90 s Guía de Usuario |
| [RemesaBlink-Guia-Abordaje-Pilotos.pdf](./RemesaBlink-Guia-Abordaje-Pilotos.pdf) | PDF abordaje |
| [RemesaBlink-Video-Guia-Usuario-Piloto.pdf](./RemesaBlink-Video-Guia-Usuario-Piloto.pdf) | PDF guion video |

## Diagramas (Markdown)

Incluidos en los docs anteriores:

- PDA dependency graph — `PDA-ACCOUNTS.md` §3
- Identidad dual MVP — `PDA-ACCOUNTS.md` §4
- MVP vs Fase E — `PDA-ACCOUNTS.md` §9
- Tres dominios confianza — `TRUST-MODEL.md` §2
- Trust flow E2E — `TRUST-MODEL.md` §2.2

Regenerar PNG en PDF M3 (opcional): añadir bloques Mermaid a `ARCHITECTURE-M3.md` y `npm run docs:pdf:m3`.

## Notas de campo (entrevistas)

Plantilla + entradas: [notas/README.md](./notas/README.md). Meta: **5+** antes de Demo Day.

## Subir a Drive

Carpeta equipo: [Drive WayLearn](https://drive.google.com/drive/folders/1whLI4EutUbPz4OCVkwMFdeH5TZxkoQ8o?usp=sharing)

Sugerencia: subcarpeta `M4-Diseno-PDA-Trust-jul-2026/` + `M4-entrevistas/`

## Sprint siguiente (implementación)

Ver backlog en `PDA-ACCOUNTS.md` §10–11: cancel on-chain, sync PG, migración columnas.  
Capital post Demo Day: [CAPITAL-PIPELINE.md](../CAPITAL-PIPELINE.md).
