"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { normalizeWa } from "@/lib/wa";
import { useConnectedAddress } from "@/components/WalletConnect";

export function FormNuevaRemesa() {
  const [remitenteWa, setRemitenteWa] = useState("");
  const [destinatarioWa, setDestinatarioWa] = useState("");
  const [walletSolana, setWalletSolana] = useState("");
  const [monto, setMonto] = useState("");
  const [tipoActivo, setTipoActivo] = useState<"SOL" | "USDC">("SOL");
  const [frecuencia, setFrecuencia] = useState<"diario" | "semanal" | "mensual">("diario");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
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
      setErr("Completa remitente, destinatario y wallet Solana.");
      return;
    }
    if (isNaN(m) || m <= 0) {
      setErr("Monto inválido.");
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
      setResult(
        `Suscripción creada.\n` +
          `Tx: ${data.tx_signature ?? "N/A"}\n` +
          `Resumen: ${m} ${tipoActivo} · ${frecuencia} · destino WA ${dWa}`
      );
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="stack-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Tu WhatsApp (remitente)</span>
        <input
          value={remitenteWa}
          onChange={(e) => setRemitenteWa(e.target.value)}
          placeholder="5215512345678"
          inputMode="numeric"
          autoComplete="tel"
        />
      </label>
      <label className="field">
        <span>WhatsApp del destinatario</span>
        <input
          value={destinatarioWa}
          onChange={(e) => setDestinatarioWa(e.target.value)}
          placeholder="5215598765432"
          inputMode="numeric"
          autoComplete="tel"
        />
      </label>
      <label className="field">
        <span>Wallet Solana del destinatario</span>
        <div className="field-row">
          <input
            value={walletSolana}
            onChange={(e) => setWalletSolana(e.target.value)}
            placeholder="Base58 pública"
            spellCheck={false}
          />
          {connectedAddress && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setWalletSolana(connectedAddress)}
            >
              Usar mi wallet
            </button>
          )}
        </div>
        {!connectedAddress && (
          <span className="field-hint">Conecta tu wallet en la barra superior para autocompletar.</span>
        )}
      </label>
      <label className="field">
        <span>Monto</span>
        <input
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder={tipoActivo === "SOL" ? "0.01" : "10"}
          inputMode="decimal"
        />
      </label>
      <label className="field">
        <span>Activo</span>
        <select value={tipoActivo} onChange={(e) => setTipoActivo(e.target.value as "SOL" | "USDC")}>
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
      </label>
      <label className="field">
        <span>Frecuencia</span>
        <select
          value={frecuencia}
          onChange={(e) => setFrecuencia(e.target.value as "diario" | "semanal" | "mensual")}
        >
          <option value="diario">Diario</option>
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
        </select>
      </label>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Enviando…" : "Crear suscripción"}
      </button>
      {err && <p className="msg-error" role="alert">{err}</p>}
      {result && (
        <pre className="msg-ok" role="status">
          {result}
        </pre>
      )}
    </form>
  );
}
