/**
 * Sesión conversacional en memoria (MVP Demo Day / piloto).
 */

export type FlowStep =
  | "idle"
  | "enviar_monto"
  | "enviar_frecuencia"
  | "enviar_familia"
  | "enviar_wallet";

export type EnviarDraft = {
  monto?: number;
  tipo_activo: "SOL" | "USDC";
  frecuencia?: "diario" | "semanal" | "mensual";
  destinatario_wa?: string;
  wallet?: string;
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

export function startEnviar(wa: string, tipo: "SOL" | "USDC" = "USDC"): Session {
  return touch(wa, {
    step: "enviar_monto",
    draft: { tipo_activo: tipo },
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
