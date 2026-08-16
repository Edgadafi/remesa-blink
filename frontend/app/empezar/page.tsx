import type { Metadata } from "next";
import { EmpezarView } from "@/components/EmpezarView";
import { getWaBotStartUrl } from "@/lib/config";
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
    return <EmpezarView missing />;
  }

  const qrDataUrl = await toQrDataUrl(waUrl, 320);

  return <EmpezarView waUrl={waUrl} qrDataUrl={qrDataUrl} />;
}
