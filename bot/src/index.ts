/**
 * Bot WhatsApp - Remesa Blink
 * Baileys con reconexión, comandos y endpoint interno para notificaciones
 */
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  isLidUser,
  jidNormalizedUser,
  type WASocket,
  type WAMessage,
  type WAMessageKey,
} from "@whiskeysockets/baileys";
import express from "express";
import pino from "pino";
import qrcode from "qrcode-terminal";
import axios from "axios";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  buildAyuda,
  buildAyudaEnFlujo,
  buildCancelado,
  buildEnviarModoPicker,
  buildEnviarAskFamilia,
  buildEnviarAskFrecuencia,
  buildEnviarAskMonto,
  buildEnviarAskNombre,
  buildEnviarAskWallet,
  buildEnviarUnderstood,
  buildFrecuenciaInvalida,
  buildFrecuenciaQuincena,
  buildHistorialPagosLista,
  buildHistorialPagosVacio,
  buildMisRemesasLista,
  buildMisRemesasVacio,
  buildMontoInvalido,
  buildNombreInvalido,
  buildNoEntendi,
  buildRecompensasClubTia,
  buildRateLimitAviso,
  buildRecurrentePending,
  buildRecurrenteUso,
  buildSoporte,
  buildSoporteMenu,
  buildSoporteMotivoInvalido,
  buildSoporteRecibido,
  buildSuscripcionConfirmada,
  buildSuscripcionError,
  buildWaInvalido,
  buildWalletInvalida,
  buildWalletProgramaRechazada,
  buildMontoNoCambiable,
  buildExplorerTxUrl,
  formatDestinatarioLabel,
  formatFechaCorta,
  labelFrecuencia,
  labelPasoEnviar,
} from "./copy.js";
import {
  detectIntent,
  isMainMenuDigit,
  isBlockedSolanaAddress,
  looksLikeMontoOnly,
  looksLikeSolanaAddress,
  mentionsQuincena,
  parseModoEnvio,
  parseEnviarOneshoot,
  parseFrecuencia,
  parseMonto,
  parseNombreContacto,
  parseSoporteMotivo,
  parseTipoActivo,
  parseWhatsAppDigits,
  type EnviarParsed,
} from "./nlu.js";
import {
  clearSession,
  getSession,
  nextEnviarStep,
  setStep,
  startEnviar,
  type EnviarDraft,
  type ModoEnvio,
} from "./session.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";
const BOT_INTERNAL_PORT = parseInt(process.env.BOT_INTERNAL_PORT || "3002", 10);
const BOT_INTERNAL_SECRET = process.env.BOT_INTERNAL_SECRET || "";

const logger = pino({ level: process.env.DEBUG ? "debug" : "info" });

let sock: WASocket | null = null;
let whatsappOpen = false;

/** Evita reprocesar el mismo mensaje (Baileys a veces re-emite upserts). */
const seenMsgIds = new Set<string>();
const SEEN_MAX = 500;

/** Anti-loop: tope de respuestas por chat en ventana corta. */
const replyBuckets = new Map<string, { n: number; resetAt: number }>();
const REPLY_WINDOW_MS = 8_000;
const REPLY_MAX = 4;

function log(msg: string, color = "\x1b[0m") {
  console.log(`${color}${msg}\x1b[0m`);
}

function rememberMsgId(id: string | undefined | null): boolean {
  if (!id) return false;
  if (seenMsgIds.has(id)) return true;
  seenMsgIds.add(id);
  if (seenMsgIds.size > SEEN_MAX) {
    const first = seenMsgIds.values().next().value;
    if (first) seenMsgIds.delete(first);
  }
  return false;
}

function allowReply(wa: string): boolean {
  const now = Date.now();
  const b = replyBuckets.get(wa);
  if (!b || now > b.resetAt) {
    replyBuckets.set(wa, { n: 1, resetAt: now + REPLY_WINDOW_MS });
    return true;
  }
  if (b.n >= REPLY_MAX) return false;
  b.n += 1;
  return true;
}

function toJid(wa: string): string {
  const clean = wa.replace(/\D/g, "");
  return `${clean}@s.whatsapp.net`;
}

type PeerIds = {
  /** JID para sendMessage (LID o PN — el que WA usó en el chat). */
  replyJid: string;
  /** Identificador estable para sesión + API (preferir dígitos de teléfono). */
  waId: string;
};

/**
 * WhatsApp 2026 usa @lid. Baileys v7 expone remoteJidAlt (PN) cuando aplica.
 * Sin esto: session key = LID numérico → API rota + Bad MAC al mezclar PN/LID.
 */
async function resolvePeer(sock: WASocket, m: WAMessage): Promise<PeerIds | null> {
  const key = m.key as WAMessageKey & {
    remoteJidAlt?: string;
    participantAlt?: string;
  };
  const remote = key.remoteJid;
  if (!remote || remote === "status@broadcast") return null;

  const participant = key.participant;
  const alt = key.remoteJidAlt || key.participantAlt || undefined;
  const replyJid = participant || remote;

  let pnJid: string | undefined;
  if (alt && String(alt).includes("@s.whatsapp.net")) {
    pnJid = jidNormalizedUser(alt);
  } else if (remote.includes("@s.whatsapp.net")) {
    pnJid = jidNormalizedUser(remote);
  } else if (isLidUser(remote) || remote.endsWith("@lid")) {
    try {
      const mapped = await sock.signalRepository?.lidMapping?.getPNForLID?.(remote);
      if (mapped) pnJid = jidNormalizedUser(mapped);
    } catch {
      /* mapping aún no disponible */
    }
  }

  const waId = (pnJid || replyJid)
    .replace(/@.*/, "")
    .replace(/:\d+$/, "")
    .replace(/\D/g, "") || replyJid.replace(/@.*/, "");

  return { replyJid, waId };
}

/** Mensaje legible para errores HTTP del backend (JSON { error } o Zod flatten). */
function formatApiError(err: unknown): string {
  let raw = "";
  if (axios.isAxiosError(err)) {
    const d = err.response?.data;
    if (d && typeof d === "object" && "error" in d) {
      const e = (d as { error: unknown }).error;
      if (typeof e === "string") raw = e;
      else if (e && typeof e === "object" && "formErrors" in e) {
        const o = e as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
        const parts: string[] = [];
        if (Array.isArray(o.formErrors) && o.formErrors.length) parts.push(...o.formErrors);
        if (o.fieldErrors) {
          for (const [k, v] of Object.entries(o.fieldErrors)) {
            if (Array.isArray(v) && v.length) parts.push(`${k}: ${v.join(", ")}`);
          }
        }
        if (parts.length) raw = parts.join("; ");
      } else {
        try {
          raw = JSON.stringify(e);
        } catch {
          raw = err.message;
        }
      }
    } else if (err.response?.status) {
      raw = `HTTP ${err.response.status}: ${err.message}`;
    } else {
      raw = err.message;
    }
  } else if (err instanceof Error) {
    raw = err.message;
  } else {
    raw = String(err);
  }

  // Map Solana / RPC dumps → short Spanish (also handled in buildSuscripcionError)
  if (/already in use/i.test(raw) || /Allocate:/i.test(raw)) {
    return "Ya tienes una remesa activa a esa cuenta. Escribe *mis envíos*.";
  }
  if (/WALLET_INVALIDA|program id|destinatario_solana inválido/i.test(raw)) {
    return (
      "Ese código no es la cuenta de tu familia. " +
      "Pega el código de *su* app de dinero (no el del sistema)."
    );
  }
  if (/Simulation failed|custom program error|Transaction simulation/i.test(raw)) {
    return "No se pudo registrar ahora. Revisa los datos o escribe *soporte*.";
  }
  if (/insufficient|fondos|balance/i.test(raw)) {
    return "No hay saldo suficiente para completar el registro. Escribe *soporte*.";
  }
  // Truncate long dumps so they never flood the chat if leaked
  if (raw.length > 160) {
    return "Algo falló al programar. Escribe *enviar* de nuevo o *soporte*.";
  }
  return raw;
}

/** Estimado MXN vía Etherfuse (solo USDC). Null si API no responde. */
async function fetchMxnEstimate(
  monto: number,
  tipo_activo: "SOL" | "USDC"
): Promise<number | null> {
  if (tipo_activo !== "USDC" || monto <= 0) return null;
  try {
    const res = await axios.get(`${API_BASE}/api/etherfuse/quote-estimate`, {
      params: { amount: monto },
      timeout: 6000,
    });
    const mxn = Number(res.data?.mxn_estimated);
    return Number.isFinite(mxn) && mxn > 0 ? mxn : null;
  } catch {
    return null;
  }
}

function formatMontoSuscripcion(s: {
  monto: number | string;
  tipo_activo?: string;
}): string {
  const tipo = (s.tipo_activo || "SOL").toUpperCase();
  const raw = BigInt(String(s.monto).replace(/\..*$/, ""));
  if (tipo === "USDC") {
    const n = Number(raw) / 1e6;
    return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
  }
  return `${Number(raw) / 1e9} SOL`;
}

/** Raw DB/on-chain units → human (USDC dollars / SOL). */
function humanMontoFromRaw(
  monto: number | string,
  tipo_activo?: string
): number {
  const tipo = (tipo_activo || "SOL").toUpperCase();
  const raw = Number(BigInt(String(monto).replace(/\..*$/, "")));
  return tipo === "USDC" ? raw / 1e6 : raw / 1e9;
}

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(
    join(__dirname, "../auth_info")
  );

  // WhatsApp (2026) rechaza versiones WEB viejas → 405 / "No se pudo vincular".
  // Usar versión reciente + identidad macOS (mismo patrón que WA Web actual).
  let version: [number, number, number] = [2, 3000, 1034074495];
  try {
    const latest = await fetchLatestBaileysVersion();
    if (Array.isArray(latest.version) && latest.version.length === 3) {
      version = latest.version as [number, number, number];
    }
  } catch (err) {
    log(`[Bot] fetchLatestBaileysVersion falló; uso ${version.join(".")}`, "\x1b[33m");
  }
  log(`[Bot] WA version ${version.join(".")} · browser macOS/Chrome`, "\x1b[36m");

  const wa = makeWASocket({
    version,
    browser: Browsers.macOS("Chrome"),
    auth: state,
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    // Evita 408 "Timed Out" en init queries (log terminal)
    defaultQueryTimeoutMs: 60_000,
    logger,
  });
  sock = wa;

  wa.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      log("\n[Bot] Escanea el QR con WhatsApp:", "\x1b[33m");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      sock = null;
      whatsappOpen = false;
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      log(`[Bot] Desconectado. Reconectando: ${shouldReconnect}`, "\x1b[31m");
      if (shouldReconnect) {
        setTimeout(() => {
          connect().catch((err) => log(`[Bot] Reconnect error: ${(err as Error).message}`, "\x1b[31m"));
        }, 8000);
      }
    } else if (connection === "open") {
      whatsappOpen = true;
      log("[Bot] Conectado", "\x1b[32m");
      const me = wa.user;
      if (me?.id) {
        const num = me.id.replace(/:.*/, "").replace("@s.whatsapp.net", "");
        log(`[Bot] Tu número ES el bot. Para probar: envía un mensaje desde OTRO WhatsApp a +${num}`, "\x1b[36m");
      }
    }
  });

  wa.ev.on("creds.update", saveCreds);

  wa.ev.on("messages.upsert", async ({ messages, type }) => {
    // Ignorar historial al conectar; solo mensajes nuevos en vivo
    if (type !== "notify") return;

    for (const m of messages) {
      if (!m.message) continue;
      if (rememberMsgId(m.key.id)) continue;

      const fromMe = m.key.fromMe ?? false;
      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        "";

      /**
       * CRÍTICO: nunca procesar mensajes enviados por el propio bot.
       * Self-test: OTRO WhatsApp → número del bot.
       */
      if (fromMe) {
        if (process.env.BOT_ALLOW_FROM_ME !== "1") continue;
        if (text.length > 48) continue;
      }

      if (!text.trim()) continue;

      const peer = await resolvePeer(wa, m);
      if (!peer) continue;

      if (fromMe && process.env.BOT_ALLOW_FROM_ME === "1") {
        if (getSession(peer.waId).step !== "idle") {
          if (detectIntent(text) !== "cancelar") continue;
        }
      }

      if (!allowReply(peer.waId)) {
        log(`[Bot] Rate-limit replies a ${peer.waId} — posible loop evitado`, "\x1b[33m");
        clearSession(peer.waId);
        try {
          await sock.sendMessage(peer.replyJid, { text: buildRateLimitAviso() });
        } catch {
          /* ignore send failure under rate limit */
        }
        continue;
      }

      log(
        `[Bot] Recibido de ${peer.replyJid} (id=${peer.waId}): ${text.slice(0, 50)}${text.length > 50 ? "..." : ""}`,
        "\x1b[90m"
      );
      try {
        await handleCommand(wa, peer.replyJid, peer.waId, text, fromMe);
      } catch (err) {
        log(`[Bot] Error: ${(err as Error).message}`, "\x1b[31m");
      }
    }
  });

  return wa;
}

function startInternalServer() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      whatsappConnected: whatsappOpen && sock !== null,
      internalPort: BOT_INTERNAL_PORT,
      apiBase: API_BASE,
    });
  });

  app.post("/internal/send", async (req, res) => {
    const auth = req.headers["authorization"] || req.body?.secret;
    const expected = BOT_INTERNAL_SECRET ? `Bearer ${BOT_INTERNAL_SECRET}` : null;
    if (expected && auth !== expected) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { to, text } = req.body;
    if (!to || !text) {
      return res.status(400).json({ error: "to y text requeridos" });
    }

    if (!sock) {
      return res.status(503).json({ error: "Bot no conectado" });
    }

    try {
      const jid = toJid(to);
      await sock.sendMessage(jid, { text });
      res.json({ ok: true });
    } catch (err) {
      log(`[Bot] Error enviando a ${to}: ${(err as Error).message}`, "\x1b[31m");
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Bind IPv4 explicitly — Node fetch("http://localhost:…") often hits ::1 first
  // and reports unreachable when the server is IPv4-only.
  app.listen(BOT_INTERNAL_PORT, "127.0.0.1", () => {
    log(`[Bot] Internal API en 127.0.0.1:${BOT_INTERNAL_PORT}`, "\x1b[36m");
  });
}

async function crearSuscripcion(
  send: (msg: string) => Promise<unknown>,
  remitente_wa: string,
  params: {
    monto: number;
    tipo_activo: "SOL" | "USDC";
    frecuencia: string;
    destinatario_wa: string;
    wallet: string;
    nombre_contacto?: string;
    envio_inmediato?: boolean;
  }
) {
  // Prefetch: same wallet already active with a different monto → honest UPFRONT
  // (do NOT say "Programando $1000" then register $10).
  try {
    const listRes = await axios.get(`${API_BASE}/api/suscripciones/${remitente_wa}`);
    const list = Array.isArray(listRes.data) ? listRes.data : [];
    const same = list.find(
      (s: { destinatario_solana?: string; activa?: boolean }) =>
        s.destinatario_solana === params.wallet && s.activa !== false
    ) as
      | {
          monto: number | string;
          tipo_activo?: string;
          frecuencia?: string;
          destinatario_wa?: string;
          nombre_contacto?: string | null;
        }
      | undefined;
    if (same) {
      const activo = humanMontoFromRaw(
        same.monto,
        same.tipo_activo || params.tipo_activo
      );
      if (Number.isFinite(activo) && Math.abs(activo - params.monto) > 1e-9) {
        await send(
          buildMontoNoCambiable({
            montoActivo: activo,
            montoPedido: params.monto,
            tipo_activo: params.tipo_activo,
            frecuencia: same.frecuencia || params.frecuencia,
            destinatario_wa: same.destinatario_wa || params.destinatario_wa,
            nombre_contacto:
              same.nombre_contacto || params.nombre_contacto || null,
          })
        );
        return;
      }
    }
  } catch {
    // If list fails, continue — API response still drives confirmation copy.
  }

  const mxnEstimated = await fetchMxnEstimate(params.monto, params.tipo_activo);

  await send(
    buildRecurrentePending({
      monto: params.monto,
      tipo_activo: params.tipo_activo,
      frecuencia: params.frecuencia,
      nombre_contacto: params.nombre_contacto,
      envio_inmediato: params.envio_inmediato,
      mxn_estimated: mxnEstimated,
    })
  );
  try {
    const res = await axios.post(`${API_BASE}/api/suscripciones`, {
      remitente_wa,
      destinatario_wa: params.destinatario_wa,
      destinatario_solana: params.wallet,
      tipo_activo: params.tipo_activo,
      monto: params.monto,
      frecuencia: params.frecuencia,
      ...(params.envio_inmediato ? { primer_pago_inmediato: true } : {}),
      ...(params.nombre_contacto
        ? { nombre_contacto: params.nombre_contacto }
        : {}),
    });
    const txSig =
      typeof res.data?.tx_signature === "string" ? res.data.tx_signature : null;
    const reused = Boolean(res.data?.reused);
    const montoNoActualizable = Boolean(res.data?.monto_no_actualizable);
    const cluster =
      (process.env.SOLANA_CLUSTER || "devnet").includes("mainnet")
        ? "mainnet-beta"
        : "devnet";
    const explorerUrl = txSig ? buildExplorerTxUrl(txSig, cluster) : null;
    const rawMonto = Number(res.data?.monto);
    const montoConfirm =
      Number.isFinite(rawMonto) && rawMonto > 0
        ? params.tipo_activo === "USDC"
          ? rawMonto / 1e6
          : rawMonto / 1e9
        : params.monto;
    const nombreConfirm =
      (typeof res.data?.nombre_contacto === "string" && res.data.nombre_contacto) ||
      params.nombre_contacto ||
      null;

    // Safety net if prefetch missed (e.g. same PDA, different remitente_wa key)
    if (
      montoNoActualizable ||
      (reused && Math.abs(montoConfirm - params.monto) > 1e-9)
    ) {
      await send(
        buildMontoNoCambiable({
          montoActivo: montoConfirm,
          montoPedido: params.monto,
          tipo_activo: params.tipo_activo,
          frecuencia: params.frecuencia,
          destinatario_wa: params.destinatario_wa,
          nombre_contacto: nombreConfirm,
        })
      );
      return;
    }

    await send(
      buildSuscripcionConfirmada({
        monto: montoConfirm,
        tipo_activo: params.tipo_activo,
        frecuencia: params.frecuencia,
        destinatario_wa: params.destinatario_wa,
        nombre_contacto: nombreConfirm,
        montoPedido: params.monto,
        txSignature: txSig,
        explorerUrl,
        reused,
        envio_inmediato: params.envio_inmediato,
        mxn_estimated: mxnEstimated,
      })
    );
  } catch (err: unknown) {
    await send(buildSuscripcionError(formatApiError(err)));
  }
}

async function handleMisEnvios(send: (msg: string) => Promise<unknown>, wa: string) {
  try {
    const cluster = (process.env.SOLANA_CLUSTER || "devnet").includes("mainnet")
      ? "mainnet-beta"
      : "devnet";

    const [susRes, pagosRes] = await Promise.all([
      axios.get(`${API_BASE}/api/suscripciones/${wa}`),
      axios.get(`${API_BASE}/api/suscripciones/${wa}/pagos`).catch(() => ({ data: [] })),
    ]);

    const list = Array.isArray(susRes.data) ? susRes.data : [];
    const pagos = Array.isArray(pagosRes.data) ? pagosRes.data : [];

    if (list.length === 0 && pagos.length === 0) {
      await send(buildMisRemesasVacio());
      return;
    }

    const parts: string[] = [];

    if (list.length > 0) {
      const lines = list.map(
        (s: {
          monto: number | string;
          frecuencia: string;
          destinatario_wa: string;
          nombre_contacto?: string | null;
          tipo_activo?: string;
          tx_signature?: string | null;
        }) => {
          const dest = formatDestinatarioLabel(s.nombre_contacto, s.destinatario_wa);
          const base = `• *${formatMontoSuscripcion(s)}* · ${labelFrecuencia(s.frecuencia)} → a ${dest}`;
          if (s.tx_signature) {
            return `${base}\n  📄 Comprobante del envío:\n  ${buildExplorerTxUrl(s.tx_signature, cluster)}`;
          }
          return base;
        }
      );
      parts.push(buildMisRemesasLista(lines));
    } else {
      parts.push(buildMisRemesasVacio());
    }

    if (pagos.length > 0) {
      const pagoLines = pagos.map(
        (p: {
          monto: number | string;
          tipo_activo?: string;
          created_at?: string;
          tx_signature?: string;
        }) => {
          const fecha = p.created_at ? formatFechaCorta(p.created_at) : "";
          const monto = formatMontoSuscripcion(p);
          const head = fecha ? `• *${monto}* · ${fecha}` : `• *${monto}*`;
          if (p.tx_signature) {
            return `${head}\n  📄 Comprobante del envío:\n  ${buildExplorerTxUrl(p.tx_signature, cluster)}`;
          }
          return head;
        }
      );
      parts.push(buildHistorialPagosLista(pagoLines));
    } else if (list.length > 0) {
      parts.push(buildHistorialPagosVacio());
    }

    parts.push("Escribe *enviar* para agregar otra.");
    await send(parts.join("\n\n"));
  } catch (err) {
    await send(`No pude consultar tus envíos: ${formatApiError(err)}`);
  }
}

async function handleRecompensas(send: (msg: string) => Promise<unknown>, wa: string) {
  try {
    const res = await axios.get(`${API_BASE}/api/cashback/${wa}`);
    await send(buildRecompensasClubTia(res.data));
  } catch (err) {
    await send(`No pude ver recompensas: ${formatApiError(err)}`);
  }
}

/** Siguiente pregunta del flujo enviar (respeta borrador one-shot). */
function promptForEnviarStep(
  step: string,
  draft: EnviarDraft,
  parsed?: EnviarParsed
): string {
  const understood =
    buildEnviarUnderstood({
      monto: draft.monto ?? parsed?.monto,
      tipo_activo: draft.tipo_activo,
      nombre_contacto: draft.nombre_contacto ?? parsed?.nombre_contacto,
      frecuencia: draft.frecuencia ?? parsed?.frecuencia,
    }) ?? "";

  if (step === "enviar_modo") {
    return buildEnviarModoPicker();
  }
  if (step === "enviar_monto") {
    return buildEnviarAskMonto(draft.modo_envio);
  }
  if (step === "enviar_frecuencia") {
    const monto = draft.monto!;
    return buildEnviarAskFrecuencia(
      monto,
      draft.tipo_activo,
      draft.nombre_contacto
    );
  }
  if (step === "enviar_nombre") {
    // Si ya confirmamos monto/freq arriba, no repetir solo el ask nombre
    if (draft.monto != null && (draft.frecuencia || draft.modo_envio === "inmediato")) {
      return (
        (understood ? `${understood}\n\n` : "") +
        buildEnviarAskNombre().replace(/^Va:.*\n\n/, "")
      );
    }
    return buildEnviarAskNombre(draft.monto, draft.tipo_activo);
  }
  if (step === "enviar_familia") {
    const ask = buildEnviarAskFamilia(draft.nombre_contacto);
    // One-shot completo (monto+nombre[+freq]): eco + WA
    if (parsed && (parsed.monto != null || parsed.nombre_contacto)) {
      return (understood ? `${understood}\n\n` : "") + ask;
    }
    return ask;
  }
  if (step === "enviar_wallet") {
    return buildEnviarAskWallet(draft.nombre_contacto);
  }
  return buildEnviarAskMonto();
}

/** Inicia flujo enviar; si falta modo y frecuencia → paso enviar_modo. */
function beginEnviarFlow(
  wa: string,
  parsed: EnviarParsed,
  modo?: ModoEnvio
) {
  if (modo) {
    return startEnviar(wa, {
      tipo_activo: parsed.tipo_activo,
      modo_envio: modo,
      ...(parsed.monto != null ? { monto: parsed.monto } : {}),
      ...(parsed.frecuencia ? { frecuencia: parsed.frecuencia } : {}),
      ...(parsed.nombre_contacto
        ? { nombre_contacto: parsed.nombre_contacto }
        : {}),
    });
  }
  if (parsed.frecuencia) {
    return startEnviar(wa, {
      tipo_activo: parsed.tipo_activo,
      modo_envio: "programar",
      ...(parsed.monto != null ? { monto: parsed.monto } : {}),
      frecuencia: parsed.frecuencia,
      ...(parsed.nombre_contacto
        ? { nombre_contacto: parsed.nombre_contacto }
        : {}),
    });
  }
  return setStep(wa, "enviar_modo", {
    tipo_activo: parsed.tipo_activo,
    ...(parsed.monto != null ? { monto: parsed.monto } : {}),
    ...(parsed.nombre_contacto
      ? { nombre_contacto: parsed.nombre_contacto }
      : {}),
  });
}

function frecuenciaParaApi(draft: EnviarDraft): "diario" | "semanal" | "mensual" {
  if (draft.modo_envio === "inmediato") return "mensual";
  return draft.frecuencia ?? "mensual";
}

async function handleEnviarFlow(
  send: (msg: string) => Promise<unknown>,
  wa: string,
  text: string
): Promise<boolean> {
  const session = getSession(wa);
  if (session.step === "idle") return false;

  const intent = detectIntent(text);

  // Escapes del flujo (el copy dice "escribe soporte" — debe funcionar en cualquier paso)
  if (intent === "cancelar") {
    clearSession(wa);
    await send(buildCancelado());
    return true;
  }
  if (intent === "soporte") {
    clearSession(wa);
    setStep(wa, "soporte_motivo");
    await send(buildSoporteMenu());
    return true;
  }
  if (intent === "ayuda") {
    // Mid-flow: show help without wiping draft
    await send(buildAyudaEnFlujo(labelPasoEnviar(session.step)));
    return true;
  }
  // Typo frecuente visto en piloto: "Soprte"
  if (/^sop+o?rte$/i.test(text.trim().normalize("NFD").replace(/\p{M}/gu, ""))) {
    clearSession(wa);
    setStep(wa, "soporte_motivo");
    await send(buildSoporteMenu());
    return true;
  }

  if (session.step === "enviar_modo") {
    const modo = parseModoEnvio(text);
    if (!modo) {
      await send(buildEnviarModoPicker());
      return true;
    }
    const patch: Partial<EnviarDraft> = { modo_envio: modo };
    const draft = { ...session.draft, ...patch };
    const next = nextEnviarStep(draft);
    setStep(wa, next, patch);
    await send(promptForEnviarStep(next, draft));
    return true;
  }

  if (session.step === "enviar_monto") {
    // Permite “2000 a mi mujer cada mes” también en el paso de monto
    const oneshot = parseEnviarOneshoot(text);
    const monto = oneshot.monto ?? parseMonto(text);
    if (monto == null) {
      await send(buildMontoInvalido());
      return true;
    }
    const tipo = oneshot.tipo_activo || parseTipoActivo(text);
    const patch: Partial<EnviarDraft> = {
      monto,
      tipo_activo: tipo,
      ...(oneshot.frecuencia
        ? { frecuencia: oneshot.frecuencia, modo_envio: "programar" as const }
        : {}),
      ...(oneshot.nombre_contacto
        ? { nombre_contacto: oneshot.nombre_contacto }
        : {}),
    };
    const draft = { ...session.draft, ...patch };
    const next = nextEnviarStep(draft);
    setStep(wa, next, patch);
    await send(promptForEnviarStep(next, { ...draft, ...patch }, oneshot));
    return true;
  }

  if (session.step === "enviar_frecuencia") {
    if (mentionsQuincena(text) && !parseFrecuencia(text)) {
      await send(buildFrecuenciaQuincena());
      return true;
    }
    const freq = parseFrecuencia(text);
    if (!freq) {
      await send(buildFrecuenciaInvalida());
      return true;
    }
    const patch: Partial<EnviarDraft> = { frecuencia: freq };
    const draft = { ...session.draft, ...patch };
    const next = nextEnviarStep(draft);
    setStep(wa, next, patch);
    await send(promptForEnviarStep(next, draft));
    return true;
  }

  if (session.step === "enviar_nombre") {
    const nombre = parseNombreContacto(text);
    if (!nombre) {
      await send(buildNombreInvalido());
      return true;
    }
    setStep(wa, "enviar_familia", { nombre_contacto: nombre });
    await send(buildEnviarAskFamilia(nombre));
    return true;
  }

  if (session.step === "enviar_familia") {
    const dest = parseWhatsAppDigits(text);
    if (!dest) {
      await send(buildWaInvalido());
      return true;
    }
    const nombre = getSession(wa).draft.nombre_contacto;
    setStep(wa, "enviar_wallet", { destinatario_wa: dest });
    await send(buildEnviarAskWallet(nombre));
    return true;
  }

  if (session.step === "enviar_wallet") {
    const walletRaw = text.trim();
    const blocked = isBlockedSolanaAddress(walletRaw);
    const invalid = blocked || !looksLikeSolanaAddress(walletRaw);
    if (invalid) {
      const fails = (session.draft.walletFails ?? 0) + 1;
      if (fails >= 3) {
        clearSession(wa);
        await send(
          "Demasiados intentos con el código. Escribe *enviar* para empezar de nuevo, *soporte* o *cancelar*."
        );
        return true;
      }
      setStep(wa, "enviar_wallet", { walletFails: fails });
      const tip = blocked
        ? buildWalletProgramaRechazada()
        : buildWalletInvalida();
      await send(
        tip +
          "\n\nSi no tienes el código a la mano, escribe *soporte* o *cancelar*."
      );
      return true;
    }
    const draft = getSession(wa).draft;
    clearSession(wa);
    if (!draft.monto || !draft.destinatario_wa) {
      await send(buildSuscripcionError("Faltaron datos. Escribe *enviar ahora* o *programar* para empezar de nuevo."));
      return true;
    }
    if (draft.modo_envio !== "inmediato" && !draft.frecuencia) {
      await send(buildSuscripcionError("Faltó la frecuencia. Escribe *programar* para empezar de nuevo."));
      return true;
    }
    const envioInmediato = draft.modo_envio === "inmediato";
    await crearSuscripcion(send, wa, {
      monto: draft.monto,
      tipo_activo: draft.tipo_activo,
      frecuencia: frecuenciaParaApi(draft),
      destinatario_wa: draft.destinatario_wa,
      wallet: text.trim(),
      nombre_contacto: draft.nombre_contacto,
      envio_inmediato: envioInmediato,
    });
    return true;
  }

  return false;
}

/** Flujo menú *soporte* — mismo chat; log ticket en backend. */
async function handleSoporteFlow(
  send: (msg: string) => Promise<unknown>,
  wa: string,
  text: string
): Promise<boolean> {
  const session = getSession(wa);
  if (session.step !== "soporte_motivo") return false;

  const intent = detectIntent(text);

  if (intent === "cancelar") {
    clearSession(wa);
    await send(buildCancelado());
    return true;
  }

  // 1–4 / frases del menú antes de que NLU mapee dígitos a otros intents
  const motivo = parseSoporteMotivo(text);
  if (motivo) {
    const trimmed = text.trim();
    const eligioNumero = /^[1-4]/.test(trimmed) || /^[1-4]\uFE0F?\u20E3/.test(trimmed);
    const detalle =
      motivo === "otra" && !eligioNumero && !/^(cuatro|otra|otro)\b/i.test(trimmed)
        ? trimmed.slice(0, 2000)
        : null;

    let ticketId: string | null = null;
    try {
      const res = await axios.post(`${API_BASE}/api/soporte`, {
        usuario_wa: wa,
        motivo,
        detalle,
        canal: "whatsapp",
      });
      ticketId = res.data?.id ?? null;
    } catch (err) {
      console.warn("[Bot] No se pudo registrar ticket soporte:", formatApiError(err));
    }

    clearSession(wa);
    await send(buildSoporteRecibido(motivo, ticketId));
    return true;
  }

  if (intent === "ayuda" || intent === "soporte") {
    await send(buildSoporteMenu());
    return true;
  }

  if (
    intent === "enviar_inmediato" ||
    intent === "programar" ||
    intent === "enviar" ||
    intent === "mis_envios" ||
    intent === "recompensas" ||
    intent === "codigo" ||
    intent === "canjear" ||
    intent === "piloto"
  ) {
    clearSession(wa);
    return false;
  }

  await send(buildSoporteMotivoInvalido());
  return true;
}

async function handleCommand(
  sock: WASocket,
  replyJid: string,
  waId: string,
  text: string,
  fromMe: boolean
) {
  const wa = waId;
  const send = (msg: string) => sock.sendMessage(replyJid, { text: msg });

  // Soporte (menú motivos) antes de enviar — "1" no debe abrir remesa
  if (await handleSoporteFlow(send, wa, text)) return;

  // Flujo guiado "enviar" (prioridad sobre menú)
  if (await handleEnviarFlow(send, wa, text)) return;

  const intent = detectIntent(text);

  if (intent === "ayuda") {
    await send(buildAyuda());
    return;
  }

  if (intent === "cancelar") {
    clearSession(wa);
    await send(buildCancelado());
    return;
  }

  if (intent === "enviar_inmediato") {
    const parsed = parseEnviarOneshoot(text);
    const session = beginEnviarFlow(wa, parsed, "inmediato");
    await send(promptForEnviarStep(session.step, session.draft, parsed));
    return;
  }

  if (intent === "programar") {
    if (mentionsQuincena(text) && !parseFrecuencia(text)) {
      await send(buildFrecuenciaQuincena());
      return;
    }
    const parsed = parseEnviarOneshoot(text);
    const session = beginEnviarFlow(wa, parsed, "programar");
    await send(promptForEnviarStep(session.step, session.draft, parsed));
    return;
  }

  if (intent === "enviar") {
    if (mentionsQuincena(text) && !parseFrecuencia(text)) {
      await send(buildFrecuenciaQuincena());
      return;
    }
    const parsed = parseEnviarOneshoot(text);
    const session = beginEnviarFlow(wa, parsed);
    await send(promptForEnviarStep(session.step, session.draft, parsed));
    return;
  }

  if (intent === "mis_envios") {
    await handleMisEnvios(send, wa);
    return;
  }

  if (intent === "recompensas") {
    await handleRecompensas(send, wa);
    return;
  }

  if (intent === "codigo" || text.trim() === "/generar-codigo") {
    try {
      const res = await axios.post(`${API_BASE}/api/cashback/generar-codigo`, {
        usuario_wa: wa,
      });
      await send(`Tu código para invitar familia/amigos: *${res.data.codigo}*`);
    } catch (err) {
      await send(`No pude generar el código: ${formatApiError(err)}`);
    }
    return;
  }

  if (intent === "canjear" || text.startsWith("/canjear ")) {
    const monto = parseMonto(text.startsWith("/canjear ") ? text.slice(9) : text);
    if (monto == null) {
      await send("Para canjear escribe: *canjear 10* (el número es el monto).");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/cashback/canjear`, {
        usuario_wa: wa,
        monto,
      });
      await send(res.data.mensaje || "Canje listo.");
    } catch (err: unknown) {
      await send(`No se pudo canjear: ${formatApiError(err)}`);
    }
    return;
  }

  if (intent === "soporte" || text.trim() === "/soporte") {
    clearSession(wa);
    setStep(wa, "soporte_motivo");
    await send(buildSoporteMenu());
    return;
  }

  if (intent === "piloto" || text.startsWith("/registro-piloto")) {
    const parts = text.replace(/^\/registro-piloto/i, "").trim().split(/\s+/).filter(Boolean);
    const rol = (parts[0] || "receptora").toLowerCase();
    const zona = (parts[1] || "rural").toLowerCase();
    const bancarizado = (parts[2] || "no").toLowerCase();
    const rolesOk = ["remitente", "receptora", "promotor", "tiendita"];
    if (!rolesOk.includes(rol)) {
      await send("Para el piloto dime tu rol: *remitente*, *receptora*, *promotor* o *tiendita*.");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/pilotos`, {
        whatsapp: wa,
        rol,
        zona,
        bancarizado,
        canal_confianza: "familia",
        notas: `Registro vía bot natural. Args: ${parts.join(" ")}`,
      });
      await send(
        `*Registro piloto listo*\n\n` +
          `Te tenemos como *${rol}* (${zona}).\n` +
          `Folio: ${res.data.id}\n\n` +
          `El equipo te escribe pronto. Gracias.`
      );
    } catch (err: unknown) {
      await send(`No se pudo registrar: ${formatApiError(err)}`);
    }
    return;
  }

  // Alias slash legacy (scripts / demo técnico)
  if (text.startsWith("/start") || text.startsWith("/ayuda")) {
    await send(buildAyuda());
    return;
  }

  if (text.startsWith("/recurrente")) {
    const parts = text.replace(/^\/recurrente\s*/i, "").trim().split(/\s+/).filter(Boolean);
    if (parts.length < 4) {
      await send(buildRecurrenteUso());
      return;
    }
    let montoStr: string, frecuencia: string, destinatario_wa: string, wallet_solana: string;
    let tipo_activo: "SOL" | "USDC" = "USDC";
    if (parts.length >= 5 && /^(SOL|USDC)$/i.test(parts[1])) {
      [montoStr, , frecuencia, destinatario_wa, wallet_solana] = parts;
      tipo_activo = parts[1].toUpperCase() as "SOL" | "USDC";
    } else {
      [montoStr, frecuencia, destinatario_wa, wallet_solana] = parts;
      tipo_activo = "SOL";
    }
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      await send(buildMontoInvalido());
      return;
    }
    await crearSuscripcion(send, wa, {
      monto,
      tipo_activo,
      frecuencia: frecuencia.toLowerCase(),
      destinatario_wa,
      wallet: wallet_solana,
    });
    return;
  }

  if (text === "/mis-remesas") {
    await handleMisEnvios(send, wa);
    return;
  }

  if (text === "/cashback" || text === "/mis-recompensas") {
    await handleRecompensas(send, wa);
    return;
  }

  if (text.trim().length > 0 && !fromMe) {
    if (getSession(wa).step === "idle" && looksLikeMontoOnly(text)) {
      const monto = parseMonto(text)!;
      const session = setStep(wa, "enviar_modo", {
        tipo_activo: parseTipoActivo(text),
        monto,
      });
      await send(
        `Va: *$${Number.isInteger(monto) ? monto : monto.toFixed(2)}*.\n\n` +
          buildEnviarModoPicker()
      );
      return;
    }
    await send(buildNoEntendi());
  }
}

startInternalServer();

connect()
  .then((s) => {
    sock = s;
  })
  .catch(console.error);
