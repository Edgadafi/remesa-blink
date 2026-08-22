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

function remesaSolGetResponse(site: string, hrefPath: string) {
  const href = `${site}${hrefPath}`;
  return {
    type: "action" as const,
    title: "Remesa Blink",
    icon: blinkIconUrl(site),
    description: "Transferir SOL a una wallet de destino",
    label: "Enviar Remesa SOL",
    links: {
      actions: [
        {
          label: "Enviar",
          href,
          parameters: [
            { name: "account", label: "Tu wallet", required: true, type: "text" },
            { name: "amount", label: "Monto (SOL)", required: true, type: "number" },
            { name: "destination", label: "Wallet destino", required: true, type: "text" },
          ],
        },
      ],
    },
  };
}

export function onboardingMxnGetResponse(site = getPublicSiteUrl()) {
  const href = `${site}/api/actions/onboarding-mxn`;
  return {
    type: "action" as const,
    title: "Registrar cuenta para pesos",
    icon: blinkIconUrl(site),
    description:
      "Completa tu registro (INE + CLABE) una sola vez para recibir pesos en tu banco",
    label: "Obtener enlace de registro",
    links: {
      actions: [
        {
          label: "Obtener enlace",
          href,
          parameters: [
            { name: "account", label: "Tu cuenta (wallet)", required: true, type: "text" },
          ],
        },
      ],
    },
  };
}

export function convertirMxnGetResponse(
  site = getPublicSiteUrl(),
  amount?: string | null
) {
  const amountQ = amount?.trim() || "";
  const href = amountQ
    ? `${site}/api/actions/convertir-mxn?amount=${encodeURIComponent(amountQ)}`
    : `${site}/api/actions/convertir-mxn`;
  return {
    type: "action" as const,
    title: "Recibir pesos en tu cuenta",
    icon: blinkIconUrl(site),
    description: "Pasa tu remesa a pesos mexicanos. Llegan a tu banco en unos minutos.",
    label: "Recibir pesos",
    links: {
      actions: [
        {
          label: amountQ ? `Recibir pesos ($${amountQ})` : "Recibir pesos",
          href,
          parameters: [
            {
              name: "account",
              label: "Tu cuenta (con el dinero de la remesa)",
              required: true,
              type: "text",
            },
            ...(amountQ
              ? []
              : [{ name: "amount", label: "Monto", required: true, type: "number" as const }]),
          ],
        },
      ],
    },
  };
}

/** GET metadata servido en holatia.app (unfurl). POST va al upstream (keeper/Etherfuse). */
export function getActionGetResponse(
  action: string,
  site = getPublicSiteUrl(),
  opts?: { amount?: string | null }
): Record<string, unknown> | null {
  switch (action) {
    case "enviar-remesa-usdc":
      return enviarRemesaUsdcGetResponse(site);
    case "onboarding-mxn":
      return onboardingMxnGetResponse(site);
    case "convertir-mxn":
      return convertirMxnGetResponse(site, opts?.amount);
    case "enviar-remesa":
      return remesaSolGetResponse(site, "/api/actions/enviar-remesa");
    case "remesa":
      return remesaSolGetResponse(site, "/api/actions/remesa");
    default:
      return null;
  }
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
      {
        url: `${site}/api/actions/convertir-mxn`,
        label: "Recibir pesos en tu cuenta",
        description: "Pasar remesa a pesos mexicanos (SPEI / Etherfuse sandbox).",
      },
      {
        url: `${site}/api/actions/onboarding-mxn`,
        label: "Registrar cuenta para pesos",
        description: "INE + CLABE una sola vez para recibir pesos en tu banco.",
      },
      {
        url: `${site}/api/actions/enviar-remesa`,
        label: "Enviar Remesa SOL",
        description: "Transferir SOL a una wallet de destino.",
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
