/**
 * Rutas de suscripciones
 */
import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
  crearSuscripcion,
  listarSuscripcionesPorUsuario,
} from "../services/suscripciones.js";
import { listarPagosPorWa } from "../services/pagos.js";
import { z } from "zod";

const router = Router();

/** Program ids / system accounts — never valid as destinatario wallet. */
const BLOCKED_DEST_PUBKEYS = new Set(
  [
    process.env.PROGRAM_ID,
    "B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2",
    "11111111111111111111111111111111",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  ].filter((x): x is string => typeof x === "string" && x.length >= 32)
);

function isValidDestinatarioSolana(addr: string): boolean {
  try {
    const pk = new PublicKey(addr);
    if (BLOCKED_DEST_PUBKEYS.has(pk.toBase58())) return false;
    return true;
  } catch {
    return false;
  }
}

const crearSchema = z.object({
  remitente_wa: z.string().min(1),
  destinatario_wa: z.string().min(1),
  destinatario_solana: z.string().min(32).max(44),
  monto: z.number().positive(),
  frecuencia: z.enum(["diario", "semanal", "mensual"]),
  tipo_activo: z.enum(["SOL", "USDC"]).optional().default("SOL"),
  nombre_contacto: z.string().trim().min(1).max(40).optional().nullable(),
  usuario_remitente_solana: z.string().min(32).max(44).optional(),
});

router.post("/", async (req, res) => {
  try {
    const parsed = crearSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    if (!isValidDestinatarioSolana(parsed.data.destinatario_solana)) {
      return res.status(400).json({
        error:
          "destinatario_solana inválido: usa la wallet del destinatario (no el program id)",
        code: "WALLET_INVALIDA",
      });
    }
    const suscripcion = await crearSuscripcion(parsed.data);
    res.status(201).json(suscripcion);
  } catch (err) {
    console.error("Error crear suscripcion:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al crear suscripcion",
    });
  }
});

router.get("/:wa/pagos", async (req, res) => {
  try {
    const wa = req.params.wa;
    const pagos = await listarPagosPorWa(wa);
    res.json(pagos);
  } catch (err) {
    console.error("Error listar pagos por WA:", err);
    res.status(500).json({ error: "Error al listar pagos" });
  }
});

router.get("/:wa", async (req, res) => {
  try {
    const wa = req.params.wa;
    const suscripciones = await listarSuscripcionesPorUsuario(wa);
    res.json(suscripciones);
  } catch (err) {
    console.error("Error listar suscripciones:", err);
    res.status(500).json({ error: "Error al listar suscripciones" });
  }
});

export default router;
