/**
 * Bot WhatsApp - Remesa Blink
 * Baileys con reconexión, comandos y endpoint interno para notificaciones
 */
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  type WASocket,
} from "@whiskeysockets/baileys";
import express from "express";
import pino from "pino";
import qrcode from "qrcode-terminal";
import axios from "axios";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  buildAyuda,
  buildCancelado,
  buildEnviarAskFamilia,
  buildEnviarAskFrecuencia,
  buildEnviarAskMonto,
  buildEnviarAskWallet,
  buildFrecuenciaInvalida,
  buildMisRemesasLista,
  buildMisRemesasVacio,
  buildMontoInvalido,
  buildNoEntendi,
  buildRecurrentePending,
  buildRecurrenteUso,
  buildSoporte,
  buildSuscripcionConfirmada,
  buildSuscripcionError,
  buildWaInvalido,
  buildWalletInvalida,
  labelFrecuencia,
} from "./copy.js";
import {
  detectIntent,
  looksLikeSolanaAddress,
  parseFrecuencia,
  parseMonto,
  parseTipoActivo,
  parseWhatsAppDigits,
} from "./nlu.js";
import { clearSession, getSession, setStep, startEnviar } from "./session.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";
const BOT_INTERNAL_PORT = parseInt(process.env.BOT_INTERNAL_PORT || "3002", 10);
const BOT_INTERNAL_SECRET = process.env.BOT_INTERNAL_SECRET || "";

const logger = pino({ level: process.env.DEBUG ? "debug" : "info" });

let sock: WASocket | null = null;
let whatsappOpen = false;

function log(msg: string, color = "\x1b[0m") {
  console.log(`${color}${msg}\x1b[0m`);
}

function toJid(wa: string): string {
  const clean = wa.replace(/\D/g, "");
  return `${clean}@s.whatsapp.net`;
}

/** Mensaje legible para errores HTTP del backend (JSON { error } o Zod flatten). */
function formatApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data;
    if (d && typeof d === "object" && "error" in d) {
      const e = (d as { error: unknown }).error;
      if (typeof e === "string") return e;
      if (e && typeof e === "object" && "formErrors" in e) {
        const o = e as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
        const parts: string[] = [];
        if (Array.isArray(o.formErrors) && o.formErrors.length) parts.push(...o.formErrors);
        if (o.fieldErrors) {
          for (const [k, v] of Object.entries(o.fieldErrors)) {
            if (Array.isArray(v) && v.length) parts.push(`${k}: ${v.join(", ")}`);
          }
        }
        if (parts.length) return parts.join("; ");
      }
      try {
        return JSON.stringify(e);
      } catch {
        return err.message;
      }
    }
    if (err.response?.status) return `HTTP ${err.response.status}: ${err.message}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

function formatMontoSuscripcion(s: {
  monto: number | string;
  tipo_activo?: string;
}): string {
  const tipo = (s.tipo_activo || "SOL").toUpperCase();
  const raw = BigInt(String(s.monto).replace(/\..*$/, ""));
  if (tipo === "USDC") return `${Number(raw) / 1e6} USDC`;
  return `${Number(raw) / 1e9} SOL`;
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

  wa.ev.on("messages.upsert", async ({ messages }) => {
    for (const m of messages) {
      if (!m.message) continue;
      const jid = m.key.remoteJid!;
      const participant = m.key.participant;
      const fromMe = m.key.fromMe ?? false;
      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        "";
      // Ignorar fromMe salvo /comandos, frases del menú o flujo activo
      if (fromMe) {
        const sessionWa = (participant || jid).replace(/@.*/, "");
        const inFlow = getSession(sessionWa).step !== "idle";
        const intent = detectIntent(text);
        if (!text.trim().startsWith("/") && intent === "unknown" && !inFlow) continue;
      }
      const replyJid = participant || jid;
      log(`[Bot] Recibido de ${replyJid}: ${text.slice(0, 50)}${text.length > 50 ? "..." : ""}`, "\x1b[90m");
      try {
        await handleCommand(wa, replyJid, jid, text, fromMe);
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

  app.listen(BOT_INTERNAL_PORT, () => {
    log(`[Bot] Internal API en :${BOT_INTERNAL_PORT}`, "\x1b[36m");
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
  }
) {
  await send(
    buildRecurrentePending({
      monto: params.monto,
      tipo_activo: params.tipo_activo,
      frecuencia: params.frecuencia,
    })
  );
  try {
    await axios.post(`${API_BASE}/api/suscripciones`, {
      remitente_wa,
      destinatario_wa: params.destinatario_wa,
      destinatario_solana: params.wallet,
      tipo_activo: params.tipo_activo,
      monto: params.monto,
      frecuencia: params.frecuencia,
    });
    await send(
      buildSuscripcionConfirmada({
        monto: params.monto,
        tipo_activo: params.tipo_activo,
        frecuencia: params.frecuencia,
        destinatario_wa: params.destinatario_wa,
      })
    );
  } catch (err: unknown) {
    await send(buildSuscripcionError(formatApiError(err)));
  }
}

async function handleMisEnvios(send: (msg: string) => Promise<unknown>, wa: string) {
  try {
    const res = await axios.get(`${API_BASE}/api/suscripciones/${wa}`);
    const list = res.data;
    if (!Array.isArray(list) || list.length === 0) {
      await send(buildMisRemesasVacio());
      return;
    }
    const lines = list.map(
      (s: {
        monto: number | string;
        frecuencia: string;
        destinatario_wa: string;
        tipo_activo?: string;
      }) =>
        `• *${formatMontoSuscripcion(s)}* · ${labelFrecuencia(s.frecuencia)} → +${s.destinatario_wa.replace(/\D/g, "")}`
    );
    await send(buildMisRemesasLista(lines));
  } catch (err) {
    await send(`No pude consultar tus envíos: ${formatApiError(err)}`);
  }
}

async function handleRecompensas(send: (msg: string) => Promise<unknown>, wa: string) {
  try {
    const res = await axios.get(`${API_BASE}/api/cashback/${wa}`);
    const d = res.data;
    await send(
      `*Tus recompensas*\n` +
        `Total: ${d.total_acumulado}\n` +
        `Disponible: ${d.disponible}\n` +
        `Código referido: ${d.codigo_referido || "aún no tienes — escribe *código*"}`
    );
  } catch (err) {
    await send(`No pude ver recompensas: ${formatApiError(err)}`);
  }
}

async function handleEnviarFlow(
  send: (msg: string) => Promise<unknown>,
  wa: string,
  text: string
): Promise<boolean> {
  const session = getSession(wa);
  if (session.step === "idle") return false;

  if (detectIntent(text) === "cancelar") {
    clearSession(wa);
    await send(buildCancelado());
    return true;
  }

  if (session.step === "enviar_monto") {
    const monto = parseMonto(text);
    if (monto == null) {
      await send(buildMontoInvalido());
      return true;
    }
    const tipo = parseTipoActivo(text);
    setStep(wa, "enviar_frecuencia", { monto, tipo_activo: tipo });
    await send(buildEnviarAskFrecuencia(monto, tipo));
    return true;
  }

  if (session.step === "enviar_frecuencia") {
    const freq = parseFrecuencia(text);
    if (!freq) {
      await send(buildFrecuenciaInvalida());
      return true;
    }
    setStep(wa, "enviar_familia", { frecuencia: freq });
    await send(buildEnviarAskFamilia());
    return true;
  }

  if (session.step === "enviar_familia") {
    const dest = parseWhatsAppDigits(text);
    if (!dest) {
      await send(buildWaInvalido());
      return true;
    }
    setStep(wa, "enviar_wallet", { destinatario_wa: dest });
    await send(buildEnviarAskWallet());
    return true;
  }

  if (session.step === "enviar_wallet") {
    if (!looksLikeSolanaAddress(text)) {
      await send(buildWalletInvalida());
      return true;
    }
    const draft = getSession(wa).draft;
    clearSession(wa);
    if (!draft.monto || !draft.frecuencia || !draft.destinatario_wa) {
      await send(buildSuscripcionError("Faltaron datos. Escribe *enviar* para empezar de nuevo."));
      return true;
    }
    await crearSuscripcion(send, wa, {
      monto: draft.monto,
      tipo_activo: draft.tipo_activo,
      frecuencia: draft.frecuencia,
      destinatario_wa: draft.destinatario_wa,
      wallet: text.trim(),
    });
    return true;
  }

  return false;
}

async function handleCommand(
  sock: WASocket,
  replyJid: string,
  _chatJid: string,
  text: string,
  fromMe: boolean
) {
  const wa = replyJid.replace(/@.*/, "");
  const send = (msg: string) => sock.sendMessage(replyJid, { text: msg });

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

  if (intent === "enviar") {
    startEnviar(wa, parseTipoActivo(text));
    await send(buildEnviarAskMonto());
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
    await send(buildSoporte());
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
    await send(buildNoEntendi());
  }
}

startInternalServer();

connect()
  .then((s) => {
    sock = s;
  })
  .catch(console.error);
