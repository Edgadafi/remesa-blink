# RemesaBlink — Business Foundation

**Milestone 2 — WayLearn Solana Latam Labs Program**

---

## Portada


| Campo                    | Valor                                                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proyecto**             | Remesa Blink                                                                                                                                                                 |
| **Documento**            | Business Foundation — M2                                                                                                                                                     |
| **Founder**              | Edgadafi                                                                                                                                                                     |
| **Contacto**             | [quierochiachida@gmail.com](mailto:remesatia@gmail.com)                                                                                                                      |
| **Fecha entrega M2**     | 3 de julio de 2026                                                                                                                                                           |
| **Demo Day**             | 31 de agosto de 2026                                                                                                                                                         |
| **Programa**             | [Solana Latam Labs — WayLearn](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn)                                                                               |
| **Carpeta Drive equipo** | [https://drive.google.com/drive/folders/1whLI4EutUbPz4OCVkwMFdeH5TZxkoQ8o?usp=sharing](https://drive.google.com/drive/folders/1whLI4EutUbPz4OCVkwMFdeH5TZxkoQ8o?usp=sharing) |
| **Mentor WayLearn**      | Diana Torres e Isaac Klassen                                                                                                                                                 |
| **Repositorio**          | [https://github.com/Edgadafi/remesa-blink](https://github.com/Edgadafi/remesa-blink)                                                                                         |
| **Clasificación**        | Confidencial · Uso interno incubación                                                                                                                                        |


*Julio 2026 · Confidencial · Programa WayLearn*

---



## Índice

1. [2.1 Propuesta de Valor](#21-propuesta-de-valor)
2. [2.2 Modelo de Negocio Inicial / Ruta de Sostenibilidad](#22-modelo-de-negocio-inicial--ruta-de-sostenibilidad)
3. [2.3 Competidores o Alternativas Existentes](#23-competidores-o-alternativas-existentes)
4. [2.4 Primeras Hipótesis de Mercado y Adopción](#24-primeras-hipótesis-de-mercado-y-adopción)
5. [2.5 Señal de Validación Inicial](#25-señal-de-validación-inicial)
6. [2.6 Evidencia Adjunta](#26-evidencia-adjunta)
  - [URL de landing / waitlist](#url-de-landing-page--waitlist--formulario)
  - [Guión de entrevista](#guión-de-entrevista-con-usuarios-potenciales)
  - [Lista de usuarios, aliados y comunidades](#lista-de-usuarios-aliados-y-comunidades-para-validar)
  - [Métricas de adopción inicial](#métricas-de-adopción-inicial-a-reportar-durante-el-programa)
7. [Resumen ejecutivo](#resumen-ejecutivo)

---



## 2.1 Propuesta de Valor



### ¿Qué problema resuelven?

El corredor de remesas **Canadá–Estados Unidos–México** es el segundo más grande del mundo. En 2024, los migrantes mexicanos en EE.UU. enviaron **$64.7 mil millones de dólares** a sus familias en México — un récord histórico. Sin embargo, cada vez que alguien envía dinero:

- Paga entre **5% y 7%** de comisión en servicios tradicionales como Western Union.
- Tiene que **acordarse de enviar cada quincena**. Si se olvida, la familia no come, no paga la renta, no compra medicamentos.
- Hace el proceso **manualmente cada vez**.



### ¿Para quién?


| Rol                    | Perfil                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Usuario primario**   | Migrante mexicano en EE.UU., 25–45 años, que envía entre $200 y $500 cada 15 días a su familia en México. Usa WhatsApp diariamente. |
| **Usuario secundario** | La familia receptora en México, frecuentemente en zonas semi-urbanas o rurales.                                                     |




### ¿Por qué su solución es relevante?

RemesaBlink es un **agente de inteligencia artificial en WhatsApp** que permite enviar remesas de EE.UU. a México usando **USDC en Solana**, con tres diferencias clave:

1. **Sin app nueva.** El usuario escribe en el WhatsApp que ya tiene. El agente inteligente entiende español coloquial mexicano.
2. **Comisión competitiva de 1.5%** (frente a 5–7% de tradicionales).
3. **Remesas recurrentes programadas on-chain.** El usuario configura una vez y el programa Anchor en Solana ejecuta automáticamente cada ciclo.

**La propuesta en una frase:** RemesaBlink es el agente de IA en WhatsApp que programa remesas automáticas en Solana — configuras una vez y tu familia recibe puntual, siempre, con costos significativamente más bajos que los servicios tradicionales.

---



## 2.2 Modelo de Negocio Inicial / Ruta de Sostenibilidad



### Fuente 1 — Comisión por transacción (activa desde mainnet)


| Concepto                | Valor                                          |
| ----------------------- | ---------------------------------------------- |
| Comisión por envío      | 1.5% del monto                                 |
| Envío promedio estimado | $300 USD                                       |
| Ingreso por transacción | $4.50 USD                                      |
| Target mes 6            | 1,000 transacciones/mes → **$4,500 USD/mes**   |
| Target mes 12           | 10,000 transacciones/mes → **$45,000 USD/mes** |


**Unit Economics:**


| Métrica                                 | Valor       |
| --------------------------------------- | ----------- |
| CAC (costo de adquisición vía referido) | $5 USD      |
| LTV (24 meses, 2 envíos/mes × $4.50)    | $216 USD    |
| LTV/CAC ratio                           | **43.2x** ✅ |




### Fuente 2 — Rendimiento flotante sobre USDC en escrow (mes 3+)

Mientras el USDC está en custodia en el escrow de Solana esperando confirmación SPEI (minutos a horas), ese capital puede generar rendimiento en instrumentos de money market tokenizados de bajo riesgo a una tasa estimada del **4.5% anual** en 2026.

Para remesas recurrentes programadas, el capital acumulado entre ciclos de pago es mayor, incrementando el yield disponible sin costo adicional para el usuario.

### Fuente 3 — Programa de referidos comunitarios (mes 2+)

Distribución vía **conectores comunitarios**: líderes de barrio, pastores, dueños de tienditas que ya tienen la confianza de las comunidades migrantes. Por cada usuario activo que refieren, el conector gana **$10 USD**. RemesaBlink recupera ese costo en las primeras 7 transacciones del usuario referido.

### Ruta de sostenibilidad post-programa


| Fase           | Acciones                                               |
| -------------- | ------------------------------------------------------ |
| **Meses 1–3**  | Validación en mainnet, 0.5–0.75% para early adopters   |
| **Meses 3–6**  | Activar comisión 1.5%, 100–1,000 usuarios activos      |
| **Meses 6–12** | Programa referidos, float yield, 1,000–10,000 usuarios |
| **Mes 12+**    | Crédito on-chain + expansión regional                  |


---



## 2.3 Competidores o Alternativas Existentes



### Cómo resuelven hoy el problema los usuarios


| Solución actual      | Cómo funciona                          | Costo       | Problema                             |
| -------------------- | -------------------------------------- | ----------- | ------------------------------------ |
| Western Union / OXXO | Físico o app, corresponsales bancarios | 5–7%        | Caro, lento, manual                  |
| Zelle / Venmo        | Banco a banco directo                  | 0% pero…    | Solo si ambos tienen banco en EE.UU. |
| Félix Pago           | WhatsApp → USDC/Circle → SPEI          | ~$2.99 fija | Manual, sin recurrencia, sin Solana  |
| Remitly              | App nativa, transferencia bancaria     | 1–3%        | Requiere descargar app nueva         |
| Bitso                | API B2B, cripto                        | <1%         | Solo institucional, no B2C           |




### Cuál sería la diferencia de RemesaBlink

**Félix Pago** es el competidor más cercano (mismo canal WhatsApp, mismo corredor, misma stablecoin).

**Diferencia clave:**

- **Félix:** usuario envía manualmente cada 15 días (~$2.99).
- **RemesaBlink:** usuario programa una vez → Agente Inteligente recuerda y Solana ejecuta automáticamente. Comisión 1.5% ($4.50 en envío promedio de $300).

Esa diferencia (automatización real + conveniencia) es el producto. Aunque Félix es ligeramente más barato en fee fijo, RemesaBlink entrega mayor valor al eliminar el riesgo de olvido y fricción recurrente, lo que se traduce en paz mental y consistencia para la familia.

Western Union está migrando a Solana pero sin canal WhatsApp ni inteligencia artificial conversacional.

---



## 2.4 Primeras Hipótesis de Mercado y Adopción



### H1 — Hipótesis del canal

**Afirmación:** Un migrante mexicano en EE.UU. prefiere gestionar sus remesas por WhatsApp antes que por cualquier otra interfaz, incluyendo apps nativas y sucursales físicas.

**Cómo validar:** 10 entrevistas de descubrimiento. Pregunta: *"¿En qué app gestionas hoy tus finanzas más importantes?"* Si más de 7 de 10 mencionan WhatsApp como canal principal de comunicación, la hipótesis se sostiene.

### H2 — Hipótesis de la automatización

**Afirmación:** La capacidad de programar remesas automáticas es un diferenciador lo suficientemente valioso como para cambiar el comportamiento de alguien que ya usa Félix Pago.

**Cómo validar:** Pregunta directa en entrevistas: *"¿Alguna vez enviaste tarde y tu familia tuvo un problema?"* Si más de 6 de 10 dicen sí, el dolor de la recurrencia manual está confirmado.

### H3 — Hipótesis del precio

**Afirmación:** La comisión de 1.5% combinada con automatización genera switching.

**Validación:** Comparativa y willingness to switch.

### H4 — Hipótesis del conector comunitario

**Afirmación:** Un solo líder de comunidad puede activar 20+ usuarios en menos de 30 días con el incentivo correcto.

**Cómo validar:** Activar 1 conector comunitario en una comunidad migrante en Chicago, Houston o Los Ángeles. Ofrecer $10 por usuario referido activo. Medir en 30 días.

### H5 — Hipótesis regulatoria ⚠️

**Afirmación:** RemesaBlink puede operar en el corredor CAN-US-MX durante la validación inicial sin licencia NMLS, dado que el usuario firma las transacciones directamente desde su propia wallet (RemesaBlink no custodia dinero fiat).

> **Nota MVP (devnet):** validar con asesoría legal antes de mainnet. El modelo técnico actual en incubación usa keeper custodial en devnet; la hipótesis H5 aplica al modelo objetivo no-custodial (ver [FASE-E-NO-CUSTODIAL.md](./FASE-E-NO-CUSTODIAL.md)).

---



## 2.5 Señal de Validación Inicial



### La señal elegida: El segundo envío espontáneo

**¿Un usuario, sin que nadie se lo pida, realiza una segunda remesa usando RemesaBlink?**

### Por qué esta señal

El primer envío puede ser curiosidad o incentivo de precio. **El segundo envío es convicción.** Nadie hace una segunda remesa con un servicio que no funciona o en el que no confía. Es la métrica más honesta y la más difícil de falsear.

RemesaBlink es una App de pagos. Según la tabla de métricas por tipo de proyecto, la señal relevante es: usuarios que completan una transacción de prueba o pagos procesados.

Elevamos esa métrica un nivel: no buscamos solo que completen una transacción — buscamos que **vuelvan a hacer una segunda sin que se les pida**.

### Protocolo de medición — 4 semanas


| Semana                                 | Actividad                                                                                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Semana 1 — Preparación**             | Desplegar en Solana devnet con USDC faucet · Seleccionar 5 usuarios del perfil definido · Registrar baseline: servicio actual, frecuencia de envío, monto promedio |
| **Semana 2 — Primer envío acompañado** | Acompañar a cada usuario (videollamada o presencial) · Documentar fricción paso a paso · Confirmar que el receptor en México recibió la transacción                |
| **Semana 3 — Observación silenciosa**  | Sin contacto con los usuarios · Monitorear Solana Explorer para detectar transacciones espontáneas · Registrar si alguno escribe al bot por iniciativa propia      |
| **Semana 4 — Medición y entrevista**   | Contactar a los 5 usuarios · Pregunta central: *"¿Enviaste dinero esta quincena? ¿Por dónde?"* · Documentar respuestas y referidos generados                       |




### Tabla de criterios de éxito


| Resultado        | Interpretación         | Acción                                                      |
| ---------------- | ---------------------- | ----------------------------------------------------------- |
| 0 de 5 vuelven   | Hipótesis falsificadas | Entrevistar y pivotar canal o precio                        |
| 1–2 de 5 vuelven | Señal débil            | Entrevistar a los que no volvieron, identificar fricción    |
| 3 de 5 vuelven   | PMF mínimo viable      | Activar conector comunitario, buscar siguientes 95 usuarios |
| 4–5 de 5 vuelven | PMF sólido             | Iniciar fundraising pre-seed formal                         |


---



## 2.6 Evidencia Adjunta



### URL de landing page / waitlist / formulario


| Recurso                    | URL                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| Landing page (producción)  | [https://frontend-bay-phi-92.vercel.app/piloto](https://frontend-bay-phi-92.vercel.app/piloto) |
| Landing page (acortada)    | [https://bit.ly/píloto_remesas](https://bit.ly/píloto_remesas)                                 |
| Waitlist / formulario      | `POST /api/pilotos` conectado a Supabase (`usuarios_piloto`)                                   |
| Repositorio GitHub         | [https://github.com/Edgadafi/remesa-blink](https://github.com/Edgadafi/remesa-blink)           |
| Program ID (Solana devnet) | `B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2`                                                 |
| TX de deploy               | Ver en [Solana Explorer](https://explorer.solana.com/?cluster=devnet)                          |


---



### Guión de entrevista con usuarios potenciales

**Perfil objetivo:** Migrante mexicano en EE.UU. que envía remesas regularmente.  
**Duración:** 20–30 minutos.  
**Canal:** WhatsApp videollamada o presencial.

#### Bloque 1 — Contexto (5 min)

- ¿Cuánto tiempo llevas viviendo en EE.UU.?
- ¿A quién le envías dinero a México y con qué frecuencia?
- ¿Cuánto envías en promedio cada vez?



#### Bloque 2 — Comportamiento actual (8 min)

- ¿Qué servicio usas hoy para enviar? ¿Por qué ese y no otro?
- ¿Cuánto pagas de comisión? ¿Lo sabías antes de esta conversación?
- ¿Alguna vez enviaste tarde? ¿Qué pasó?
- ¿Cuánto tiempo te toma el proceso completo de enviar?



#### Bloque 3 — Descubrimiento del dolor (7 min)

- ¿Qué es lo más frustrante de enviar dinero a México?
- Si pudieras cambiar UNA cosa del proceso, ¿cuál sería?
- ¿Usas WhatsApp todos los días? ¿Para qué cosas importantes?



#### Bloque 4 — Reacción a la solución (5 min)

- (Mostrar demo de TIA en WhatsApp) ¿Qué piensas de esto?
- Si esto funcionara exactamente como te lo mostré, ¿lo usarías? ¿Por qué sí o no?
- ¿Qué tendría que pasar para que lo probaras esta semana?
- ¿Conoces a alguien más que envíe remesas a México?

---



### Lista de usuarios, aliados y comunidades para validar



#### Comunidades migrantes (canal primario)


| Comunidad / Organización                            | Ciudad          | Tamaño estimado  | Canal de contacto           |
| --------------------------------------------------- | --------------- | ---------------- | --------------------------- |
| Amigos y familiares                                 | CDMX            | 10               | Personal                    |
| Comunidades Discord / Telegram / x.com Solana LATAM | Virtual         | 1,000+ miembros  | Canales personales          |
| Clubes de Oriundos de Michoacán                     | Chicago, IL     | 200–500 familias | Videoconferencia / Facebook |
| OCEMO (Oaxacalifornia)                              | Los Ángeles, CA | 1,000+ familias  | x.com                       |
| Asociaciones de migrantes guanajuatenses            | Houston, TX     | 300–800 familias | WhatsApp grupos             |
| WayLearn alumni y comunidad                         | LATAM           | 500+ builders    | Discord WayLearn            |




#### Aliados potenciales (canal de distribución)


| Aliado            | Rol potencial           | Por qué                          | Acción                         |
| ----------------- | ----------------------- | -------------------------------- | ------------------------------ |
| Etherfuse         | Off-ramp SPEI           | Ya integrados en arquitectura    | Contactar vía X                |
| Helius            | RPC de Solana premium   | Infraestructura mainnet          | Aplicar a programa de startups |
| Solana Foundation | Grant + visibilidad     | Program ID verificable en devnet | Aplicar a grants.solana.com    |
| WayLearn mentores | Introducción a usuarios | Red de confianza en LATAM        | Solicitar                      |


---



### Métricas de adopción inicial a reportar durante el programa


| Métrica                                       | Línea base hoy | Target semana 4 | Target semana 8 |
| --------------------------------------------- | -------------- | --------------- | --------------- |
| Entrevistas de descubrimiento realizadas      | 0              | 10              | 25              |
| Usuarios que completan flujo completo en demo | 0              | 5               | 15              |
| Transacciones en devnet ejecutadas            | 1 (TX deploy)  | 10              | 50              |
| Segundos envíos espontáneos                   | 0              | 1               | 3               |
| Referidos generados por usuarios              | 0              | 2               | 10              |
| Connectors comunitarios activados             | 0              | 1               | 3               |
| Demos solicitadas por aliados                 | 0              | 1               | 3               |
| Respuestas al waitlist/landing                | 0              | 20              | 100             |


---



## Resumen ejecutivo

**Oportunidad de negocio identificada:** El corredor de remesas CAN-MX-US procesa **$64.7 mil millones anuales** con comisiones de 5–7%. Las monedas estables ya comprimen esas comisiones por debajo del 1%. Ningún actor en el corredor tiene remesas recurrentes on-chain con Agente Inteligente conversacional en español; esa es la oportunidad.

**Señal concreta para validar durante el programa:** **3 de 5 usuarios** realizan un segundo envío espontáneo con RemesaBlink en las primeras 4 semanas desde el primer uso, sin ser contactados para hacerlo.

Si esa señal se confirma, existe interés real y el modelo de distribución es replicable.

---

*Documento generado para WayLearn · RemesaBlink · Business Foundation M2 · Julio 2026*