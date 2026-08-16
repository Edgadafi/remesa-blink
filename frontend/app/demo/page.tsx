import type { Metadata } from "next";
import Link from "next/link";
import { getBlinksBase, getWaBotStartUrl } from "@/lib/config";
import { WhatsAppStartQr } from "@/components/WhatsAppStartQr";
import { toQrDataUrl } from "@/lib/qr";
import {
  MVP_CLUSTER,
  MVP_PROGRAM_ID,
  blinksInspectorUrl,
  dialToBlinkUrl,
  explorerProgramUrl,
  explorerTxUrl,
  localBlinkPageUrl,
  MVP_ACTION_PATH,
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
    <div className="demo-root">
      <section className="demo-hero" aria-labelledby="demo-brand">
        <div className="demo-hero-bg" aria-hidden />
        <div className="demo-hero-inner demo-hero-inner--qr">
          <p className="demo-brand" id="demo-brand">
            Remesa Blink <span className="demo-brand-tia">+ TIA</span>
          </p>
          <h1 className="demo-headline">
            Escanea y habla con TIA
          </h1>
          <p className="demo-lede">
            El chat abre con <strong>hola</strong>. Luego escribes{" "}
            <strong>enviar</strong>. Solana deja el comprobante en{" "}
            <strong>devnet</strong>.
          </p>

          {waUrl && qrDataUrl ? (
            <WhatsAppStartQr waUrl={waUrl} qrDataUrl={qrDataUrl} variant="hero" />
          ) : (
            <p className="demo-cta-hint">
              Configura NEXT_PUBLIC_WA_SUPPORT (número del bot) para mostrar el QR.
            </p>
          )}

          <div className="demo-cta-row demo-cta-row--secondary">
            <a
              className="demo-cta-secondary"
              href={dialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir Blink (Devnet)
            </a>
            <a className="demo-cta-secondary" href={localUrl}>
              Blink aquí
            </a>
          </div>
          <p className="demo-cta-hint">
            Criterio 2 M5 = Blink URL · inicio humano = QR → WhatsApp
          </p>
        </div>
      </section>

      <section className="demo-stage" aria-label="Evidencia Devnet">
        <h2 className="demo-stage-title">MVP en Solana Devnet</h2>
        <p className="demo-stage-copy">
          Flujo vivo: <strong>QR → WhatsApp → orden → Explorer → Blink</strong>.
          El link oficial del milestone es la Solana Action; el QR es cómo entra la familia.
        </p>

        <ul className="demo-meta" aria-label="Metadatos técnicos">
          <li>
            <span className="demo-meta-k">Cluster</span>
            <span className="demo-meta-v">{MVP_CLUSTER}</span>
          </li>
          <li>
            <span className="demo-meta-k">Program</span>
            <a className="demo-meta-v mono" href={programUrl} target="_blank" rel="noopener noreferrer">
              {MVP_PROGRAM_ID.slice(0, 8)}…{MVP_PROGRAM_ID.slice(-4)}
            </a>
          </li>
          <li>
            <span className="demo-meta-k">Action</span>
            <span className="demo-meta-v mono truncate" title={actionUrl}>
              {MVP_ACTION_PATH}
            </span>
          </li>
        </ul>

        <div className="demo-links">
          <a href={inspectorUrl} target="_blank" rel="noopener noreferrer">
            Inspector Dialect
          </a>
          <a href={txUrl} target="_blank" rel="noopener noreferrer">
            Explorer — tx de referencia
          </a>
          <a href={actionUrl} target="_blank" rel="noopener noreferrer">
            Action JSON (GET)
          </a>
        </div>

        <aside className="demo-planb" aria-label="Plan B offramp">
          <strong>Plan B (honestidad)</strong>
          <p>
            Off-ramp Etherfuse = <em>sandbox</em>. Si ves Unfunded / Processing:{" "}
            “pesos en camino / orden lista”. Nunca SPEI mainnet en el pitch.
          </p>
        </aside>

        <div className="demo-footer-cta">
          <Link href="/piloto" className="demo-piloto-link">
            Quiero ser familia piloto
          </Link>
          <Link href="/nueva-remesa" className="demo-backup-link">
            Backup sin WhatsApp
          </Link>
        </div>
      </section>
    </div>
  );
}
