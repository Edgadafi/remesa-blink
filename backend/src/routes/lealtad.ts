/**
 * Rutas Club TIA / lealtad
 */
import { Router } from "express";
import {
  obtenerResumenLealtad,
  listarNiveles,
  recalcularMiembro,
} from "../services/lealtad.js";

const router = Router();

router.get("/niveles", async (_req, res) => {
  try {
    const niveles = await listarNiveles();
    res.json({ niveles });
  } catch (err) {
    console.error("Error listar niveles:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al listar niveles",
      hint: "Ejecuta db/migrations/004_lealtad_club_tia.sql",
    });
  }
});

router.post("/:wa/recalcular", async (req, res) => {
  try {
    const resumen = await recalcularMiembro(req.params.wa);
    if (!resumen) {
      return res.status(503).json({ error: "Tablas Club TIA no disponibles" });
    }
    res.json(resumen);
  } catch (err) {
    console.error("Error recalcular lealtad:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al recalcular",
    });
  }
});

router.get("/:wa", async (req, res) => {
  try {
    const resumen = await obtenerResumenLealtad(req.params.wa);
    if (!resumen) {
      return res.status(404).json({
        error: "Sin datos Club TIA",
        hint: "Ejecuta la migración 004 o registra un pago primero",
      });
    }
    res.json(resumen);
  } catch (err) {
    console.error("Error obtener lealtad:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al obtener lealtad",
    });
  }
});

export default router;
