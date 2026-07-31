/**
 * Rutas soporte piloto — tickets desde bot WhatsApp
 */
import { Router } from "express";
import { z } from "zod";
import {
  crearTicketSoporte,
  listarTicketsSoporte,
  actualizarEstadoTicket,
} from "../services/soporte.js";

const router = Router();

const crearSchema = z.object({
  usuario_wa: z.string().min(8).max(50),
  motivo: z.enum(["no_aviso", "cambiar_envio", "sin_codigo", "otra"]),
  detalle: z.string().max(2000).optional().nullable(),
  canal: z.string().max(20).optional(),
});

router.post("/", async (req, res) => {
  try {
    const parsed = crearSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const ticket = await crearTicketSoporte(parsed.data);
    res.status(201).json({
      id: ticket.id,
      usuario_wa: ticket.usuario_wa,
      motivo: ticket.motivo,
      estado: ticket.estado,
      created_at: ticket.created_at,
    });
  } catch (err) {
    console.error("Error crear ticket soporte:", err);
    const msg = err instanceof Error ? err.message : "Error al crear ticket";
    const hint =
      /soporte_tickets|relation/.test(msg)
        ? " — Ejecuta db/migrations/005_soporte_tickets.sql"
        : "";
    res.status(500).json({ error: `${msg}${hint}` });
  }
});

router.get("/", async (req, res) => {
  try {
    const estado =
      typeof req.query.estado === "string" ? req.query.estado : undefined;
    const tickets = await listarTicketsSoporte({ estado, limit: 50 });
    res.json({ tickets });
  } catch (err) {
    console.error("Error listar tickets:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al listar",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const schema = z.object({
      estado: z.enum(["abierto", "en_curso", "cerrado"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const row = await actualizarEstadoTicket(req.params.id, parsed.data.estado);
    if (!row) return res.status(404).json({ error: "Ticket no encontrado" });
    res.json(row);
  } catch (err) {
    console.error("Error actualizar ticket:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al actualizar",
    });
  }
});

export default router;
