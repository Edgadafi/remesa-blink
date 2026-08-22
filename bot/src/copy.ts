/**
 * Copy WhatsApp — lenguaje natural para remitente migrante (UX-TRUST / PERSONA MX-US).
 */

import type { ModoEnvio } from "./session.js";

const SUPPORT_EMAIL = "remesatia@gmail.com";

export function formatMontoDisplay(monto: number, tipoActivo: "SOL" | "USDC"): string {
  if (tipoActivo === "USDC") {
    const n = Number.isInteger(monto) ? String(monto) : monto.toFixed(2);
    return `$${n}`;
  }
  const n = monto.toFixed(9).replace(/\.?0+$/, "");
  return `${n} SOL`;
}

/** Línea opcional de estimado MXN (off-ramp Etherfuse). No promete TC fijo. */
export function formatMxnEstimateLine(mxnEstimated?: number | null): string | null {
  if (mxnEstimated == null || !Number.isFinite(mxnEstimated) || mxnEstimated <= 0) {
    return null;
  }
  const rounded = Math.round(mxnEstimated);
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(rounded);
  return `~${formatted} MXN estimados al retirar (tipo de cambio puede variar).`;
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
    "*Hola — soy TIA*\n" +
    "Mandas a México por aquí; tu familia recibe aviso en WhatsApp.\n\n" +
    "Escribe:\n\n" +
    "1️⃣ *enviar ahora* — un envío hoy\n" +
    "2️⃣ *programar* — cada mes, semana o día\n" +
    "3️⃣ *mis envíos* — ver lo programado\n" +
    "4️⃣ *recompensas* — Club TIA\n" +
    "5️⃣ *soporte* — ayuda en este chat\n\n" +
    "Ejemplo: *enviar 300 a mi amor* · o solo *300* y te guío.\n" +
    "Sin filas: ella recibe aviso cuando sale el envío."
  );
}

export function buildEnviarModoPicker(): string {
  return (
    "¿Qué quieres hacer?\n\n" +
    "1️⃣ *enviar ahora* — mandar hoy\n" +
    "2️⃣ *programar* — repetir cada mes, semana o día\n\n" +
    "*cancelar* · *soporte*"
  );
}

export function buildEnviarAskMonto(modo?: ModoEnvio): string {
  const head =
    modo === "inmediato"
      ? "*Envío de hoy*\n\n¿Cuánto mandamos?"
      : modo === "programar"
        ? "*Programar remesa*\n\n¿Cuánto quieres mandar?"
        : "*Vamos con tu remesa*\n\n¿Cuánto quieres mandar?";
  return (
    `${head}\n` +
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
  envio_inmediato?: boolean;
  mxn_estimated?: number | null;
}): string {
  const montoStr = formatMontoDisplay(params.monto, params.tipo_activo);
  const quien = params.nombre_contacto?.trim()
    ? `*${params.nombre_contacto.trim()}*`
    : "tu familia en México";
  const cuando = params.envio_inmediato
    ? "hoy"
    : labelFrecuencia(params.frecuencia);
  const fxLine = formatMxnEstimateLine(params.mxn_estimated);
  return (
    (params.envio_inmediato ? "⏳ *Preparando tu envío de hoy…*\n\n" : "⏳ *Programando tu remesa…*\n\n") +
    `*${montoStr}* · ${cuando} → ${quien}` +
    (fxLine ? `\n${fxLine}` : "") +
    "\n\nUn momento, por favor."
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
  envio_inmediato?: boolean;
  mxn_estimated?: number | null;
}): string {
  const montoStr = formatMontoDisplay(params.monto, params.tipo_activo);
  const freq = params.envio_inmediato
    ? "hoy"
    : labelFrecuencia(params.frecuencia);
  const dest = formatDestinatarioLabel(params.nombre_contacto, params.destinatario_wa);
  const montoPedido = params.montoPedido;
  const montoDifiere =
    params.reused &&
    montoPedido != null &&
    Number.isFinite(montoPedido) &&
    Math.abs(montoPedido - params.monto) > 1e-9;

  if (params.reused && montoDifiere) {
    // Fallback si el prefetch no corrió: nunca digas que programamos el pedido.
    const pedidoStr = formatMontoDisplay(montoPedido!, params.tipo_activo);
    return buildMontoNoCambiable({
      montoActivo: params.monto,
      montoPedido: montoPedido!,
      tipo_activo: params.tipo_activo,
      frecuencia: params.frecuencia,
      destinatario_wa: params.destinatario_wa,
      nombre_contacto: params.nombre_contacto,
      pedidoStr,
      montoStr,
      freq,
      dest,
    });
  }

  const lines = [
    params.envio_inmediato ? "✅ *Envío de hoy confirmado*" : "✅ *Orden confirmada*",
    "",
    `A ${dest}`,
    `*${montoStr}* · ${freq}`,
  ];

  const fxLine = formatMxnEstimateLine(params.mxn_estimated);
  if (fxLine) {
    lines.push(fxLine);
  }

  if (params.envio_inmediato) {
    lines.push(
      "",
      "Te avisamos cuando salga. Si solo querías mandar *una vez*, escribe *soporte*."
    );
  }

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

export function buildFrecuenciaQuincena(): string {
  return (
    "En el piloto programamos *cada mes*, *cada semana* o *cada día*.\n\n" +
    "Si le mandas cada quincena, por ahora elige *cada semana* y lo afinamos contigo.\n" +
    "O escribe *soporte* si necesitas otro calendario."
  );
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
    "Ese código no se ve válido. Necesito la *cuenta de la app de dinero de quien recibe* " +
    "(un código largo de letras y números). Cópialo completo y pégalo aquí."
  );
}

/** Usuario pegó el program id (/health) u otra cuenta de sistema. */
export function buildWalletProgramaRechazada(): string {
  return (
    "Ese código es del *sistema*, no la cuenta de tu familia.\n\n" +
    "Pídele a quien recibe (ej. *mi amor*) el código de *su* app de dinero " +
    "y pégalo aquí — es largo, solo letras y números."
  );
}

/**
 * Hard rule piloto: PDA keeper+destinatario no cambia monto on-chain.
 * Se muestra *antes* de “Programando $X…” (prefetch) o como fallback.
 */
export function buildMontoNoCambiable(params: {
  montoActivo: number;
  montoPedido: number;
  tipo_activo: "SOL" | "USDC";
  frecuencia: string;
  destinatario_wa: string;
  nombre_contacto?: string | null;
  /** Precomputados opcionales (fallback desde confirmación). */
  pedidoStr?: string;
  montoStr?: string;
  freq?: string;
  dest?: string;
}): string {
  const montoStr =
    params.montoStr ??
    formatMontoDisplay(params.montoActivo, params.tipo_activo);
  const pedidoStr =
    params.pedidoStr ??
    formatMontoDisplay(params.montoPedido, params.tipo_activo);
  const freq = params.freq ?? labelFrecuencia(params.frecuencia);
  const dest =
    params.dest ??
    formatDestinatarioLabel(params.nombre_contacto, params.destinatario_wa);

  return [
    "No pude cambiar el monto de este envío.",
    "",
    `Ya tienes *${montoStr}* · ${freq} a ${dest}.`,
    `Pediste *${pedidoStr}*, pero en el piloto el monto de un envío ya activo *no se cambia*.`,
    "",
    "• Escribe *mis envíos* para verlo",
    "• Para otro monto: usa *otra* cuenta de la app de dinero de tu familia",
    "• O escribe *soporte*",
  ].join("\n");
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
    "Menú completo (cuando termines o canceles): *enviar ahora*, *programar*, *mis envíos*, *recompensas*."
  );
}

export function labelPasoEnviar(step: string): string {
  const map: Record<string, string> = {
    enviar_modo: "elegir enviar ahora o programar",
    enviar_monto: "monto a enviar",
    enviar_frecuencia: "cada cuánto",
    enviar_nombre: "nombre del familiar",
    enviar_familia: "WhatsApp de tu familiar",
    enviar_wallet: "cuenta de su app de dinero",
    soporte_motivo: "elegir motivo de soporte",
  };
  return map[step] ?? "programar remesa";
}

export function buildRateLimitAviso(): string {
  return "Voy más despacio. Escribe *enviar* o *ayuda* cuando quieras.";
}

export function buildSoporte(): string {
  return buildSoporteMenu();
}

/**
 * Menú corto de motivos — mismo chat / mismo número que remesas (sin otro wa.me).
 */
export function buildSoporteMenu(): string {
  return (
    "*Soporte Remesa Blink*\n\n" +
    "Estás en el *mismo chat* donde programas tus envíos. El equipo te responde *aquí*.\n\n" +
    "¿Qué pasó? Responde con el *número*:\n\n" +
    "1️⃣ No me llegó el aviso (o el dinero)\n" +
    "2️⃣ Quiero cambiar o cancelar un envío\n" +
    "3️⃣ No tengo el código de la app de mi familia\n" +
    "4️⃣ Otra cosa\n\n" +
    `También puedes escribir a ${SUPPORT_EMAIL}\n` +
    "O *cancelar* para salir."
  );
}

export function buildSoporteMotivoInvalido(): string {
  return (
    "Responde *1*, *2*, *3* o *4* según tu caso.\n\n" +
    "O escribe con tus palabras qué pasó (una frase).\n" +
    "*cancelar* para salir."
  );
}

const MOTIVO_LABEL: Record<string, string> = {
  no_aviso: "no llegó el aviso o el dinero",
  cambiar_envio: "cambiar o cancelar un envío",
  sin_codigo: "no tienes el código de la app",
  otra: "otra consulta",
};

export function buildSoporteRecibido(motivo: string, ticketId?: string | null): string {
  const label = MOTIVO_LABEL[motivo] || "tu consulta";
  const ref = ticketId ? `\n\nReferencia: *${ticketId.slice(0, 8)}*` : "";
  return (
    `*Listo — te escuchamos*\n\n` +
    `Anotamos: ${label}.\n\n` +
    "Un humano del equipo te responde *en este mismo chat* (no cambies de número).\n" +
    "Si puedes, deja una frase más con detalles." +
    ref +
    `\n\nMientras: *mis envíos* · *ayuda* · ${SUPPORT_EMAIL}`
  );
}

export function buildCancelado(): string {
  return "Listo, cancelé. Cuando quieras, escribe *enviar* o *ayuda*.";
}

export function buildNoEntendi(): string {
  return (
    "No te entendí del todo.\n\n" +
    "Prueba: *enviar ahora*, *programar*, *enviar 300 a mi amor* o *ayuda*."
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
