/**
 * App Express - Backend + Blinks
 * Exportado para tests; index.ts importa y escucha.
 */
import "dotenv/config";
import express from "express";
import suscripcionesRouter from "./routes/suscripciones.js";
import cashbackRouter from "./routes/cashback.js";
import etherfuseRouter from "./routes/etherfuse.js";
import webhooksRouter from "./routes/webhooks.js";
import blinksRouter from "./routes/blinks.js";

const app = express();
app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Encoding, Accept-Encoding");
  res.setHeader("X-Action-Version", "1");
  next();
});
app.options("*", (_req, res) => res.sendStatus(204));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/suscripciones", suscripcionesRouter);
app.use("/api/cashback", cashbackRouter);
app.use("/api/etherfuse", etherfuseRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/", blinksRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

export { app };
