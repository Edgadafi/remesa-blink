import type { Metadata } from "next";
import Link from "next/link";
import { getWaBotStartUrl } from "@/lib/config";
import { WhatsAppStartQr } from "@/components/WhatsAppStartQr";
import { toQrDataUrl } from "@/lib/qr";
import "../demo/demo.css";

export const metadata: Metadata = {
  title: "Empezar con TIA — Remesa Blink",
  description:
    "Escanea el código QR para abrir WhatsApp con Remesa Blink + TIA e iniciar tu remesa.",
};

/**
 * Página mínima para proyectar / imprimir el QR en Demo Day o abordaje piloto.
 */
export default async function EmpezarPage() {
  const waUrl = getWaBotStartUrl("hola");
  if (!waUrl) {
    return (
      <main className="demo-root" style={{ padding: "3rem 1.5rem" }}>
        <h1 className="demo-stage-title">Falta el número del bot</h1>
        <p className="demo-stage-copy">
          Define <code>NEXT_PUBLIC_WA_SUPPORT</code> con el WhatsApp de Baileys.
        </p>
        <Link href="/nueva-remesa">Usar formulario web</Link>
      </main>
    );
  }

  const qrDataUrl = await toQrDataUrl(waUrl, 320);

  return (
    <div className="demo-root">
      <section
        className="demo-hero"
        style={{ minHeight: "100svh", alignItems: "center", justifyContent: "center" }}
        aria-labelledby="empezar-title"
      >
        <div className="demo-hero-bg" aria-hidden />
        <div className="demo-hero-inner demo-hero-inner--qr" style={{ textAlign: "center" }}>
          <p className="demo-brand" id="empezar-title">
            Remesa Blink <span className="demo-brand-tia">+ TIA</span>
          </p>
          <h1 className="demo-headline" style={{ maxWidth: "none", marginInline: "auto" }}>
            Escanea para empezar
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <WhatsAppStartQr
              waUrl={waUrl}
              qrDataUrl={qrDataUrl}
              caption="Cámara del teléfono → WhatsApp → envía hola"
              variant="hero"
            />
          </div>
          <p className="demo-cta-hint" style={{ marginTop: "1.5rem" }}>
            <Link href="/demo" style={{ color: "inherit" }}>
              Ver demo completa Devnet
            </Link>
            {" · "}
            <Link href="/piloto" style={{ color: "inherit" }}>
              Registro piloto
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
