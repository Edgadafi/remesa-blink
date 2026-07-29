import { describe, expect, it } from "vitest";
import { listarPagosPorWa } from "../src/services/pagos.js";

/**
 * Smoke: función exportada y firmada (DB real opcional en CI local).
 * Si no hay DATABASE_URL, el import + tipo basta; skip query.
 */
describe("listarPagosPorWa", () => {
  it("está exportada", () => {
    expect(typeof listarPagosPorWa).toBe("function");
  });

  it("devuelve array cuando hay DB", async () => {
    if (!process.env.DATABASE_URL) {
      return;
    }
    const rows = await listarPagosPorWa("5210000000000");
    expect(Array.isArray(rows)).toBe(true);
  });
});
