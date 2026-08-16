/** Constantes MVP Demo Day / M5 — criterio 2 (Blink URL + escena app) */

export const MVP_PROGRAM_ID =
  "B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2";

/** Tx de referencia E2E SOL 2026-08-13 (actualizar tras nuevo e2e) */
export const MVP_EXPLORER_TX =
  process.env.NEXT_PUBLIC_MVP_EXPLORER_TX?.trim() ||
  "3wgXLQaibVWuAX2cB6qEc52FJjwtfifdFKq2w6bfD5Lj3YjYnRQPcqDwFNJhZcMNz1ZE4uNNoRMZQQxtKrAbf9zM";

export const MVP_CLUSTER = "devnet";

/** Path Action canónica para el MVP link (WayLearn / Solana) */
export const MVP_ACTION_PATH =
  process.env.NEXT_PUBLIC_MVP_ACTION_PATH?.trim() ||
  "/api/actions/enviar-remesa-usdc";

export function explorerTxUrl(signature = MVP_EXPLORER_TX): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${MVP_CLUSTER}`;
}

export function explorerProgramUrl(programId = MVP_PROGRAM_ID): string {
  return `https://explorer.solana.com/address/${programId}?cluster=${MVP_CLUSTER}`;
}

export function dialToBlinkUrl(actionHttpsUrl: string): string {
  return `https://dial.to/?action=${encodeURIComponent(
    `solana-action:${actionHttpsUrl}`
  )}`;
}

export function blinksInspectorUrl(actionHttpsUrl: string): string {
  return `https://www.blinks.xyz/inspector?url=${encodeURIComponent(actionHttpsUrl)}`;
}

export function localBlinkPageUrl(actionHttpsUrl: string): string {
  return `/blink?url=${encodeURIComponent(actionHttpsUrl)}`;
}
