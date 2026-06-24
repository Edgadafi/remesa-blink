# Validación e identificación de usuarios reales

Protocolo para **Milestone 2 (Business)** y **Milestone 4 (Validación)** — corredor México ↔ EE.UU.

Objetivo: no esperar a M4 para registrar usuarios; **identificarlos desde el primer contacto** con perfil demográfico y canal de confianza.

Persona detallada: [PERSONA-MX-US.md](./PERSONA-MX-US.md).

---

## 1. Quién buscamos (prioridad)

### P0 — Par piloto completo

| Rol | Perfil | Dónde encontrarlo |
|-----|--------|-------------------|
| **Receptora** | Mujer 40–60+, rural/semi-rural MX, no/sub-bancarizada | Red del equipo, tiendita, comerciantes, asociación migrante |
| **Remitente** | Familiar en CA/TX/etc., envía mensualmente | Misma red transnacional |

### P1 — Promotores de confianza

- Dueño/a de tiendita que ya hace remesas o guarda efectivo.
- Promotora comunitaria / microfinanzas.
- Contacto en club de oriundos (EE.UU.).

### P0 no es (por ahora)

- Traders crypto.
- Usuarios solo urbanos CDMX sin vínculo migratorio.
- Testers que no representen fricción real (INE, rural, WhatsApp básico).

---

## 2. Registro desde el primer contacto

Cada persona identificada se registra en **`usuarios_piloto`** (DB) vía API o script.

```bash
curl -X POST http://localhost:3000/api/pilotos \
  -H "Content-Type: application/json" \
  -d '{
    "whatsapp": "5215512345678",
    "rol": "receptora",
    "nombre_opcional": "María",
    "genero": "femenino",
    "edad_rango": "50-64",
    "estado": "Michoacán",
    "municipio": "Ejemplo",
    "zona": "rural",
    "bancarizado": "no",
    "canal_confianza": "tiendita",
    "canal_detalle": "Tiendita Don Pepe, calle principal",
    "notas": "Recibe de hijo en Houston, usa OXXO hoy"
  }'
```

### Campos y por qué importan

| Campo | Uso |
|-------|-----|
| `rol` | remitente / receptora / promotor / tiendita |
| `zona` | rural / semiurbana / urbana — hipótesis ENIF |
| `bancarizado` | si / no / sub — segmentación |
| `canal_confianza` | tiendita / comerciantes / pyme / asociacion_migrante / asociacion / familia / microfinanzas / iglesia / otro |
| `referido_por_id` | Cadena de confianza |
| `estado` | Corredor migratorio |

Consultar pilotos:

```bash
curl http://localhost:3000/api/pilotos
curl http://localhost:3000/api/pilotos?rol=receptora&zona=rural
```

---

## 3. Guion de entrevista (15–20 min)

### Receptora (MX)

1. ¿Quién le envía dinero y con qué frecuencia?
2. ¿Cómo lo recibe hoy? (OXXO, WU, deposito, tiendita, otro)
3. ¿Qué le molesta más? (colas, límites, INE, comisiones, horarios)
4. ¿Tiene cuenta bancaria o app? ¿Por qué sí/no?
5. ¿Usa WhatsApp con su familiar en EE.UU.? ¿Le enseñarían a abrir un link?
6. ¿En quién confía para temas de dinero en su comunidad?

### Remitente (EE.UU.)

1. ¿Cuánto y cada cuánto envía?
2. ¿Usa app, WU, banco, crypto?
3. ¿Le gustaría **programar** el envío y olvidarse?
4. ¿La familia en MX tendría problemas con INE / smartphone / internet?

**Cierre:** “¿Probaría una remesa pequeña de prueba con nosotros la próxima semana?”

Documentar en `notas` del registro + fecha en Google Doc / Drive (M4).

---

## 4. Calendario sugerido (WayLearn)

| Semana | Acción |
|--------|--------|
| **M1 (now)** | Persona documentada; 0–2 contactos calientes listados |
| **M2 (3 jul)** | 3 entrevistas + 1 registro en `usuarios_piloto` |
| **M3–M5** | 1 familia piloto E2E (WA + Blink) |
| **M4 (31 jul)** | 5–10 entrevistas; tabla pilotos exportada a Drive |
| **M6–Demo Day** | Testimonio / quote de receptora en pitch |

---

## 5. Señales de validación (M2 Business Foundation)

WayLearn pide señal concreta de interés. Para Remesa Blink:

| Señal | Evidencia |
|-------|-----------|
| Waitlist / registro piloto | Filas en `usuarios_piloto` |
| Entrevistas | Notas + fecha |
| Flujo completado | Tx devnet + WA screenshot |
| Referido por promotor | `referido_por_id` + `canal_confianza` |

---

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Receptora no abre Blink | Familiar en WA envía link; llamada de 5 min |
| KYC Etherfuse falla | Demo USDC en wallet; MXN como fase 2 piloto |
| Desconfianza crypto | No decir “crypto” primero — “link seguro que te manda tu hijo” |
| INE vencido | Documentar blocker; alianza tiendita como puente |

---

## 7. Evidencias para Drive (M4)

- [ ] Export CSV `usuarios_piloto`
- [ ] 5 resúmenes de entrevista (1 párrafo c/u)
- [ ] 3 screenshots WA / Blink
- [ ] Lista de cambios al producto post-feedback
