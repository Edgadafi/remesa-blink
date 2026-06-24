import { getApiBase } from "./config";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function flattenError(data: Record<string, unknown>): string {
  const err = data.error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "fieldErrors" in err) {
    const fe = (err as { fieldErrors?: Record<string, string[]> }).fieldErrors;
    if (fe) {
      return Object.entries(fe)
        .flatMap(([k, v]) => v.map((m) => `${k}: ${m}`))
        .join("; ");
    }
  }
  return JSON.stringify(err);
}

const DEFAULT_TIMEOUT_MS = 20_000;

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  // GET/HEAD sin body: no forzar Content-Type (evita preflight CORS innecesario)
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      method: init?.method ?? "GET",
      headers,
      signal: init?.signal ?? controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiError(
        `Tiempo agotado (${DEFAULT_TIMEOUT_MS / 1000}s) al llamar ${url}. ¿El backend responde?`,
        0
      );
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && data !== null && "error" in data
        ? flattenError(data as Record<string, unknown>)
        : `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}
