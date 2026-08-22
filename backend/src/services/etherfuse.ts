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

/**
 * Demo Day: si el customer personal no tiene bank en Etherfuse, usar partner org bank.
 * Activo con ETHERFUSE_DEMO_USE_ORG_BANK=1 o siempre en sandbox.
 * Ver docs/OFFRAMP-DEMO-DAY.md
 */
export function shouldUseEtherfuseOrgBankFallback(): boolean {
  return (
    process.env.ETHERFUSE_DEMO_USE_ORG_BANK === "1" ||
    process.env.ETHERFUSE_DEMO_USE_ORG_BANK === "true" ||
    IS_SANDBOX
  );
}

/** Real inbox for Sumsub OTP — never use .test / fake TLDs (Sumsub rejects them). */
const DEFAULT_USER_EMAIL =
  process.env.ETHERFUSE_ONBOARDING_EMAIL ||
  process.env.ETHERFUSE_DEMO_EMAIL ||
  "remesatia@gmail.com";
const DEFAULT_USER_NAME =
  process.env.ETHERFUSE_DEMO_DISPLAY_NAME || "Remesa Blink";

/** Reject fake TLDs / placeholders that lock Sumsub to a read-only bad email. */
export function assertOnboardingEmail(email: string): string {
  const e = email.trim().toLowerCase();
  if (
    !e ||
    !e.includes("@") ||
    e.endsWith(".test") ||
    e.endsWith(".invalid") ||
    e.endsWith(".localhost") ||
    e.includes("@example.") ||
    /@(remesatia\.test)$/i.test(e)
  ) {
    throw new EtherfuseUserError(
      "Email de registro inválido para KYC. Usa un correo real (ej. remesatia@gmail.com).",
      "CONFIG"
    );
  }
  return e;
}

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
    burnTransaction?: string | null;
    statusPage?: string | null;
    transactions?: unknown;
    burn?: unknown;
  };
  onramp?: {
    orderId: string;
    depositClabe?: string;
    depositAmount?: number;
  };
  /** Algunos clientes reciben campos en raíz (raro en create; común en GET). */
  orderId?: string;
  burnTransaction?: string | null;
  statusPage?: string | null;
}

/** Order GET — shape completo (statusPage requerido en docs). */
interface OrderGetResponse {
  orderId: string;
  status?: string;
  burnTransaction?: string | null;
  statusPage?: string;
  orderType?: string;
}

export type CreateOrderResult = {
  orderId: string;
  /** Ausente si Etherfuse aún no construyó el burn (p. ej. balance BXTou3 = 0). */
  burnTransaction?: string;
  statusPage: string;
};

/** Status page sandbox/prod cuando create no la incluye. */
export function etherfuseStatusPageUrl(orderId: string): string {
  if (IS_SANDBOX) {
    return `https://sandbox.etherfuse.com/ramp/order/${orderId}`;
  }
  return `https://pay.etherfuse.com/order/${orderId}`;
}

function extractBurnAndStatus(
  createResp: OrderResponse,
  getResp?: OrderGetResponse | null
): { orderId: string; burnTransaction?: string; statusPage: string } {
  const orderId =
    getResp?.orderId ||
    createResp.offramp?.orderId ||
    createResp.orderId ||
    "";
  const burnRaw =
    getResp?.burnTransaction ||
    createResp.offramp?.burnTransaction ||
    createResp.burnTransaction ||
    null;
  const burnTransaction =
    typeof burnRaw === "string" && burnRaw.length > 0 ? burnRaw : undefined;
  const statusPage =
    (typeof getResp?.statusPage === "string" && getResp.statusPage) ||
    (typeof createResp.offramp?.statusPage === "string" &&
      createResp.offramp.statusPage) ||
    (typeof createResp.statusPage === "string" && createResp.statusPage) ||
    etherfuseStatusPageUrl(orderId);
  return { orderId, burnTransaction, statusPage };
}

/** Log seguro: claves + longitudes, sin secretos ni tx completa. */
function logOrderShape(label: string, body: Record<string, unknown>): void {
  const offramp = body.offramp;
  const offrampKeys =
    offramp && typeof offramp === "object"
      ? Object.keys(offramp as object)
      : [];
  const burn =
    (offramp as { burnTransaction?: string } | undefined)?.burnTransaction ??
    (body.burnTransaction as string | undefined);
  console.warn(`[etherfuse] ${label}`, {
    topKeys: Object.keys(body),
    offrampKeys,
    burnLen: typeof burn === "string" ? burn.length : 0,
    hasStatusPage: Boolean(
      (offramp as { statusPage?: string } | undefined)?.statusPage ||
        body.statusPage
    ),
    status: body.status,
  });
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
      | "NO_BURN"
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
 * Estimado MXN al retirar (Etherfuse sandbox/prod). Null si API no disponible.
 */
export async function estimateOfframpMxn(
  usdcAmount: number
): Promise<{ destinationMxn: number; exchangeRate: number } | null> {
  if (!API_KEY || !Number.isFinite(usdcAmount) || usdcAmount <= 0) {
    return null;
  }
  try {
    const quote = await createQuote(
      ETHERFUSE_DEMO_CUSTOMER_ID,
      usdcAmount.toFixed(2)
    );
    const destinationMxn = parseFloat(quote.destinationAmount);
    const exchangeRate = parseFloat(quote.exchangeRate);
    if (!Number.isFinite(destinationMxn) || destinationMxn <= 0) {
      return null;
    }
    return {
      destinationMxn,
      exchangeRate: Number.isFinite(exchangeRate) ? exchangeRate : 0,
    };
  } catch (err) {
    console.warn(
      "[etherfuse] quote estimate:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
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
 * GET order completo (create sandbox a menudo solo devuelve offramp.orderId).
 */
export async function getOrder(orderId: string): Promise<OrderGetResponse> {
  return etherfuseFetch<OrderGetResponse>(`/ramp/order/${orderId}`);
}

/**
 * Crear order off-ramp.
 * Sandbox create suele omitir burn/statusPage → enriquecemos con GET.
 * burnTransaction puede faltar si no hay fondos del mint sandbox (BXTou3).
 */
export async function createOrder(
  quoteId: string,
  bankAccountId: string,
  publicKey: string
): Promise<CreateOrderResult> {
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
    logOrderShape("order create", resp as unknown as Record<string, unknown>);

    if (!resp.offramp?.orderId && !resp.orderId) {
      throw new EtherfuseUserError(
        "No pudimos convertir a pesos. Intenta más tarde.",
        "API"
      );
    }

    const createdId = resp.offramp?.orderId || resp.orderId || orderId;
    let getResp: OrderGetResponse | null = null;
    try {
      getResp = await getOrder(createdId);
      logOrderShape("order get", getResp as unknown as Record<string, unknown>);
    } catch (getErr) {
      console.warn(
        "[etherfuse] order GET enrich failed",
        getErr instanceof Error ? getErr.message : getErr
      );
    }

    const extracted = extractBurnAndStatus(resp, getResp);
    return {
      orderId: extracted.orderId || createdId,
      burnTransaction: extracted.burnTransaction,
      statusPage: extracted.statusPage,
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
    if (/Proxy account not found/i.test(msg)) {
      throw new EtherfuseUserError(
        "Cuenta bancaria no lista en Etherfuse. Completa CLABE en el registro o reintenta.",
        "FORBIDDEN"
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
  const email = assertOnboardingEmail(userInfo?.email || DEFAULT_USER_EMAIL);
  const body = {
    customerId,
    bankAccountId,
    publicKey,
    blockchain: "solana",
    userInfo: {
      email,
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
 * Resuelve customer/bank usables para quote/order.
 * Si el personal tiene 0 banks (o IDs stale) y hay fallback Demo Day → partner org bank.
 */
export async function resolveOfframpIds(
  customerId: string,
  bankAccountId: string
): Promise<{
  customerId: string;
  bankAccountId: string;
  usedOrgFallback: boolean;
}> {
  const fallback = () => {
    console.warn(
      "[etherfuse] Demo Day fallback → partner org bank",
      ETHERFUSE_DEMO_CUSTOMER_ID,
      ETHERFUSE_DEMO_BANK_ACCOUNT_ID
    );
    return {
      customerId: ETHERFUSE_DEMO_CUSTOMER_ID,
      bankAccountId: ETHERFUSE_DEMO_BANK_ACCOUNT_ID,
      usedOrgFallback: true,
    };
  };

  let banks: { bankAccountId: string; status?: string }[];
  try {
    banks = await getCustomerBankAccounts(customerId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/\b403\b|\b404\b|Forbidden/i.test(msg)) {
      if (shouldUseEtherfuseOrgBankFallback()) return fallback();
      throw new EtherfuseUserError(
        "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.",
        "STALE_IDS"
      );
    }
    throw err;
  }

  const match = banks.find((b) => b.bankAccountId === bankAccountId);
  if (match) {
    return { customerId, bankAccountId, usedOrgFallback: false };
  }
  if (banks.length > 0) {
    console.warn(
      "[etherfuse] DB bank missing in Etherfuse list; using first bank",
      banks[0].bankAccountId
    );
    return {
      customerId,
      bankAccountId: banks[0].bankAccountId,
      usedOrgFallback: false,
    };
  }
  // 0 banks (caso g33…: kyc=verified en DB, Etherfuse vacío)
  if (shouldUseEtherfuseOrgBankFallback()) return fallback();
  throw new EtherfuseUserError(
    "No pudimos convertir a pesos. Revisa cuenta SPEI / KYC.",
    "STALE_IDS"
  );
}

/**
 * Valida que customer/bank existan en Etherfuse antes de quote/order.
 * En sandbox / ETHERFUSE_DEMO_USE_ORG_BANK=1 permite partner fallback (no lanza).
 */
export async function assertEtherfuseIdsUsable(
  customerId: string,
  bankAccountId: string
): Promise<void> {
  await resolveOfframpIds(customerId, bankAccountId);
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
