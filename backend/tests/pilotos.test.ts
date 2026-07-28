/**
 * Tests API usuarios piloto
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

vi.mock("../src/services/pilotos.js", () => ({
  registrarUsuarioPiloto: vi.fn(),
  listarUsuariosPiloto: vi.fn(),
  obtenerUsuarioPilotoPorWa: vi.fn(),
}));

const {
  registrarUsuarioPiloto,
  listarUsuariosPiloto,
  obtenerUsuarioPilotoPorWa,
} = await import("../src/services/pilotos.js");

describe("API /api/pilotos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST / crea piloto", async () => {
    vi.mocked(registrarUsuarioPiloto).mockResolvedValue({
      id: "uuid-1",
      whatsapp: "5215512345678",
      rol: "receptora",
    } as never);

    const res = await request(app).post("/api/pilotos").send({
      whatsapp: "5215512345678",
      rol: "receptora",
      zona: "rural",
      bancarizado: "no",
      canal_confianza: "tiendita",
    });

    expect(res.status).toBe(201);
    expect(res.body.rol).toBe("receptora");
  });

  it("POST / acepta canal_confianza comerciantes", async () => {
    vi.mocked(registrarUsuarioPiloto).mockResolvedValue({
      id: "uuid-2",
      whatsapp: "5215512345679",
      rol: "promotor",
      canal_confianza: "comerciantes",
    } as never);

    const res = await request(app).post("/api/pilotos").send({
      whatsapp: "5215512345679",
      rol: "promotor",
      canal_confianza: "comerciantes",
    });

    expect(res.status).toBe(201);
  });

  it("GET / lista pilotos con filtros", async () => {
    vi.mocked(listarUsuariosPiloto).mockResolvedValue([
      { id: "1", rol: "receptora" },
    ] as never);

    const res = await request(app).get("/api/pilotos?rol=receptora&zona=rural");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it("GET /:wa retorna 404 si no existe", async () => {
    vi.mocked(obtenerUsuarioPilotoPorWa).mockResolvedValue(null);
    const res = await request(app).get("/api/pilotos/5219999999999");
    expect(res.status).toBe(404);
  });
});
