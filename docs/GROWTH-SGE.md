# Growth Engineering — Remesa Blink (SGE-adapted)

> Método inspirado en [Social Growth Engineers](https://www.socialgrowthengineers.com/):  
> **datos reales → hooks → formato repetible → funnel corto → producto**.  
> No inventar métricas. No crypto-first en el titular. ICP: [PERSONA-MX-US.md](./PERSONA-MX-US.md).

**Prioridad:** Remesa Blink (antes que AviProfit / El Canario / retirobtc).  
**Meta piloto:** [LANDING-WAITLIST-SPEC.md](./LANDING-WAITLIST-SPEC.md) — **10 familias** antes del Demo Day (**31 ago 2026**).

---

## 1. Principios (traducción SGE → Remesa Blink)

| Principio SGE | Aplicación Remesa Blink |
|---------------|-------------------------|
| Datos > alucinación | Hooks/formatos tomados de videos reales de remesas/fintech; anotar vistas y creator |
| Orgánico como motor | Volumen + iteración; ads solo después de un formato ganador |
| Format repeater | Un formato que convierte → repetir con variaciones de hook |
| Hook rotation | 3 aperturas distintas del mismo mensaje/día |
| Funnel corto | Contenido → bio (UTM) → `/piloto` → WhatsApp / form |
| Multiplicar idioma | ES (MX) + EN (diáspora US) con el mismo script |

**Anti-patrones:** promesas de “cero comisión garantizada”, jerga DeFi en el primer segundo, stats inventados, CTA a “conecta wallet” antes de empatía familiar.

---

## 2. Funnel oficial (14 días)

**URL canónica (producción Vercel):**  
https://frontend-bay-phi-92.vercel.app/piloto  
(Fuente: [DEPLOY.md](../DEPLOY.md), `frontend/app/piloto/layout.tsx`)

```
IG / TikTok / X
  → bio + UTM
  → https://frontend-bay-phi-92.vercel.app/piloto?<utm>
  → POST /api/pilotos  OR  WhatsApp
  → cualificación (remitente / receptora / promotor)
```

**Lead magnet (recomendado):**  
*“Checklist: remesa recurrente sin cola OXXO (MX–US)”* — PDF o mensaje WA de 1 página.

### Links UTM finales (copiar / pegar)

| Uso | URL |
|-----|-----|
| **Bio Instagram / reel Semana 1** | https://frontend-bay-phi-92.vercel.app/piloto?utm_source=instagram&utm_medium=reel&utm_campaign=remesa_sge_w1 |
| Carrusel IG | https://frontend-bay-phi-92.vercel.app/piloto?utm_source=instagram&utm_medium=carousel&utm_campaign=remesa_sge_w1 |
| Stories IG | https://frontend-bay-phi-92.vercel.app/piloto?utm_source=instagram&utm_medium=story&utm_campaign=remesa_sge_w1 |
| TikTok | https://frontend-bay-phi-92.vercel.app/piloto?utm_source=tiktok&utm_medium=video&utm_campaign=remesa_sge_w1 |
| X / Twitter | https://frontend-bay-phi-92.vercel.app/piloto?utm_source=x&utm_medium=thread&utm_campaign=remesa_sge_w1 |
| Semana 2 (cuando toque) | …`utm_campaign=remesa_sge_w2` |

**Refs de canal** (query ya soportada en landing):  
`&ref=comerciantes|migrantes|pyme|tiendita`  
Ejemplo bio tienditas:  
https://frontend-bay-phi-92.vercel.app/piloto?utm_source=instagram&utm_medium=reel&utm_campaign=remesa_sge_w1&ref=tiendita

---

## 3. Cadencia semanal (sistema)

| Día | Entrega |
|-----|---------|
| Lun | Investigación: 10–20 piezas de remesas/fintech LATAM (tabla evidencia) |
| Mar–Dom | 1 reel o 3 cortes/día con **rotación de hooks** |
| Vie | Revisar top 3 por retención/CTR; marcar formato ganador |
| Dom | Repetir formato ganador ×3 variaciones; actualizar esta doc |

**Tipos de contenido (mix):**

1. **Problema** — colas, INE, comisiones, familia esperando  
2. **Demo** — programar remesa → aviso WhatsApp (sin crypto en titular)  
3. **Confianza** — tiendita / redes familiares / recibo on-chain en segundo plano  
4. **Build-in-public** — keeper, Blink, piloto (founder POV)

---

## 4. Tabla de evidencia (plantilla)

Rellenar cada lunes. **No publicar claims sin fila aquí.**

| # | Fecha | Plataforma | Creator / URL | Hook exacto (cita) | Vistas (aprox.) | Formato | Insight para Remesa |
|---|-------|------------|---------------|--------------------|-----------------|---------|---------------------|
| 1 | | | | | | | |
| … | | | | | | | |

---

## 5. Banco de hooks (v1 — hipótesis; validar con evidencia)

Hooks listos para probar. Marcar ✅ cuando un reel/corte use el hook y anotar resultado.

| # | Hook (voz) | Texto en pantalla | Ángulo |
|---|------------|-------------------|--------|
| 1 | “Tu familia en México espera… y la comisión se come el envío.” | `Comisión vs familia` | Problema |
| 2 | “¿Otra vez fila en OXXO solo para cobrar lo de tu hijo?” | `Sin cola otra vez` | Receptora |
| 3 | “Programa la remesa una vez. Ella recibe aviso en WhatsApp cada mes.” | `1 vez → cada mes` | Demo |
| 4 | “Remitente en Texas. Madre en Michoacán. Misma conversación de siempre… menos fricción.” | `TX → Mich` | Corredor |
| 5 | “No es ‘crypto primero’. Es que tu familia reciba, a tiempo.” | `Familia primero` | Confianza |
| 6 | “Si ya mandas todos los meses, ¿por qué repetir el trámite cada vez?” | `Recurrente` | Producto |
| 7 | “La tiendita de confianza también puede ser el puente.” | `Red local` | GTM aliado |
| 8 | “Aviso en WhatsApp cuando el pago corre. Ella no tiene que ‘entender blockchain’.” | `WA = claridad` | UX |
| 9 | “Estamos buscando 10 familias piloto MX–US antes de Demo Day.” | `10/10 piloto` | Waitlist |
| 10 | “De datos a cercanía: remesa programada, recibo verificable.” | `Cerca, cada mes` | Brand |

---

## 6. Guion reel fundador (~35 s) — Semana 1

**Formato:** 9:16 · subtítulos grandes · cortes 2–3 s.

| Tiempo | Qué dices | Texto en pantalla |
|--------|-----------|-------------------|
| 0–4 s | “¿Otra vez fila y comisión solo para que tu familia cobré lo del mes?” | Hook #2 o #1 |
| 4–12 s | “Madre en Michoacán, remitente en Texas: WhatsApp todos los días… y un envío que duele cada vez.” | `MX ↔ US` |
| 12–22 s | “Remesa Blink: programas una remesa recurrente; ella recibe aviso. Menos cola, más claridad.” | `Programar → WA` |
| 22–28 s | “Buscamos 10 familias piloto. Entra al link de la bio.” | `Piloto 10 familias` · bio = UTM w1 |
| 28–35 s | “Remesa Blink — tu familia más cerca, cada mes.” | Brand + CTA |

**Caption (ES):**

> Remesa recurrente MX–US: menos fila, más claridad para tu familia.  
> Únete al piloto (10 familias) → link en bio.  
> #Remesas #Mexico #Diaspora #Fintech #WhatsApp #Solana (opcional al final)

**Disclaimer corto (caption o sticker):**  
Herramienta en piloto / demos en red de prueba según el entorno. No es consejo financiero.

**Portada sugerida:** `¿Otra vez fila por la remesa?`

---

## 7. KPIs (no vanidad)

| KPI | Meta 14 días (ajustar) |
|-----|------------------------|
| Leads `/piloto` | → rumbo a 10 cualificados |
| Conversaciones WA calificadas | ≥ 5/semana |
| Formato ganador | 1 identificado (retención o CTR) |
| Hooks validados | ≥ 3 del banco con evidencia |
| Club TIA (≥ Nopal) | Medir tras volumen real — ver [PROGRAMA-LEALTAD-CLUB-TIA.md](./PROGRAMA-LEALTAD-CLUB-TIA.md); no inventar % |

---

## 8. Playbook multi-proyecto (después de Remesa)

Misma plantilla para AviProfit, El Canario, retirobtc:

1. Investigar (evidencia)  
2. Extraer hooks  
3. Script + CTA a funnel propio  
4. Publicar con UTM  
5. Medir  
6. Repetir formato ganador  

---

## 9. Referencias internas

- Persona: [PERSONA-MX-US.md](./PERSONA-MX-US.md)  
- Piloto: [LANDING-WAITLIST-SPEC.md](./LANDING-WAITLIST-SPEC.md)  
- Demo técnica: [DEMO.md](../DEMO.md)  
- Marca: [BRAND-IDENTITY.md](./BRAND-IDENTITY.md)  
- Validación: [VALIDACION-USUARIOS.md](./VALIDACION-USUARIOS.md)  
- Lealtad piloto: [PROGRAMA-LEALTAD-CLUB-TIA.md](./PROGRAMA-LEALTAD-CLUB-TIA.md)  

**SGE (externo):** https://www.socialgrowthengineers.com/
