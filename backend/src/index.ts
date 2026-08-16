/**
 * Backend API + Blinks - Remesa Blink
 * Un solo servidor: suscripciones, cashback, Blinks
 */
import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Backend+Blinks en http://localhost:${PORT}`);
  if (process.env.RUN_KEEPER === "true") {
    import("./keeper/cron.js").then(() => console.log("Keeper iniciado (integrado)"));
  }
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Puerto ${PORT} ocupado. Para Remesa Blink: mata el otro proceso (ss -ltnp | grep :${PORT}) o arranca con PORT=3001.`
    );
    process.exit(1);
  }
  throw err;
});
