# RemesaBlink — Roadmap Inicial del Producto

**Milestone 1 — WayLearn Solana Latam Labs Program**

---

## Portada

| Campo | Valor |
|-------|-------|
| **Proyecto** | RemesaBlink (Remesa Blink) |
| **Equipo** | [NOMBRE INTEGRANTE 1] · [NOMBRE INTEGRANTE 2] · [NOMBRE INTEGRANTE 3] |
| **Contacto** | soporte@remesablink.com |
| **Fecha entrega M1** | 26 de junio de 2026 |
| **Demo Day** | 31 de agosto de 2026 |
| **Carpeta Drive equipo** | [PEGAR LINK CARPETA DRIVE WAYLEARN] |
| **Mentor WayLearn** | [NOMBRE MENTOR — Discord WayLearn] |
| **Repositorio** | [PEGAR LINK GITHUB] |

---

## 1. Problema que busca resolver

Familias en el corredor México ↔ Estados Unidos dependen de remesas recurrentes para consumo básico. El flujo actual es manual, caro y repetitivo: colas en OXXO o Western Union, identificación vigente, límites por transacción, comisiones opacas y desplazamiento en zonas rurales sin sucursales bancarias.

La receptora primaria — mayoritariamente mujer, 40–60 años, zona rural — queda fuera del sistema formal bancario. No tiene historial crediticio, prefiere efectivo y redes de confianza (tiendita, familia, tandas), y repite el mismo trámite físico cada mes aunque el monto y el remitente sean los mismos.

Oportunidad técnica: un historial de pagos verificable en blockchain puede convertirse en reputación financiera portable para crédito o inclusión financiera futura, sin depender de buró tradicional.

---

## 2. Usuario objetivo

| Usuario | Perfil | Job-to-be-done |
|---------|--------|----------------|
| Primario | Receptora rural MX, 40–60+, sub-bancarizada | Recibir apoyo recurrente sin ir cada mes a OXXO |
| Secundario | Remitente diáspora (CA/TX), $200–800/mes | Programar envío y olvidarse; avisar por WhatsApp |
| Canal GTM | Tiendita / comerciantes / PYMEs / asociación migrante | Generar confianza local + disposición a probar tecnología |

No es joven crypto-native; sí usa WhatsApp con la familia.

### Canales de confianza (GTM)

No vendemos directo a la receptora sin mediador. Priorizamos tienditas de barrio, redes de comerciantes y comunidades de PYMEs locales abiertas a WhatsApp y links de pago. Complementamos con asociaciones de migrantes en EE.UU. para captar remitentes. La iglesia puede ser contacto secundario en algunas zonas, pero no es el canal principal del go-to-market.

### Perfiles concretos de aliados (5)

| Perfil | Métrica de éxito |
|--------|------------------|
| Dueño/a tiendita abarrotes (MX rural) | ≥3 familias referidas; 1 par E2E activo |
| Coordinador/a CANACO o asociación comerciantes | ≥15 asistentes demo; ≥5 leads |
| Admin grupo WA emprendedores/PYMEs | ≥50 clicks landing; ≥10 registros |
| Presidente club oriundos (Houston, Dallas, LA) | ≥5 remitentes; ≥3 pares familia en DB |
| Promotor/a microfinanzas comunitaria | ≥5 entrevistas; ≥2 receptoras en piloto |

Priorización piloto: tiendita MX + asociación migrante EE.UU. → un flujo E2E real antes de escalar.

Copy aliados: "Somos RemesaBlink: remesas recurrentes que llegan por WhatsApp. Buscamos 10 familias piloto en corredor México–EE.UU."

---

## 3. Funcionalidades principales del MVP

### Must-have — estado al 26 jun 2026

| Must-have (Demo Day) | Estado actual | Pendiente incubación |
|---------------------|---------------|----------------------|
| Suscripciones SOL/USDC (Anchor) | Hecho (devnet) | Redeploy estable |
| Keeper cron + pagos automáticos | Hecho | Deploy público + alertas |
| Bot WhatsApp + API | Hecho | 1 familia piloto real |
| Blinks (Solana Actions) | Hecho | Registry en URL pública |
| Frontend + wallet connect | Hecho | UX mensajes simples ES |
| Off-ramp MXN (Etherfuse) | Integrado | E2E KYC en piloto |
| Composabilidad (eventos, receipts, perfiles) | Hecho en código | Demo M5 |
| Registro pilotos + landing /piloto | Hecho | 3+ contactos reales |

### Nice-to-have

| Feature | Cuándo |
|---------|--------|
| Mainnet | Post-incubación |
| Modelo no-custodial | Post Demo Day |
| Wallet-less onboarding receptora | Post-M5 |
| App móvil | Post-programa |

### Fuera de scope (no prometemos en M5)

- Garantía de liquidez
- KYC ligero in-app
- Comisión propia desglosada
- Onboarding receptora sin wallet
- Mainnet sin compliance

---

## 4. Qué esperamos al final de la incubación (31 ago)

- MVP demostrable en devnet (idealmente URL pública)
- Flujo E2E: suscripción → keeper → Blink → MXN opcional
- 5–10 entrevistas receptoras + 3–5 familias en base de pilotos
- 10 familias piloto landing /piloto
- Receipt + perfil on-chain visibles en Solana Explorer
- Pitch 3 min + demo 2 min
- Base para postular a grants Solana

---

## 5. Cómo se integra con Solana

| Capa Solana | Uso en RemesaBlink |
|-------------|-------------------|
| Programa Anchor (remesas_recurrentes) | Suscripciones recurrentes verificables |
| USDC SPL | Remesa en dólares digitales |
| Solana Actions / Blinks | Receptora recibe link en WhatsApp → firma en wallet |
| PDAs composables | Receipts + perfiles = historial portable |
| Devnet → mainnet | Solo tras validación y compliance |

Program ID devnet: B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2

Por qué Solana: costo y latencia por pago recurrente; Blinks nativos; USDC; ecosistema grants LATAM; composabilidad para crédito futuro.

---

## 6. Flujo principal del producto

1. Remitente programa remesa por WhatsApp (sin wallet propia en MVP custodial).
2. Sistema registra suscripción on-chain (keeper custodia fondos).
3. Keeper ejecuta pago al vencer; crea receipt y actualiza perfil on-chain.
4. Receptora recibe mensaje + Blink (recibir USDC o completar KYC → MXN).
5. Cashback off-chain; historial composable on-chain para futuro crédito.

*(Incluir diagrama de secuencia en Google Doc: Remitente WA → Bot → Keeper → Solana → Receptora WA)*

---

## 7. Roadmap por fechas WayLearn

| Fecha | Milestone | Entregable |
|-------|-----------|------------|
| 26 jun | M1 Roadmap | Este documento |
| 3 jul | M2 Business | 3 entrevistas + pilotos en DB |
| 10 jul | M3 Arquitectura | Diagrama on/off-chain |
| 31 jul | M4 Validación | 5–10 entrevistas + cambios producto |
| 21 ago | M5 MVP funcional | Demo URL + video E2E |
| 28 ago | M6 Pitch | Deck 8–10 slides |
| 31 ago | Demo Day | Pitch + demo en vivo |

---

## 8. Evidencias (anexos Drive)

| Evidencia | Descripción |
|-----------|-------------|
| Roadmap | Este PDF / Google Doc |
| E2E funcional | Captura npm run e2e:usdc OK |
| Solana Explorer | Tx suscripción + Receipt PDA en devnet |
| API composabilidad | GET /api/composability/perfil/wallet |
| Frontend | Screenshot app :3003 y landing /piloto |
| Repositorio | Link GitHub + README |

Carpeta local de evidencias: docs/M1-evidencias/

---

## 9. Landing waitlist — 10 familias piloto

- Ruta: /piloto (Next.js, implementada en Vercel)
- URL producción: https://frontend-bay-phi-92.vercel.app/piloto
- Meta: 10 familias — 4 remitente / 4 receptora / 2 promotor
- Formulario → POST /api/pilotos
- Contador en vivo: GET /api/pilotos
- Links GTM: ?ref=comerciantes | migrantes | pyme | tiendita
- Marca v1.0: REMESABLINK — TU FAMILIA MÁS CERCA, CADA MES

---

## Autoevaluación M1

- [x] Problema, usuario, MVP, Solana claros en una lectura
- [x] 7 milestones WayLearn con fechas
- [x] Must-have con estado honesto
- [x] Flujo principal descrito
- [x] Alcance realista documentado
- [ ] PDF subido a Drive (pendiente acción manual)
- [ ] Link compartido con mentor en Discord

---

*Documento generado para WayLearn · RemesaBlink · Junio 2026*
