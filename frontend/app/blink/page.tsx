import type { Metadata } from "next";
import { BlinkInterstitial } from "@/components/BlinkInterstitial";

export const metadata: Metadata = {
  title: "Confirmar remesa — Remesa Blink",
  description: "Confirma el envío a tu familia. Abre con Phantom en devnet.",
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
    <main className="page-narrow">
      <p className="eyebrow">Remesa Blink + TIA</p>
      {!actionUrl ? (
        <div className="stack-form">
          <h1 className="h2">Falta el enlace de la acción</h1>
          <p className="muted">
            Abre el link que te llegó por WhatsApp, o pide uno nuevo escribiendo{" "}
            <em>mis envíos</em> al bot.
          </p>
        </div>
      ) : (
        <BlinkInterstitial actionUrl={actionUrl} />
      )}
    </main>
  );
}
