# Cambios de producto post-feedback (M4)

Lista para WayLearn — solo cambios **reales** del repo (jul–ago 2026).  
Fuente de señales: ensayo WA 2026-07-29, Plan B offramp, soporte piloto.

| # | Feedback / dolor | Cambio shipped | Evidencia |
|---|------------------|----------------|-----------|
| 1 | “Quiero mandar a *mi mujer*, no pegar un código largo” | Alias `nombre_contacto` + one-shot NLU (`Enviar 2000 a mi amor`) | Bot `copy.ts` / `nlu.ts`; nota `nota-2026-07-29-mi-reina-qa.md` |
| 2 | Confusión monto pedido vs monto activo (PDA reuse) | Copy honesto “Orden registrada” / monto on-chain | `UX-BOT-MEJORAS.md` + bot confirmaciones |
| 3 | Wallet Sumsub `.test` quemada | Escape hatch wallet demo + runbook | `OFFRAMP-DEMO-DAY.md` |
| 4 | Blink / SPEI no completa en sandbox | Plan B Demo Day: status page honesta, sin inventar pesos | `OFFRAMP-DEMO-DAY.md`, `DEMO.md` |
| 5 | “¿Con quién hablo si falla?” | Comando `*soporte*` menú 1–4 + tickets DB; mismo número del bot | `POST /api/soporte`; migración `005` |
| 6 | Landing sin CTA WhatsApp al bot | `NEXT_PUBLIC_WA_SUPPORT` = número Baileys del bot | Vercel + `frontend/lib/config.ts` |
| 7 | Retención early adopters | Programa **Club TIA** (niveles + cashback dinámico) | `PROGRAMA-LEALTAD-CLUB-TIA.md`; migración `004` |
| 8 | Abordaje con jerga crypto | Guías familia-first (sin Phantom obligatorio para receptora) | `GUIA-ABORDAJE-PILOTOS.md` |
| 9 | “Difícil leer el formulario” (waitlist) | Backlog tipografía `/piloto` (Palatino/Garamond — revisar contraste tamaño) | Nota `nota-2026-07-29-diana-waitlist.md` |

## Próximos cambios (backlog validación)

| Prioridad | Idea | Bloqueado por |
|-----------|------|----------------|
| P0 | 4 entrevistas receptoras rurales documentadas | Contactos campo |
| P0 | Screenshots ensayo Plan B en `M4-evidencias/screenshots/` | Ensayo phone |
| P1 | Cambiar monto on-chain (hoy: soporte / nueva suscripción) | Scope Anchor |
| P1 | Tunnel/API hostname fijo para demos | Cloudflare named tunnel / Render |

**Regla:** no inventar métricas ni quotes de usuarias que no existan en `notas/`.
