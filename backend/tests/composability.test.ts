/**
 * Tests API composabilidad
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

vi.mock("../src/services/solana.js", () => ({
  fetchPerfilRemitente: vi.fn(),
  fetchPerfilDestinatario: vi.fn(),
  getPerfilRemitentePda: vi.fn().mockReturnValue([
    { toBase58: () => "PerfilRemitentePda1111111111111111111111111" },
    255,
  ]),
  getPerfilDestinatarioPda: vi.fn().mockReturnValue([
    { toBase58: () => "PerfilDestinatarioPda1111111111111111111111" },
    255,
  ]),
  MINT_SOL_SENTINEL: { toBase58: () => "11111111111111111111111111111111" },
}));

vi.mock("../src/services/pagos.js", () => ({
  listarPagosPorWallet: vi.fn().mockResolvedValue([]),
}));

const { fetchPerfilRemitente, fetchPerfilDestinatario } = await import(
  "../src/services/solana.js"
);

describe("GET /api/composability/perfil/:wallet", () => {
  beforeEach(() => {
    vi.mocked(fetchPerfilRemitente).mockResolvedValue({
      totalEnviado: { toString: () => "1000000000" },
      pagosCompletados: { toNumber: () => 3 },
      primeraActividad: { toNumber: () => 1700000000 },
      ultimaActividad: { toNumber: () => 1700100000 },
    } as never);
    vi.mocked(fetchPerfilDestinatario).mockResolvedValue(null);
  });

  it("retorna perfil remitente on-chain", async () => {
    const wallet = "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH";
    const res = await request(app).get(`/api/composability/perfil/${wallet}`);

    expect(res.status).toBe(200);
    expect(res.body.wallet).toBe(wallet);
    expect(res.body.remitente.pagosCompletados).toBe(3);
    expect(res.body.destinatario).toBeNull();
  });

  it("rechaza wallet inválida", async () => {
    const res = await request(app).get("/api/composability/perfil/not-a-wallet");
    expect(res.status).toBe(400);
  });
});
