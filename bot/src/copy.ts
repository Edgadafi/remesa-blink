/**
 * Copy WhatsApp — lenguaje natural para remitente migrante (UX-TRUST / PERSONA MX-US).
 */

const SUPPORT_EMAIL = "remesatia@gmail.com";

export function formatMontoDisplay(monto: number, tipoActivo: "SOL" | "USDC"): string {
  if (tipoActivo === "USDC") {
    const n = Number.isInteger(monto) ? String(monto) : monto.toFixed(2);
    return `$${n}`;
  }
  const n = monto.toFixed(9).replace(/\.?0+$/, "");
  return `${n} SOL`;
}

export function labelFrecuencia(frecuencia: string): string {
  const f = frecuencia.toLowerCase();
  const map: Record<string, string> = {
    diario: "cada día",
    semanal: "cada semana",
    mensual: "cada mes",
  };
  return map[f] ?? `cada ${f}`;
}

/** Enmascara cuenta Solana para copy de usuario: `5Hop…tQ5x`. */
export function maskAddr(addr: string): string {
  const s = addr.trim();
  if (s.length <= 8) return s;
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

/** Etiqueta familiar: *mi amor* (+521…) — nunca address completa. */
export function formatDestinatarioLabel(
  nombre: string | null | undefined,
  wa: string
): string {
  const digits = wa.replace(/\D/g, "");
  const phone = digits ? `+${digits}` : "";
  const alias = nombre?.trim();
  if (alias && phone) return `*${alias}* (${phone})`;
  if (alias) return `*${alias}*`;
  return phone || "tu familia";
}

export function buildAyuda(): string {
  return (
    "*Remesa Blink — envía a tu familia*\n\n" +
    "Habla como en el chat. Puedes escribir:\n\n" +
    "1️⃣ *enviar* — programar remesa a México\n" +
    "2️⃣ *mis envíos* — ver lo que ya tienes\n" +
    "3️⃣ *recompensas* — saldo y referidos\n" +
    "4️⃣ *soporte* — hablar con el equipo\n\n" +
    "Ejemplo: *enviar 2000 a mi mujer* — o solo *enviar* y te guío paso a paso.\n" +
    "Sin filas en la tiendita: tu familia recibe aviso por WhatsApp."
  );
}

export function buildEnviarAskMonto(): string {
  return (
    "*Vamos a programar tu remesa*\n\n" +
    "¿Cuánto quieres mandar?\n" +
    "Ejemplo: *300* — o de un jalón: *enviar 300 a mi amor*\n\n" +
    "_(Por defecto en dólares.)_\n\n" +
    "*cancelar* · *soporte*"
  );
}

export function buildEnviarAskFrecuencia(
  monto: number,
  tipo: "SOL" | "USDC",
  nombre?: string
): string {
  const quien = nombre?.trim();
  const head = quien
    ? `De acuerdo: *${formatMontoDisplay(monto, tipo)}* a *${quien}*.`
    : `Va: *${formatMontoDisplay(monto, tipo)}*.`;
  return (
    `${head}\n\n` +
    "¿Cada cuánto lo mandamos?\n" +
    "• *cada mes*\n" +
    "• *cada semana*\n" +
    "• *cada día*\n\n" +
    "*cancelar* · *soporte*"
  );
}

export function buildEnviarAskNombre(monto?: number, tipo?: "SOL" | "USDC"): string {
  const head =
    monto != null && tipo
      ? `Va: *${formatMontoDisplay(monto, tipo)}*.\n\n`
      : "";
  return (
    `${head}` +
    "¿A quién se lo mandamos?\n\n" +
    "Como le dices tú: *mi amor*, *mi mujer*, *Mamá*, *mi reina*…\n\n" +
    "*cancelar* · *soporte*"
  );
}

export function buildEnviarAskFamilia(nombre?: string): string {
  const quien = nombre?.trim() ? `*${nombre.trim()}*` : "tu familia en México";
  return (
    `¿WhatsApp de ${quien}?\n\n` +
    "Con lada, por ejemplo *5214431234567*\n" +
    "(así les llega el aviso cuando salga el envío).\n\n" +
    "*cancelar* · *soporte*"
  );
}

export function buildEnviarAskWallet(nombre?: string): string {
  const quien = nombre?.trim() ? `*${nombre.trim()}*` : "tu familiar";
  return (
    `Para que el dinero llegue a ${quien} la primera vez, pega el *código de su app de dinero*\n` +
    "(es largo; pídeselo por WhatsApp). Después no te lo volvemos a pedir.\n\n" +
    "Se ve más o menos así: `HN7c…xK2m`\n\n" +
    "*soporte* · *cancelar* · *ayuda*"
  );
}

/** Eco de lo entendido en one-shot (antes del siguiente paso). */
export function buildEnviarUnderstood(params: {
  monto?: number;
  tipo_activo: "SOL" | "USDC";
  nombre_contacto?: string;
  frecuencia?: string;
}): string | null {
  const { monto, tipo_activo, nombre_contacto, frecuencia } = params;
  if (monto == null && !nombre_contacto && !frecuencia) return null;
  const bits: string[] = [];
  if (monto != null) bits.push(`*${formatMontoDisplay(monto, tipo_activo)}*`);
  if (nombre_contacto?.trim()) bits.push(`a *${nombre_contacto.trim()}*`);
  if (frecuencia) bits.push(labelFrecuencia(frecuencia));
  if (bits.length === 0) return null;
  return `De acuerdo: ${bits.join(" · ")}.`;
}

export function buildRecurrentePending(params: {
  monto: number;
  tipo_activo: "SOL" | "USDC";
  frecuencia: string;
  nombre_contacto?: string | null;
}): string {
  const montoStr = formatMontoDisplay(params.monto, params.tipo_activo);
  const quien = params.nombre_contacto?.trim()
    ? `*${params.nombre_contacto.trim()}*`
    : "tu familia en México";
  return (
    "⏳ *Programando tu remesa…*\n\n" +
    `*${montoStr}* · ${labelFrecuencia(params.frecuencia)} → ${quien}\n\n` +
    "Un momento, por favor."
  );
}

export function buildSuscripcionConfirmada(params: {
  monto: number;
  tipo_activo: "SOL" | "USDC";
  frecuencia: string;
  destinatario_wa: string;
  nombre_contacto?: string | null;
  /** Monto que el usuario pidió en este flujo (para detectar reuse con monto distinto). */
  montoPedido?: number;
  txSignature?: string | null;
  explorerUrl?: string | null;
  reused?: boolean;
}): string {
  const montoStr = formatMontoDisplay(params.monto, params.tipo_activo);
  const freq = labelFrecuencia(params.frecuencia);
  const dest = formatDestinatarioLabel(params.nombre_contacto, params.destinatario_wa);
  const montoPedido = params.montoPedido;
  const montoDifiere =
    params.reused &&
    montoPedido != null &&
    Number.isFinite(montoPedido) &&
    Math.abs(montoPedido - params.monto) > 1e-9;

  if (params.reused && montoDifiere) {
    const pedidoStr = formatMontoDisplay(montoPedido!, params.tipo_activo);
    return [
      "✅ *Orden registrada*",
      "",
      `A ${dest}`,
      `*${montoStr}* · ${freq}`,
      `Pediste *${pedidoStr}*; el monto activo sigue en *${montoStr}* (no se cambió).`,
      "",
      "Escribe *mis envíos* para verla · *soporte* si quieres otro monto.",
    ].join("\n");
  }

  const lines = [
    "✅ *Orden confirmada*",
    "",
    `A ${dest}`,
    `*${montoStr}* · ${freq}`,
  ];

  if (params.reused && !params.explorerUrl && !params.txSignature) {
    lines.push("Esta remesa ya estaba activa; no hubo envío nuevo.");
  } else if (params.explorerUrl) {
    lines.push("", "📄 *Comprobante:*", params.explorerUrl);
  } else if (params.txSignature) {
    lines.push("", `📄 Referencia: \`${params.txSignature.slice(0, 12)}…\``);
  }

  lines.push("", "Escribe *mis envíos* para verla.");
  return lines.join("\n");
}

/** URL Explorer Solana (devnet por defecto). */
export function buildExplorerTxUrl(
  txSignature: string,
  cluster: "devnet" | "mainnet-beta" | "testnet" = "devnet"
): string {
  const q = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/tx/${txSignature}${q}`;
}

/** Friendly Spanish when Solana rejects init because PDA already exists. */
export function isPdaAlreadyInUseMessage(msg: string): boolean {
  return /already in use/i.test(msg) || /Allocate:/i.test(msg);
}

export function buildSuscripcionError(apiError: string): string {
  if (isPdaAlreadyInUseMessage(apiError)) {
    return (
      "❌ *Ya tienes una remesa activa a esa cuenta*\n\n" +
      "Tu dinero *no se movió*. Escribe *mis envíos* para verla, o *enviar* con otra cuenta.\n\n" +
      `¿Necesitas ayuda? Escribe *soporte* o ${SUPPORT_EMAIL}`
    );
  }
  // Never dump English/RPC simulation text to the user
  const safeHint =
    apiError &&
    apiError.length < 120 &&
    !/Simulation|Program |Transaction|custom program|Logs:/i.test(apiError)
      ? `_${apiError}_\n\n`
      : "";
  return (
    "❌ *No se pudo programar la remesa*\n\n" +
    "Tu dinero *no se movió*. Revisa los datos o escribe *enviar* para intentar de nuevo.\n\n" +
    safeHint +
    `¿Necesitas ayuda? Escribe *soporte* o ${SUPPORT_EMAIL}`
  );
}

export function buildMontoInvalido(): string {
  return "No alcancé a ver el monto. ¿Cuánto mandamos? Ej.: *300* o *2000 dólares*.";
}

export function buildFrecuenciaInvalida(): string {
  return "Dime *cada mes*, *cada semana* o *cada día* — como te acomode.";
}

export function buildNombreInvalido(): string {
  return "¿Cómo le dices? Ej.: *mi amor*, *mi mujer*, *Mamá*, *mi reina* (sin el WhatsApp todavía).";
}

export function buildWaInvalido(): string {
  return (
    "Ese WhatsApp no se ve completo. Ponlo con lada, ej. *5214431234567*."
  );
}

export function buildWalletInvalida(): string {
  return (
    "Ese código no se ve válido. Cópialo completo desde la app de dinero de tu familia " +
    "y pégalo aquí (es largo)."
  );
}

export function buildMisRemesasVacio(): string {
  return (
    "Aún no tienes remesas programadas.\n\n" +
    "Escribe *enviar* y te guío en un minuto."
  );
}

export function buildMisRemesasLista(lines: string[]): string {
  return "*Tus envíos programados*\n\n" + lines.join("\n");
}

/** Fecha corta para historial WA (es-MX). */
export function formatFechaCorta(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function buildHistorialPagosVacio(): string {
  return "Aún no hay envíos hechos; el primero llega según la frecuencia.";
}

export function buildHistorialPagosLista(lines: string[]): string {
  return "*Últimos envíos*\n\n" + lines.join("\n\n");
}

/** Ayuda mid-flow: no borra el borrador. */
export function buildAyudaEnFlujo(pasoLabel: string): string {
  return (
    "*Sigue tu remesa*\n\n" +
    `Estás en: *${pasoLabel}*\n` +
    "Responde lo que te pedí, o escribe *cancelar* / *soporte*.\n\n" +
    "Menú completo (cuando termines o canceles): *enviar*, *mis envíos*, *recompensas*."
  );
}

export function labelPasoEnviar(step: string): string {
  const map: Record<string, string> = {
    enviar_monto: "monto a enviar",
    enviar_frecuencia: "cada cuánto",
    enviar_nombre: "nombre del familiar",
    enviar_familia: "WhatsApp de tu familiar",
    enviar_wallet: "cuenta de su app de dinero",
  };
  return map[step] ?? "programar remesa";
}

export function buildRateLimitAviso(): string {
  return "Voy más despacio. Escribe *enviar* o *ayuda* cuando quieras.";
}

export function buildSoporte(): string {
  return (
    "*Aquí estamos*\n\n" +
    `Escríbenos a ${SUPPORT_EMAIL}\n\n` +
    "O pregunta en la tiendita de confianza que te refirió.\n\n" +
    "Menú: escribe *ayuda*"
  );
}

export function buildCancelado(): string {
  return "Listo, cancelé. Cuando quieras, escribe *enviar* o *ayuda*.";
}

export function buildNoEntendi(): string {
  return (
    "No te entendí del todo.\n\n" +
    "Prueba con: *enviar*, *mis envíos*, *recompensas* o *ayuda*."
  );
}

/** Resumen Club TIA dentro de *recompensas*. */
export function buildRecompensasClubTia(d: {
  total_acumulado?: number;
  disponible?: number;
  reclamado?: number;
  codigo_referido?: string | null;
  lealtad?: {
    nombre_nivel?: string;
    nivel?: string;
    envios_90d?: number;
    volumen_usd_90d?: number;
    cashback_pct?: number;
    fee_mult?: number;
    siguiente?: {
      nombre: string;
      envios_faltan: number;
      volumen_faltan: number;
    } | null;
  } | null;
}): string {
  const lines: string[] = ["*Tus recompensas — Club TIA*", ""];

  const L = d.lealtad;
  if (L?.nombre_nivel) {
    lines.push(`Nivel: *${L.nombre_nivel}*`);
    lines.push(
      `Últimos 90 días: ${L.envios_90d ?? 0} envíos · ~$${(L.volumen_usd_90d ?? 0).toFixed(0)}`
    );
    if (L.cashback_pct != null) {
      lines.push(`Cashback remesa: *${L.cashback_pct}%*`);
    }
    if (L.fee_mult != null && L.fee_mult < 1) {
      const desc = Math.round((1 - L.fee_mult) * 100);
      lines.push(`Descuento comisión: *−${desc}%* (cuando haya fee de plataforma)`);
    }
    if (L.siguiente) {
      const faltan =
        L.siguiente.envios_faltan <= L.siguiente.volumen_faltan
          ? `${L.siguiente.envios_faltan} envíos`
          : `~$${L.siguiente.volumen_faltan.toFixed(0)} más`;
      lines.push(`Siguiente (*${L.siguiente.nombre}*): te faltan ${faltan}.`);
    }
    lines.push("");
  }

  lines.push(`Total ganado: $${Number(d.total_acumulado ?? 0).toFixed(2)}`);
  lines.push(`Canjeado: $${Number(d.reclamado ?? 0).toFixed(2)}`);
  lines.push(`Disponible: *$${Number(d.disponible ?? 0).toFixed(2)}*`);
  lines.push(
    `Código referido: ${d.codigo_referido || "aún no tienes — escribe *código*"}`
  );
  lines.push("", "Para canjear: *canjear 5* (tope $15/mes en piloto).");
  return lines.join("\n");
}

/** Legacy slash help (alias técnico). */
export function buildRecurrenteUso(): string {
  return (
    "También puedes usar el formato corto:\n\n" +
    "`/recurrente 300 mensual 5214431234567 CODIGO_CUENTA`\n\n" +
    "(Por defecto en dólares.) O escribe solo *enviar* y te guío sin comandos."
  );
}
