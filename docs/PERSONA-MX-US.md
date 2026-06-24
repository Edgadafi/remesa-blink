# Persona — Corredor México ↔ EE.UU.

Documento de referencia para producto, pitch WayLearn y validación con usuarios reales (M2, M4).

**Corredor:** migración histórica → Michoacán, Guanajuato, Jalisco, Guerrero, Oaxaca, etc.  
**Canal MVP:** WhatsApp + Blinks (no asumir “joven urbano con celular pro”).

---

## 1. Usuaria objetivo primaria: receptora no bancarizada

| Dimensión | Perfil |
|-----------|--------|
| **Género y rol** | ~60–70% mujeres receptoras; madres, esposas o hijas adultas que administran el hogar. Remitente en EE.UU. suele ser hombre (CA, TX, etc.). |
| **Edad** | 30–50+; muchas jefas de hogar 50+ (padres/madres de migrantes de larga duración). |
| **Ubicación** | Rural o semi-rural (<15k hab.). Brecha financiera rural ~57% vs urbana ~74%. |
| **Ocupación** | Informal: tiendita, agricultura, hogar. Educación primaria o menos. Ingresos bajos. |
| **Dependencia** | Remesas para consumo básico (no siempre inversión productiva). Población indígena sobrerrepresentada en zonas rurales. |

**No es:** early adopter crypto nativo. **Sí es:** alguien cuya economía gira en **redes familiares transnacionales** y subsistencia.

### Usuario secundario: remitente en diáspora

- Envía de forma **recurrente** (renta, apoyo mensual, medicinas, escuela).
- Ya usa WhatsApp diariamente con la familia.
- Puede ser crypto-curioso; la receptora en MX **no tiene por qué serlo** al inicio.

---

## 2. Por qué queda fuera del sistema formal

### Exclusión involuntaria (dominante en rural)

- Pocas sucursales / cajeros (ENIF: brecha geográfica).
- Ingresos percibidos como insuficientes (~57% cita “fondos insuficientes”).
- Sin historial crediticio ni documentación completa.
- Barreras extra para indígenas y adultas mayores.

### Decisión activa / desconfianza

- Comisiones ocultas, burocracia, fraudes previos.
- “El banco es para ricos”.
- Preferencia por **lo conocido** (efectivo, tiendita, tanda).
- Brecha de género en crédito y seguros.

**Implicación producto:** confianza > features. Prueba social y canales locales antes que “solo app”.

---

## 3. Cómo manejan el dinero hoy

| Mecanismo | Uso |
|-----------|-----|
| **Efectivo / colchón** | Guardar en casa; bienes que preservan valor |
| **Tandas y cajas** | ~22% en algunos levantamientos; confianza interpersonal |
| **Préstamos familiares** | Sin contrato formal |
| **OXXO / tienditas** | Depósitos, retiros, remesas (CoDi/apps sin banco pleno) |
| **WU / casas de cambio** | Recurrente pero caro y físico |

**Principio Remesa Blink:** integrarnos a estas redes, **no reemplazarlas de golpe**.

---

## 4. Fricciones actuales (receptora + OXXO / WU)

- Límites por transacción (~$3k–4k MXN en OXXO) → múltiples visitas.
- INE / pasaporte vigente (difícil para adultas mayores o docs vencidos).
- Colas, horarios, riesgo al salir con efectivo.
- Comisiones y tipo de cambio poco transparentes.
- Efectivo no siempre disponible en tienda rural.
- **Remesas recurrentes pequeñas** = alta fricción si cada mes hay que ir físicamente.

→ Oportunidad MVP: **recurrencia + notificación en WhatsApp** — solo si hay **confianza** primero.

---

## 5. Actores con confianza real (go-to-market)

| Actor | Rol en adopción |
|-------|-----------------|
| **Tienditas de barrio** | Ya mueven efectivo/remesas; conocen a la clientela |
| **Redes de comerciantes / CANACO** | Escalan confianza entre negocios tech-curiosos |
| **Grupos WA emprendedores / PYMEs** | Difusión y pre-calificación de leads digitales |
| **Asociaciones de migrantes (EE.UU.)** | Canal hacia remitentes y validación familia completa |
| **Promotoras de microfinanzas** | Conocen dinámicas locales y mujeres jefas de hogar |
| **Iglesias / párrocos** | Contacto secundario en algunas zonas — no canal principal |

**Estrategia:** piloto vía **referido de confianza** (tiendita / comerciantes / asociación migrante), no cold outreach genérico.

---

## 6. Implicaciones para Remesa Blink

### Producto

- **WhatsApp primero** para la receptora; web para remitente crypto-curioso.
- Mensajes en **español simple**, sin jerga DeFi.
- Blink = “link para recibir” explicado por familiar o promotor, no tutorial largo.
- Off-ramp MXN (Etherfuse) debe contemplar **KYC/INE** — diseñar fallback (USDC en wallet + acompañamiento humano).

### Composabilidad (conexión estratégica)

- `PerfilDestinatario` on-chain = historial de recepción **verificable** para crédito futuro sin buró tradicional.
- Hoy identificamos `usuario_remitente` / wallet destino; en piloto registramos **perfil demográfico off-chain** ([`usuarios_piloto`](../../db/schema.sql)).

### Confianza antes que crypto

1. Prueba con **1 familia real** (remitente EE.UU. + receptora MX) vía contacto cálido.
2. Promotor local explica el flujo (5 min por teléfono).
3. Primera remesa pequeña; feedback antes de escalar.

---

## 7. Métricas de validación (WayLearn M2 / M4)

| Métrica | Meta incubación |
|---------|-----------------|
| Entrevistas receptoras | 5+ (rural/semi-rural preferente) |
| Familias en piloto activo | 3–5 |
| Remesas recurrentes completadas | ≥1 por familia |
| NPS / “volvería a usar” | Cualitativo documentado |
| Canal de confianza registrado | 100% pilotos con `canal_confianza` |

Ver protocolo: [VALIDACION-USUARIOS.md](./VALIDACION-USUARIOS.md).

---

## Referencias internas

- [ROADMAP-M1.md](./ROADMAP-M1.md)
- [COMPOSABILITY.md](./COMPOSABILITY.md)
- [DEMO.md](../DEMO.md)
