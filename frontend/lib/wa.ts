/** Normaliza WhatsApp a solo dígitos (igual que el bot). */
export function normalizeWa(input: string): string {
  return input.replace(/\D/g, "");
}
