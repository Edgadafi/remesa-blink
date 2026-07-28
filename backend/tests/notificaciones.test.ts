import { describe, expect, it } from "vitest";
import { buildMensajePago } from "../src/services/notificaciones.js";

describe("buildMensajePago", () => {
  it("mensaje SOL incluye pasos, link y microcopy de confianza", () => {
    const msg = buildMensajePago({
      destinatario_wa: "5215512345678",
      remitente_wa: "17135551234",
      montoHuman: 0.001,
      tipo_activo: "SOL",
      blinkUrl: "https://example.com/api/actions/enviar-remesa?amount=0.001",
      blinkOnboarding: null,
    });

    expect(msg).toContain("✅ *Remesa de tu familia*");
    expect(msg).toContain("*0.001 SOL*");
    expect(msg).toContain("no es spam");
    expect(msg).toContain("1️⃣ Toca el link");
    expect(msg).toContain("🔗 https://example.com");
    expect(msg).toContain("AYUDA");
    expect(msg).toContain("remesatia@gmail.com");
    expect(msg).not.toContain("Dólares digitales");
  });

  it("mensaje USDC incluye nota MXN y onboarding cuando aplica", () => {
    const msg = buildMensajePago({
      destinatario_wa: "5215512345678",
      remitente_wa: "17135551234",
      montoHuman: 300,
      tipo_activo: "USDC",
      blinkUrl: "https://example.com/api/actions/enviar-remesa-usdc",
      blinkOnboarding: "https://example.com/api/actions/onboarding-mxn",
    });

    expect(msg).toContain("*$300 USDC*");
    expect(msg).toContain("Dólares digitales");
    expect(msg).toContain("SPEI");
    expect(msg).toContain("onboarding-mxn");
  });

  it("sin blinkUrl omite pasos del link pero mantiene soporte", () => {
    const msg = buildMensajePago({
      destinatario_wa: "5215512345678",
      remitente_wa: "17135551234",
      montoHuman: 50,
      tipo_activo: "USDC",
      blinkUrl: null,
      blinkOnboarding: null,
    });

    expect(msg).not.toContain("1️⃣ Toca el link");
    expect(msg).toContain("tiendita de confianza");
  });
});
