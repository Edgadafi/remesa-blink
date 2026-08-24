import type { Metadata } from "next";
import { BlinkInterstitial } from "@/components/BlinkInterstitial";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Confirmar remesa — Solana Blink",
  description:
    "Envía dinero a México desde EE.UU. tan fácil como mandar un mensaje — programa una vez y tu familia recibe aviso con comprobante verificable.",
};

type Props = {
  searchParams: { url?: string; action?: string };
};

function unwrapActionParam(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("solana-action:")) {
    return trimmed.slice("solana-action:".length);
  }
  return trimmed;
}

export default function BlinkPage({ searchParams }: Props) {
  const raw = searchParams.url || searchParams.action || "";
  const actionUrl = raw ? unwrapActionParam(raw) : "";

  return (
    <main className="page-narrow site-main blink-page">
      <p className="eyebrow">Solana Blink + TIA</p>
      {!actionUrl ? (
        <div className="stack-form blink-interstitial-card">
          <h1 className="h2">Falta el enlace de la acción</h1>
          <p className="muted">
            Abre el link que te llegó por WhatsApp, o pide uno nuevo escribiendo{" "}
            <em>mis envíos</em> al bot.
          </p>
        </div>
      ) : (
        <Providers>
          <BlinkInterstitial actionUrl={actionUrl} />
        </Providers>
      )}
    </main>
  );
}
