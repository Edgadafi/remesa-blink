/**
 * Servicio Etherfuse - Off-ramp USDC → MXN (SPEI fiat)
 * https://docs.etherfuse.com
 *
 * Demo Day path: sandbox `api.sand.etherfuse.com` → pesos en CLABE.
 * No es MXNB (token Bitso). Bitso B2B: TODO post-demo — ver docs/OFFRAMP-DEMO-DAY.md
 *
 * Sandbox sourceAsset ≠ Circle USDC (4zMMC… / EPjFW…).
 * Usar el identifier de GET /ramp/assets (hoy: BXTou3… “USDC Etherfuse Devnet”).
 */
import { randomUUID } from "crypto";

const BASE_URL =
  process.env.ETHERFUSE_API_URL || "https://api.sand.etherfuse.com";
const API_KEY = process.env.ETHERFUSE_API_KEY || "";

/** Circle USDC — NO usar en quotes sandbox (NonStableAsset). */
const USDC_CIRCLE_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_CIRCLE_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

/**
 * Etherfuse sandbox Solana USDC mint (GET /ramp/assets?blockchain=solana&currency=USD&wallet=…).
 * Override: ETHERFUSE_SOURCE_ASSET
 */
const USDC_ETHERFUSE_SANDBOX =
  process.env.ETHERFUSE_SOURCE_ASSET ||
  "BXTou3CvPxpFVAJvzvEZcAnRLGCHqT1LHKsFTSQft7s";

const IS_SANDBOX =
  BASE_URL.includes("sand.etherfuse") ||
  BASE_URL.includes("sandbox") ||
  process.env.ETHERFUSE_ENV === "sandbox";

/** Mint para quotes/orders. Sandbox → Etherfuse Devnet USDC; prod → Circle mainnet. */
const USDC_MINT = IS_SANDBOX
  ? USDC_ETHERFUSE_SANDBOX
  : process.env.ETHERFUSE_SOURCE_ASSET || USDC_CIRCLE_MAINNET;

/** Partner org / bank Demo Day (sandbox). Override via env. */
export const ETHERFUSE_DEMO_CUSTOMER_ID =
  process.env.ETHERFUSE_DEMO_CUSTOMER_ID ||
  "3787b9ab-60ab-44c1-b8f8-2e19a6eed707";
export const ETHERFUSE_DEMO_BANK_ACCOUNT_ID =
  process.env.ETHERFUSE_DEMO_BANK_ACCOUNT_ID ||
  "9274aa72-7227-47ce-bbd4-49889e35edad";

/** Real inbox for Sumsub OTP — never use .test / fake TLDs (Sumsub rejects them). */
const DEFAULT_USER_EMAIL =
  process.env.ETHERFUSE_ONBOARDING_EMAIL ||
  process.env.ETHERFUSE_DEMO_EMAIL ||
  "remesatia@gmail.com";
const DEFAULT_USER_NAME =
  process.env.ETHERFUSE_DEMO_DISPLAY_NAME || "Remesa Blink";

interface QuoteResponse {
  quoteId: string;
  blockchain: string;
  sourceAmount: string;
  destinationAmount: string;
  exchangeRate: string;
  expiresAt: string;
}

interface OrderResponse {
  offramp?: {
    orderId: string;
    burnTransaction?: string;
    statusPage?: string;
  };
  onramp?: {
    orderId: string;
    depositClabe?: string;
    depositAmount?: number;
  };
}

interface OnboardingUrlResponse {
  presigned_url: string;
}

interface BankAccountItem {
  bankAccountId: string;
  customerId: string;
  status?: string;
}

interface PagedBankAccounts {
  items: BankAccountItem[];
}

export class EtherfuseUserError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "FORBIDDEN"
      | "STALE_IDS"
      | "NON_STABLE"
      | "TERMS"
      | "CONFIG"
      | "API" = "API"
  ) {
    super(message);
    this.name = "EtherfuseUserError";
  }
}

/** Traduce errores crudos de Etherfuse a mensajes cortos en español (Blink / WA). */
export function mapEtherfuseError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (err instanceof EtherfuseUserError) return err.message;
  if (raw.includes("ETHERFUSE_API_KEY")) {
    return "Off-ramp no configurado. Revisa ETHERFUSE_API_KEY (sandbox).";
  }
  if (/\b403\b/.test(raw) || /Forbidden/i.test(raw)) {
    return "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.";
  }
  if (/\b404\b/.test(raw) || /not found/i.test(raw)) {
    return "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.";
  }
  if (/NonStableAsset|Non-stable/i.test(raw)) {
    return "Activo no soportado para convertir a pesos. Contacta soporte.";
  }
  if (/Terms and conditions/i.test(raw)) {
    return "Falta aceptar términos en el registro de pesos. Abre el enlace de registro.";
  }
  if (/missing field `?userInfo`?/i.test(raw)) {
    return "Registro incompleto (falta email). Intenta de nuevo el enlace de registro.";
  }
  // Evitar dump JSON crudo en Phantom
  if (/Etherfuse API error/i.test(raw) && raw.includes("{")) {
    return "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.";
  }
  return raw.length > 180
    ? "No pudimos convertir a pesos. Intenta más tarde o responde AYUDA en WhatsApp."
    : raw;
}

async function etherfuseFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_KEY) {
    throw new EtherfuseUserError(
      "Off-ramp no configurado. Revisa ETHERFUSE_API_KEY (sandbox).",
      "CONFIG"
    );
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Etherfuse API error ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Crear quote para off-ramp USDC → MXN
 */
export async function createQuote(
  customerId: string,
  sourceAmount: string,
  sourceAsset: string = USDC_MINT
): Promise<QuoteResponse> {
  if (
    sourceAsset === USDC_CIRCLE_DEVNET ||
    sourceAsset === USDC_CIRCLE_MAINNET
  ) {
    // Circle mints → NonStableAsset en sandbox; forzar mint Etherfuse.
    sourceAsset = USDC_MINT;
  }
  const quoteId = randomUUID();
  const body = {
    quoteId,
    customerId,
    blockchain: "solana",
    quoteAssets: {
      type: "offramp",
      sourceAsset,
      targetAsset: "MXN",
    },
    sourceAmount,
  };
  try {
    const resp = await etherfuseFetch<QuoteResponse>("/ramp/quote", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return { ...resp, quoteId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/NonStableAsset|Non-stable/i.test(msg)) {
      throw new EtherfuseUserError(
        "Activo no soportado para convertir a pesos. Contacta soporte.",
        "NON_STABLE"
      );
    }
    if (/\b403\b|\b404\b|Forbidden/i.test(msg)) {
      throw new EtherfuseUserError(
        "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.",
        "FORBIDDEN"
      );
    }
    throw err;
  }
}

/**
 * Crear order off-ramp. Devuelve burnTransaction para que el usuario firme.
 */
export async function createOrder(
  quoteId: string,
  bankAccountId: string,
  publicKey: string
): Promise<{ orderId: string; burnTransaction: string; statusPage?: string }> {
  const orderId = randomUUID();
  const body = {
    orderId,
    bankAccountId,
    publicKey,
    quoteId,
  };
  try {
    const resp = await etherfuseFetch<OrderResponse>("/ramp/order", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!resp.offramp) {
      throw new EtherfuseUserError(
        "No pudimos convertir a pesos. Intenta más tarde.",
        "API"
      );
    }
    if (!resp.offramp.burnTransaction) {
      throw new EtherfuseUserError(
        "No pudimos preparar la transacción. Completa el registro de pesos e intenta de nuevo.",
        "API"
      );
    }
    return {
      orderId: resp.offramp.orderId,
      burnTransaction: resp.offramp.burnTransaction,
      statusPage: resp.offramp.statusPage,
    };
  } catch (err) {
    if (err instanceof EtherfuseUserError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    if (/Terms and conditions/i.test(msg)) {
      throw new EtherfuseUserError(
        "Falta aceptar términos en el registro de pesos. Abre el enlace de registro.",
        "TERMS"
      );
    }
    if (/\b403\b|\b404\b|Forbidden|Bank account not found/i.test(msg)) {
      throw new EtherfuseUserError(
        "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.",
        "FORBIDDEN"
      );
    }
    throw err;
  }
}

export interface OnboardingUserInfo {
  email: string;
  displayName: string;
}

/**
 * Generar URL de onboarding (KYC + CLABE).
 * Sandbox exige userInfo (email + displayName).
 */
export async function createOnboardingUrl(
  customerId: string,
  bankAccountId: string,
  publicKey: string,
  userInfo?: OnboardingUserInfo
): Promise<string> {
  const body = {
    customerId,
    bankAccountId,
    publicKey,
    blockchain: "solana",
    userInfo: {
      email: userInfo?.email || DEFAULT_USER_EMAIL,
      displayName: userInfo?.displayName || DEFAULT_USER_NAME,
    },
  };
  const resp = await etherfuseFetch<OnboardingUrlResponse>("/ramp/onboarding-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return resp.presigned_url;
}

/**
 * Obtener bank accounts de un customer (para recuperar de 409)
 */
export async function getCustomerBankAccounts(
  customerId: string
): Promise<{ bankAccountId: string; status?: string }[]> {
  const resp = await etherfuseFetch<PagedBankAccounts>(
    `/ramp/customer/${customerId}/bank-accounts`
  );
  return (resp.items || []).map((item) => ({
    bankAccountId: item.bankAccountId,
    status: item.status,
  }));
}

/**
 * Valida que customer/bank existan en Etherfuse antes de quote/order.
 * IDs inventados (demo-mark-kyc-verified) → 403/404.
 */
export async function assertEtherfuseIdsUsable(
  customerId: string,
  bankAccountId: string
): Promise<void> {
  let banks: { bankAccountId: string; status?: string }[];
  try {
    banks = await getCustomerBankAccounts(customerId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/\b403\b|\b404\b|Forbidden/i.test(msg)) {
      throw new EtherfuseUserError(
        "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.",
        "STALE_IDS"
      );
    }
    throw err;
  }
  const match = banks.find((b) => b.bankAccountId === bankAccountId);
  if (!match) {
    throw new EtherfuseUserError(
      "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.",
      "STALE_IDS"
    );
  }
}

/** Extrae org/customer_id del error 409 "see org: <uuid>" */
export function parseOrgFrom409Error(err: unknown): string | null {
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/see org:\s*([a-f0-9-]{36})/i);
  return match ? match[1] : null;
}

export {
  USDC_MINT as ETHERFUSE_USDC_MINT,
  USDC_ETHERFUSE_SANDBOX,
  USDC_CIRCLE_DEVNET,
  USDC_CIRCLE_MAINNET,
  IS_SANDBOX as ETHERFUSE_IS_SANDBOX,
};
