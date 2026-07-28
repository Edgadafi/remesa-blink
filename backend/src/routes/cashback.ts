/**
 * Rutas de cashback
 */
import { Router } from "express";
import {
  generarCodigoReferido,
  registrarReferido,
  obtenerResumenCashback,
  canjearCashback,
} from "../services/cashback.js";
import { z } from "zod";

const router = Router();

router.post("/generar-codigo", async (req, res) => {
  try {
    const { usuario_wa } = req.body;
    if (!usuario_wa) {
      return res.status(400).json({ error: "usuario_wa requerido" });
    }
    const result = await generarCodigoReferido(usuario_wa);
    res.json(result);
  } catch (err) {
    console.error("Error generar codigo:", err);
    res.status(500).json({ error: "Error al generar codigo" });
  }
});

router.post("/registrar-referido", async (req, res) => {
  try {
    const { referido_wa, codigo } = req.body;
    if (!referido_wa || !codigo) {
      return res.status(400).json({ error: "referido_wa y codigo requeridos" });
    }
    const result = await registrarReferido(referido_wa, codigo);
    res.json(result);
  } catch (err) {
    console.error("Error registrar referido:", err);
    res.status(400).json({
      error: err instanceof Error ? err.message : "Error al registrar referido",
    });
  }
});

function describeErr(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Error desconocido";
}

/** Campos útiles de errores node-postgres */
function pgExtras(err: unknown): string {
  if (!err || typeof err !== "object") return "";
  const e = err as { code?: string; detail?: string; schema?: string; table?: string };
  const parts: string[] = [];
  if (e.code) parts.push(`código PG ${e.code}`);
  if (e.table) parts.push(`tabla: ${e.table}`);
  if (e.detail) parts.push(e.detail);
  return parts.length ? ` (${parts.join("; ")})` : "";
}

router.get("/:wa", async (req, res) => {
  try {
    const wa = req.params.wa;
    const resumen = await obtenerResumenCashback(wa);
    res.json(resumen);
  } catch (err) {
    console.error("Error obtener cashback:", err);
    const base = describeErr(err);
    const extras = pgExtras(err);
    const tail =
      " — Comprueba backend/.env DATABASE_URL, que PostgreSQL esté arriba y ejecuta `npm run db:schema` desde la raíz del repo. En Neon/Supabase suele hacer falta ?sslmode=require en la URL.";
    res.status(500).json({
      error: `${base}${extras}${tail}`,
    });
  }
});

router.post("/canjear", async (req, res) => {
  try {
    const schema = z.object({ usuario_wa: z.string(), monto: z.number().positive() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const result = await canjearCashback(parsed.data.usuario_wa, parsed.data.monto);
    res.json(result);
  } catch (err) {
    console.error("Error canjear:", err);
    res.status(400).json({
      error: err instanceof Error ? err.message : "Error al canjear",
    });
  }
});

export default router;
