/**
 * Rutas usuarios piloto — identificación temprana (M2/M4 WayLearn)
 */
import { Router } from "express";
import { z } from "zod";
import {
  registrarUsuarioPiloto,
  listarUsuariosPiloto,
  obtenerUsuarioPilotoPorWa,
} from "../services/pilotos.js";

const router = Router();

const crearSchema = z.object({
  whatsapp: z.string().min(10).max(50),
  rol: z.enum(["remitente", "receptora", "promotor", "tiendita"]),
  nombre_opcional: z.string().max(120).optional(),
  genero: z.enum(["femenino", "masculino", "otro", "prefiero_no_decir"]).optional(),
  edad_rango: z.string().max(20).optional(),
  estado: z.string().max(80).optional(),
  municipio: z.string().max(120).optional(),
  zona: z.enum(["rural", "semiurbana", "urbana"]).optional(),
  bancarizado: z.enum(["si", "no", "sub"]).optional(),
  canal_confianza: z
    .enum([
      "tiendita",
      "comerciantes",
      "pyme",
      "asociacion_migrante",
      "iglesia",
      "asociacion",
      "familia",
      "microfinanzas",
      "otro",
    ])
    .optional(),
  canal_detalle: z.string().max(500).optional(),
  referido_por_id: z.string().uuid().optional(),
  wallet_solana: z.string().min(32).max(44).optional(),
  notas: z.string().max(2000).optional(),
});

router.post("/", async (req, res) => {
  try {
    const parsed = crearSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const usuario = await registrarUsuarioPiloto(parsed.data);
    res.status(201).json(usuario);
  } catch (err) {
    console.error("Error registrar piloto:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Error al registrar piloto",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const rol = req.query.rol as string | undefined;
    const zona = req.query.zona as string | undefined;
    const bancarizado = req.query.bancarizado as string | undefined;

    const usuarios = await listarUsuariosPiloto({
      rol: rol as "remitente" | "receptora" | "promotor" | "tiendita" | undefined,
      zona: zona as "rural" | "semiurbana" | "urbana" | undefined,
      bancarizado: bancarizado as "si" | "no" | "sub" | undefined,
    });
    res.json({ total: usuarios.length, usuarios });
  } catch (err) {
    console.error("Error listar pilotos:", err);
    res.status(500).json({ error: "Error al listar pilotos" });
  }
});

router.get("/:wa", async (req, res) => {
  try {
    const usuario = await obtenerUsuarioPilotoPorWa(req.params.wa);
    if (!usuario) {
      return res.status(404).json({ error: "Piloto no encontrado" });
    }
    res.json(usuario);
  } catch (err) {
    console.error("Error obtener piloto:", err);
    res.status(500).json({ error: "Error al obtener piloto" });
  }
});

export default router;
