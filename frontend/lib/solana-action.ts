import { getPublicSiteUrl } from "@/lib/config";

/** Devnet genesis hash — Dialect / wallets. */
export const SOLANA_DEVNET_CHAIN_ID =
  "solana:EtWTRABZaYq6iMfeYDoJT9CqA8CaosAqCseQwdgH5Ns";

export const ACTIONS_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Action-Version, X-Blockchain-Ids",
  "Access-Control-Expose-Headers": "X-Action-Version, X-Blockchain-Ids",
  "Access-Control-Max-Age": "86400",
  "X-Action-Version": "2.4",
  "X-Blockchain-Ids": SOLANA_DEVNET_CHAIN_ID,
  "Content-Type": "application/json",
};

export function blinkIconUrl(site = getPublicSiteUrl()): string {
  return `${site}/brand/holatia-mark.svg`;
}

export function enviarRemesaUsdcGetResponse(site = getPublicSiteUrl()) {
  const href = `${site}/api/actions/enviar-remesa-usdc`;
  return {
    type: "action" as const,
    title: "Enviar dólares, recibir pesos",
    icon: blinkIconUrl(site),
    description:
      "Send dollars, recibe pesos sin salir de WhatsApp. Comprobante en Solana devnet — confirma en Phantom.",
    label: "Ver comprobante",
    links: {
      actions: [
        {
          label: "Confirmar envío (devnet)",
          href,
          parameters: [
            { name: "account", label: "Tu cuenta (wallet)", required: true, type: "text" },
            { name: "amount", label: "Monto (USDC)", required: true, type: "number" },
            { name: "destination", label: "Cuenta destino", required: true, type: "text" },
          ],
        },
      ],
    },
  };
}

export function actionsJson(site = getPublicSiteUrl()) {
  return {
    rules: [
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
    actions: [
      {
        url: `${site}/api/actions/enviar-remesa-usdc`,
        label: "Enviar dólares, recibir pesos",
        description: "Send dollars, recibe pesos sin salir de WhatsApp.",
      },
    ],
  };
}

/** Upstream for POST (tx). May be local/tunnel; GET never uses this. */
export function getBlinksUpstream(): string | null {
  const u =
    process.env.BLINKS_UPSTREAM_URL?.trim() ||
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!u) return null;
  return u.replace(/\/$/, "");
}
