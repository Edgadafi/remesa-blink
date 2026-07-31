# Club TIA — Programa de Lealtad y Volumen

**Estado:** listo para implementar en piloto (100–500 usuarios).  
**Milestone:** post–Demo Day / retención M4+ — no bloquea E2E sandbox.  
**Marca:** Remesa TIA · [BRAND-IDENTITY.md](./BRAND-IDENTITY.md)

---

## Nombre

| Opción | Notas |
|--------|--------|
| **Club TIA** (canónico) | Familiar, alineado a Dorado TIA |
| Viborita Club | Alternativa memorable |
| Círculo Nopal | Visual escudo |

Subtítulo interno: *por volumen, no por hype*.

---

## Niveles (ventana móvil 90 días)

Métricas sobre **pagos confirmados** (`pagos` + `suscripciones.remitente_wa`):

| Nivel | Código | Envíos 90d **o** | Volumen USD 90d | Frecuencia mín. (30d) |
|-------|--------|------------------|-----------------|------------------------|
| Semilla | `semilla` | 1 | ≥ 50 | — |
| Nopal | `nopal` | 3 | ≥ 300 | ≥ 1 |
| Tunal | `tunal` | 6 | ≥ 1_000 | ≥ 2 |
| Águila | `aguila` | 12 | ≥ 3_000 | ≥ 3 |
| Escudo | `escudo` | 24 | ≥ 8_000 | ≥ 4 |

**Puntos:** 1 pt = 1 USD volumen. Bonus streak: +5 pts/semana con ≥1 envío (cap +20/mes).

**Reglas:** máximo nivel que cumpla (envíos **o** volumen) **y** frecuencia del nivel. Degradación con grace 14 días.

**Volumen piloto:** USDC 1:1 USD; SOL × `SOL_USD_RATE` (env, default 0 = excluir SOL del volumen).

---

## Beneficios

Fee base roadmap: 0% MVP → 0.5–0.75% early → 1.5% estándar. Descuentos = multiplicador sobre fee vigente.

| Nivel | Fee | Cashback remesa L1 | Recurrente sin fee plataforma | Exclusivos |
|-------|-----|--------------------|-------------------------------|------------|
| Semilla | base | 1.0% | — | Acceso piloto |
| Nopal | ×0.90 | 1.0% | 1er mes setup | Tip progreso |
| Tunal | ×0.75 | 1.25% | 1 suscripción activa | Early access |
| Águila | ×0.60 | 1.5% | Hasta 2 | Soporte prioritario WA |
| Escudo | ×0.50 | 2.0% | Cap 5 (piloto) | Línea directa + badge |

Referidos L2: **0.5%** (independiente del nivel Club TIA).

**Redención:** automática en keeper; canje saldo vía `*canjear N*` (débito ledger); cupo recurrente en nivel. Cap canje mensual **$15 USD**.

---

## Comunicación WhatsApp (agente TIA)

Comando: `*recompensas*` (NLU: puntos|cashback|recompensas|bono).

**Upgrade:**

> ¡Ey! Subiste a **Tunal** en Club TIA.  
> En los últimos 90 días: 6 envíos · ~$1,200.  
> Ahora tu comisión baja 25% y el cashback sube a 1.25%.  
> Escribe *recompensas* cuando quieras ver tu progreso.

**Progreso (semanal, no spam):**

> Vas a **4/6 envíos** para Tunal. Un envío más esta quincena y desbloqueas menos comisión.

**Escudo:**

> Llegaste a **Escudo**. Soporte prioritario activado. Gracias por confiar en Remesa TIA para lo de cada mes.

No prometer “cero comisión para siempre” ([GUIA-ABORDAJE-PILOTOS.md](./GUIA-ABORDAJE-PILOTOS.md)).

---

## Datos

Tablas: `lealtad_niveles`, `lealtad_miembros`, `lealtad_eventos`, `lealtad_beneficios_aplicados`  
Migración: [db/migrations/004_lealtad_club_tia.sql](../db/migrations/004_lealtad_club_tia.sql)  
Servicio: `backend/src/services/lealtad.ts` · API `GET /api/lealtad/:wa`  
Hook: `keeper/cron` tras `registrarCashbackPorRemesa`.

Extiende `cashback_*`; no sustituye el ledger de cashback USD.

---

## KPIs piloto (sin inventar)

| KPI | Cómo medir |
|-----|------------|
| `% miembros ≥ nopal` | `lealtad_miembros` |
| `volumen_usd_90d` p50 | misma tabla |
| Upgrades / semana | `lealtad_eventos` + cambios de nivel |
| Canjes reales | `cashback_transacciones` tipo `canje` |

Ver [METRICAS-DEMO-DAY.md](./METRICAS-DEMO-DAY.md).
