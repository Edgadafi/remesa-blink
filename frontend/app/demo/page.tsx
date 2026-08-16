import type { Metadata } from "next";
import { DemoView } from "@/components/DemoView";
import { getBlinksBase, getWaBotStartUrl } from "@/lib/config";
import { toQrDataUrl } from "@/lib/qr";
import {
  MVP_ACTION_PATH,
  blinksInspectorUrl,
  dialToBlinkUrl,
  explorerProgramUrl,
  explorerTxUrl,
  localBlinkPageUrl,
} from "@/lib/mvp-demo";
import "./demo.css";

export const metadata: Metadata = {
  title: "Demo MVP Devnet — Remesa Blink + TIA",
  description:
    "Escanea el QR, habla con TIA en WhatsApp, y prueba la Solana Action en devnet. Plan B sandbox.",
  openGraph: {
    title: "Remesa Blink — MVP Devnet",
    description:
      "Escanea el QR → WhatsApp con TIA · Solana prueba · familia cobra pesos cerca.",
  },
};

export default async function DemoMvpPage() {
  const blinkBase = getBlinksBase();
  const actionUrl = `${blinkBase}${MVP_ACTION_PATH.startsWith("/") ? "" : "/"}${MVP_ACTION_PATH}`;
  const dialUrl = dialToBlinkUrl(actionUrl);
  const inspectorUrl = blinksInspectorUrl(actionUrl);
  const localUrl = localBlinkPageUrl(actionUrl);
  const txUrl = explorerTxUrl();
  const programUrl = explorerProgramUrl();

  const waUrl = getWaBotStartUrl("hola");
  const qrDataUrl = waUrl ? await toQrDataUrl(waUrl, 280) : null;

  return (
    <DemoView
      actionUrl={actionUrl}
      dialUrl={dialUrl}
      inspectorUrl={inspectorUrl}
      localUrl={localUrl}
      txUrl={txUrl}
      programUrl={programUrl}
      waUrl={waUrl}
      qrDataUrl={qrDataUrl}
    />
  );
}
