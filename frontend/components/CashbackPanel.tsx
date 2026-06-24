"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { getApiBase } from "@/lib/config";
import { normalizeWa } from "@/lib/wa";

type Resumen = {
  total_acumulado: number;
  disponible: number;
  codigo_referido: string | null;
};

function toResumen(data: unknown): Resumen | null {
  if (data == null || typeof data !== "object" || Array.isArray(data)) return null;
  const d = data as Record<string, unknown>;
  return {
    total_acumulado: Number(d.total_acumulado ?? 0),
    disponible: Number(d.disponible ?? 0),
    codigo_referido: (d.codigo_referido as string | null | undefined) ?? null,
  };
}

export function CashbackPanel() {
  const [wa, setWa] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [canjearMonto, setCanjearMonto] = useState("");
  const [referidoCodigo, setReferidoCodigo] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const key = normalizeWa(wa);

  async function cargar() {
    if (!key) {
      setErr("Introduce un número de WhatsApp (solo dígitos, ej. 5215512345678).");
      return;
    }
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const raw = await apiFetch<unknown>(`/api/cashback/${encodeURIComponent(key)}`);
      const normalized = toResumen(raw);
      if (!normalized) {
        setErr(
          "Respuesta inválida del servidor. ¿Está el backend en marcha? Revisa la consola del backend."
        );
        setResumen(null);
        return;
      }
      setResumen(normalized);
    } catch (e) {
      const api = getApiBase();
      const fallback =
        e instanceof TypeError && e.message === "Failed to fetch"
          ? `No se pudo conectar con ${api}. Arranca el backend en otra terminal (npm run dev en la raíz). Si el API no es localhost:3000, crea frontend/.env con NEXT_PUBLIC_API_URL=...`
          : e instanceof ApiError
            ? e.message
            : (e as Error).message;
      setErr(fallback);
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }

  async function onCargar(e: React.FormEvent) {
    e.preventDefault();
    await cargar();
  }

  async function generarCodigo() {
    if (!key) {
      setErr("Introduce tu WhatsApp.");
      return;
    }
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ codigo: string }>("/api/cashback/generar-codigo", {
        method: "POST",
        body: JSON.stringify({ usuario_wa: key }),
      });
      setMsg(`Código generado: ${data.codigo}`);
      await cargar();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function canjear() {
    if (!key) return;
    const m = parseFloat(canjearMonto);
    if (isNaN(m) || m <= 0) {
      setErr("Monto de canje inválido.");
      return;
    }
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ mensaje?: string }>("/api/cashback/canjear", {
        method: "POST",
        body: JSON.stringify({ usuario_wa: key, monto: m }),
      });
      setMsg(data.mensaje || "Canje procesado.");
      setCanjearMonto("");
      await cargar();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function registrarReferido() {
    const codigo = referidoCodigo.trim();
    if (!key || !codigo) {
      setErr("WhatsApp y código de referido requeridos.");
      return;
    }
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      await apiFetch("/api/cashback/registrar-referido", {
        method: "POST",
        body: JSON.stringify({ referido_wa: key, codigo }),
      });
      setMsg("Referido registrado.");
      setReferidoCodigo("");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack-form">
      <form onSubmit={onCargar} className="row-inline">
        <label className="field grow">
          <span>Tu WhatsApp</span>
          <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="5215512345678" />
        </label>
        <button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? "Consultando…" : "Consultar"}
        </button>
      </form>
      <p className="muted" style={{ fontSize: "0.8rem" }}>
        API: <code>{getApiBase()}</code>
      </p>

      <div className="feedback-region" aria-live="polite">
        {err && (
          <p className="msg-error" role="alert">
            {err}
          </p>
        )}
        {msg && !err && (
          <p className="msg-ok" role="status">
            {msg}
          </p>
        )}
      </div>

      {resumen && (
        <div className="card stats">
          <p>
            Total acumulado: <strong>{resumen.total_acumulado}</strong>
          </p>
          <p>
            Disponible: <strong>{resumen.disponible}</strong>
          </p>
          <p>
            Código referido: <strong>{resumen.codigo_referido ?? "—"}</strong>
          </p>
          {resumen.total_acumulado === 0 && (
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Sin movimientos aún: el cashback crece cuando hay remesas ejecutadas y registradas para tu
              número.
            </p>
          )}
        </div>
      )}

      <div className="card actions-block">
        <h3 className="h-small">Generar código</h3>
        <button type="button" className="btn-secondary" onClick={generarCodigo} disabled={loading || !key}>
          Generar / renovar código
        </button>
      </div>

      <div className="card actions-block">
        <h3 className="h-small">Canjear cashback</h3>
        <div className="row-inline">
          <input
            value={canjearMonto}
            onChange={(e) => setCanjearMonto(e.target.value)}
            placeholder="Monto"
            inputMode="decimal"
            className="input-inline"
          />
          <button type="button" className="btn-primary" onClick={canjear} disabled={loading || !key}>
            Canjear
          </button>
        </div>
      </div>

      <div className="card actions-block">
        <h3 className="h-small">Registrar código de referido</h3>
        <div className="row-inline">
          <input
            value={referidoCodigo}
            onChange={(e) => setReferidoCodigo(e.target.value)}
            placeholder="Código"
            className="input-inline"
          />
          <button type="button" className="btn-secondary" onClick={registrarReferido} disabled={loading || !key}>
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
