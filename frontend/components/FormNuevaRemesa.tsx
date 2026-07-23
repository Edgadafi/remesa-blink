"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { normalizeWa } from "@/lib/wa";
import { useConnectedAddress } from "@/components/WalletConnect";

const freqLabel: Record<"diario" | "semanal" | "mensual", string> = {
  diario: "cada día",
  semanal: "cada semana",
  mensual: "cada mes",
};

export function FormNuevaRemesa() {
  const [remitenteWa, setRemitenteWa] = useState("");
  const [destinatarioWa, setDestinatarioWa] = useState("");
  const [walletSolana, setWalletSolana] = useState("");
  const [monto, setMonto] = useState("");
  const [tipoActivo, setTipoActivo] = useState<"SOL" | "USDC">("USDC");
  const [frecuencia, setFrecuencia] = useState<"diario" | "semanal" | "mensual">("mensual");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    human: string;
    tx?: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const connectedAddress = useConnectedAddress();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    const rWa = normalizeWa(remitenteWa);
    const dWa = normalizeWa(destinatarioWa);
    const m = parseFloat(monto);
    if (!rWa || !dWa || !walletSolana.trim()) {
      setErr("Necesitamos tu WhatsApp, el de tu familia y la dirección de destino.");
      return;
    }
    if (isNaN(m) || m <= 0) {
      setErr("Revisa el monto — debe ser mayor a cero.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<{
        tx_signature?: string;
        id?: string;
        frecuencia?: string;
        tipo_activo?: string;
      }>("/api/suscripciones", {
        method: "POST",
        body: JSON.stringify({
          remitente_wa: rWa,
          destinatario_wa: dWa,
          destinatario_solana: walletSolana.trim(),
          tipo_activo: tipoActivo,
          monto: m,
          frecuencia,
          ...(connectedAddress ? { usuario_remitente_solana: connectedAddress } : {}),
        }),
      });
      setResult({
        human: `Listo. ${freqLabel[frecuencia].charAt(0).toUpperCase()}${freqLabel[frecuencia].slice(1)} enviarán ${m} ${tipoActivo} y tu familia recibirá aviso al WhatsApp ${dWa}.`,
        tx: data.tx_signature,
      });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="form-card" role="status">
        <p className="msg-ok-title">Listo. Tu envío quedó programado</p>
        <p className="msg-ok" style={{ whiteSpace: "normal", border: "none", background: "transparent", padding: 0 }}>
          {result.human}
        </p>
        {result.tx && (
          <p className="msg-ok-detail">
            Referencia técnica (opcional): <code>{result.tx}</code>
          </p>
        )}
        <div className="hub-cta-row" style={{ marginTop: "1.25rem" }}>
          <Link href="/mis-remesas" className="btn-primary">
            Ver mis envíos
          </Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setResult(null);
              setMonto("");
            }}
          >
            Programar otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="stack-form form-card" onSubmit={onSubmit}>
      <div className="form-progress" aria-hidden>
        <span className="form-progress-step is-active">1 · Familia</span>
        <span className="form-progress-step is-active">2 · Monto</span>
        <span className="form-progress-step">3 · Confirmar</span>
      </div>

      <div>
        <h2 className="form-section-title">¿A quién le mandas?</h2>
        <p className="form-section-note">Usamos WhatsApp para avisarte a ti y a tu familia.</p>
      </div>

      <label className="field">
        <span>Tu WhatsApp</span>
        <input
          value={remitenteWa}
          onChange={(e) => setRemitenteWa(e.target.value)}
          placeholder="5215512345678"
          inputMode="numeric"
          autoComplete="tel"
        />
      </label>
      <label className="field">
        <span>WhatsApp de tu familia</span>
        <input
          value={destinatarioWa}
          onChange={(e) => setDestinatarioWa(e.target.value)}
          placeholder="5215598765432"
          inputMode="numeric"
          autoComplete="tel"
        />
      </label>

      <div>
        <h2 className="form-section-title">¿Cuánto y cada cuándo?</h2>
        <p className="form-section-note">Elige el monto y la frecuencia — como una ayuda fija a casa.</p>
      </div>

      <div className="row-inline">
        <label className="field grow">
          <span>Monto</span>
          <input
            className="amount-input"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder={tipoActivo === "SOL" ? "0.01" : "50"}
            inputMode="decimal"
          />
        </label>
        <label className="field">
          <span>Moneda</span>
          <select value={tipoActivo} onChange={(e) => setTipoActivo(e.target.value as "SOL" | "USDC")}>
            <option value="USDC">USDC (dólares digitales)</option>
            <option value="SOL">SOL</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Frecuencia</span>
        <select
          value={frecuencia}
          onChange={(e) => setFrecuencia(e.target.value as "diario" | "semanal" | "mensual")}
        >
          <option value="mensual">Cada mes</option>
          <option value="semanal">Cada semana</option>
          <option value="diario">Cada día</option>
        </select>
      </label>

      <div>
        <h2 className="form-section-title">¿Dónde llega el envío?</h2>
        <p className="form-section-note">
          Dirección de quien recibe (o la tuya si retiras tú). Si conectaste wallet arriba, un clic basta.
        </p>
      </div>

      <label className="field">
        <span>Dirección de destino</span>
        <div className="field-row">
          <input
            value={walletSolana}
            onChange={(e) => setWalletSolana(e.target.value)}
            placeholder="Dirección pública"
            spellCheck={false}
          />
          {connectedAddress && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setWalletSolana(connectedAddress)}
            >
              Usar la mía
            </button>
          )}
        </div>
        {!connectedAddress && (
          <span className="field-hint">Opcional conectar wallet en la barra; también puedes pegar la dirección.</span>
        )}
      </label>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Programando…" : "Programar envío a mi familia"}
      </button>
      {err && (
        <p className="msg-error" role="alert">
          {err}
        </p>
      )}
    </form>
  );
}
