/**
 * App Express - Backend + Blinks
 * Exportado para tests; index.ts importa y escucha.
 */
import "dotenv/config";
import express from "express";
import { actionCorsMiddleware } from "@solana/actions";
import suscripcionesRouter from "./routes/suscripciones.js";
import composabilityRouter from "./routes/composability.js";
import pilotosRouter from "./routes/pilotos.js";
import cashbackRouter from "./routes/cashback.js";
import lealtadRouter from "./routes/lealtad.js";
import soporteRouter from "./routes/soporte.js";
import etherfuseRouter from "./routes/etherfuse.js";
import webhooksRouter from "./routes/webhooks.js";
import blinksRouter from "./routes/blinks.js";
import pool from "./db/pool.js";

const app = express();
app.use(express.json());

/** CORS para frontend (Vercel / localhost) → API /api/* */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.CORS_ORIGIN ?? "http://localhost:3003")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isDevLan =
    process.env.NODE_ENV !== "production" &&
    !!origin &&
    /^http:\/\/(localhost|127\.0\.0\.1|172\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/.test(
      origin
    );
  if (origin && (allowed.includes(origin) || allowed.includes("*") || isDevLan)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(actionCorsMiddleware({ actionVersion: 1 }));
app.options("*", (_req, res) => res.sendStatus(204));

/** Raíz: el túnel/API no es un sitio web; evita "Cannot GET /" al abrir la URL en el navegador. */
app.get("/", (_req, res) => {
  res.status(200).json({
    service: "remesa-blink-api",
    message: "API Remesa Blink (backend + Blinks). Usa /health o las rutas /api/*.",
    health: "/health",
    frontend: process.env.CORS_ORIGIN?.split(",")[0]?.trim() || null,
    endpoints: {
      health: "GET /health",
      suscripciones: "/api/suscripciones",
      pilotos: "/api/pilotos",
      cashback: "/api/cashback",
      lealtad: "/api/lealtad",
      soporte: "/api/soporte",
      actions: "/api/actions/*",
    },
  });
});

app.get("/health", async (_req, res) => {
  const payload: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    cluster: process.env.SOLANA_RPC_URL?.includes("devnet") ? "devnet" : "custom",
    programId: process.env.PROGRAM_ID ?? null,
  };

  try {
    await pool.query("SELECT 1");
    payload.database = "ok";
  } catch {
    payload.database = "error";
    payload.status = "degraded";
  }

  const botUrlRaw = process.env.BOT_INTERNAL_URL;
  if (botUrlRaw) {
    // Prefer IPv4 loopback: undici/fetch often resolves "localhost" to ::1 first.
    const botUrl = botUrlRaw.replace(/\/$/, "").replace("://localhost", "://127.0.0.1");
    try {
      const r = await fetch(`${botUrl}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      payload.bot = r.ok ? "ok" : "error";
    } catch {
      payload.bot = "unreachable";
    }
  }

  const code = payload.status === "ok" ? 200 : 503;
  res.status(code).json(payload);
});

app.use("/api/suscripciones", suscripcionesRouter);
app.use("/api/composability", composabilityRouter);
app.use("/api/pilotos", pilotosRouter);
app.use("/api/cashback", cashbackRouter);
app.use("/api/lealtad", lealtadRouter);
app.use("/api/soporte", soporteRouter);
app.use("/api/etherfuse", etherfuseRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/", blinksRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

export { app };
