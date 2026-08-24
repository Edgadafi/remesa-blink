import type { Metadata } from "next";
import { EmpezarView } from "@/components/EmpezarView";
import { getCanonicalActionUrl, getWaBotStartUrl } from "@/lib/config";
import { toQrDataUrl } from "@/lib/qr";
import {
  MVP_ACTION_PATH,
  blinksInspectorUrl,
  localBlinkPageUrl,
} from "@/lib/mvp-demo";
export const metadata: Metadata = {
  title: "Empezar con TIA — Solana Blink",
  description:
    "Escanea el código QR para abrir WhatsApp con Solana Blink + TIA e iniciar tu remesa.",
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
  const actionUrl = getCanonicalActionUrl(MVP_ACTION_PATH);

  return (
    <EmpezarView
      waUrl={waUrl}
      qrDataUrl={qrDataUrl}
      actionUrl={actionUrl}
      localUrl={localBlinkPageUrl(actionUrl)}
      inspectorUrl={blinksInspectorUrl(actionUrl)}
    />
  );
}
