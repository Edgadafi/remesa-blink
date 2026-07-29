/**
 * Sesión conversacional en memoria (MVP Demo Day / piloto).
 */

export type FlowStep =
  | "idle"
  | "enviar_monto"
  | "enviar_frecuencia"
  | "enviar_nombre"
  | "enviar_familia"
  | "enviar_wallet";

export type EnviarDraft = {
  monto?: number;
  tipo_activo: "SOL" | "USDC";
  frecuencia?: "diario" | "semanal" | "mensual";
  nombre_contacto?: string;
  destinatario_wa?: string;
  wallet?: string;
  /** Intentos fallidos en paso wallet (anti-loop). */
  walletFails?: number;
};

type Session = {
  step: FlowStep;
  draft: EnviarDraft;
  updatedAt: number;
};

const sessions = new Map<string, Session>();
const TTL_MS = 30 * 60 * 1000;

function touch(wa: string, session: Session): Session {
  session.updatedAt = Date.now();
  sessions.set(wa, session);
  return session;
}

export function getSession(wa: string): Session {
  const existing = sessions.get(wa);
  if (existing && Date.now() - existing.updatedAt < TTL_MS) {
    return existing;
  }
  const fresh: Session = {
    step: "idle",
    draft: { tipo_activo: "USDC" },
    updatedAt: Date.now(),
  };
  sessions.set(wa, fresh);
  return fresh;
}

/** Primer paso faltante según borrador (one-shot puede saltar pasos). */
export function nextEnviarStep(draft: EnviarDraft): FlowStep {
  if (draft.monto == null) return "enviar_monto";
  if (!draft.frecuencia) return "enviar_frecuencia";
  if (!draft.nombre_contacto?.trim()) return "enviar_nombre";
  if (!draft.destinatario_wa) return "enviar_familia";
  if (!draft.wallet) return "enviar_wallet";
  return "enviar_familia";
}

export function startEnviar(
  wa: string,
  tipoOrDraft: "SOL" | "USDC" | Partial<EnviarDraft> = "USDC"
): Session {
  const partial: Partial<EnviarDraft> =
    typeof tipoOrDraft === "string" ? { tipo_activo: tipoOrDraft } : tipoOrDraft;
  const draft: EnviarDraft = {
    ...partial,
    tipo_activo: partial.tipo_activo ?? "USDC",
  };
  return touch(wa, {
    step: nextEnviarStep(draft),
    draft,
    updatedAt: Date.now(),
  });
}

export function clearSession(wa: string): void {
  sessions.delete(wa);
}

export function setStep(wa: string, step: FlowStep, draft?: Partial<EnviarDraft>): Session {
  const s = getSession(wa);
  s.step = step;
  if (draft) s.draft = { ...s.draft, ...draft };
  return touch(wa, s);
}
