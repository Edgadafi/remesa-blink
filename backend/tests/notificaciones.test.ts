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
    expect(msg).toContain("/blink?url=");
    expect(msg).toContain(encodeURIComponent("https://example.com/api/actions/enviar-remesa?amount=0.001"));
    expect(msg).toContain("AYUDA");
    expect(msg).toContain("remesatia@gmail.com");
    expect(msg).not.toContain("pesos en tu cuenta bancaria");
  });

  it("mensaje USDC con onboarding pide registro para pesos", () => {
    const msg = buildMensajePago({
      destinatario_wa: "5215512345678",
      remitente_wa: "17135551234",
      montoHuman: 300,
      tipo_activo: "USDC",
      blinkUrl: "https://example.com/api/actions/enviar-remesa-usdc",
      blinkOnboarding: "https://example.com/api/actions/onboarding-mxn",
    });

    expect(msg).toContain("*$300*");
    expect(msg).toContain("pesos");
    expect(msg).toContain("registro corto");
    expect(msg).toContain("INE + CLABE");
    expect(msg).toContain("/blink?url=");
    expect(msg).toContain(encodeURIComponent("onboarding-mxn"));
  });

  it("mensaje USDC con convertir-mxn habla de pesos en banco", () => {
    const msg = buildMensajePago({
      destinatario_wa: "5215512345678",
      remitente_wa: "17135551234",
      montoHuman: 50,
      tipo_activo: "USDC",
      blinkUrl: "https://example.com/api/actions/convertir-mxn?amount=50",
      blinkOnboarding: null,
    });

    expect(msg).toContain("pesos en tu cuenta bancaria");
    expect(msg).toContain("Los *pesos* llegan a tu banco");
    expect(msg).toContain("/blink?url=");
    expect(msg).toContain(encodeURIComponent("convertir-mxn"));
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

  it("incluye link al comprobante cuando hay txSignature", () => {
    const msg = buildMensajePago({
      destinatario_wa: "5215512345678",
      remitente_wa: "17135551234",
      montoHuman: 10,
      tipo_activo: "USDC",
      blinkUrl: null,
      blinkOnboarding: null,
      txSignature: "5HopANGJo1yjUx8o6RCdt2CCNXqYep23r4fUb2XKtQ5xFakeSig",
    });
    expect(msg).toContain("Comprobante del envío");
    expect(msg).toContain("Cualquiera puede verificar que el dinero quedó registrado.");
    expect(msg).toContain("explorer.solana.com/tx/");
    expect(msg).toContain("cluster=devnet");
  });
});
