"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { getApiBase } from "@/lib/config";
import { normalizeWa } from "@/lib/wa";

type Row = {
  monto: string | number;
  frecuencia: string;
  destinatario_wa: string;
  tipo_activo?: string;
  remitente_wa?: string;
  proximo_pago?: string;
};

function formatMonto(r: Row): string {
  const s = String(r.monto).replace(/\..*$/, "");
  const raw = BigInt(s || "0");
  const tipo = (r.tipo_activo || "SOL").toUpperCase();
  if (tipo === "USDC") {
    return `${Number(raw) / 1e6} USDC`;
  }
  return `${Number(raw) / 1e9} SOL`;
}

export function MisRemesasLookup() {
  const [wa, setWa] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = normalizeWa(wa);
    if (!key) {
      setErr("Introduce un número de WhatsApp.");
      return;
    }
    setErr(null);
    setRows(null);
    setLoading(true);
    try {
      const data = await apiFetch<unknown>(`/api/suscripciones/${encodeURIComponent(key)}`);
      if (!Array.isArray(data)) {
        setErr("Respuesta inesperada del servidor.");
        setRows(null);
        return;
      }
      setRows(data as Row[]);
    } catch (e) {
      const api = getApiBase();
      const msg =
        e instanceof TypeError && e.message === "Failed to fetch"
          ? `Sin conexión a ${api}. ¿Backend arrancado?`
          : e instanceof ApiError
            ? e.message
            : (e as Error).message;
      setErr(msg);
      setRows(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack-form">
      <form onSubmit={onSubmit} className="row-inline">
        <label className="field grow">
          <span>Tu WhatsApp</span>
          <input
            value={wa}
            onChange={(e) => setWa(e.target.value)}
            placeholder="5215512345678"
            inputMode="numeric"
          />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Consultando…" : "Consultar"}
        </button>
      </form>
      <p className="muted" style={{ fontSize: "0.8rem" }}>
        API: <code>{getApiBase()}</code>
      </p>
      <div aria-live="polite">
        {err && (
          <p className="msg-error" role="alert">
            {err}
          </p>
        )}
      </div>
      {rows && rows.length === 0 && <p className="muted">No hay suscripciones activas para ese número.</p>}
      {rows && rows.length > 0 && (
        <ul className="list-cards">
          {rows.map((r, i) => (
            <li key={i} className="card">
              <strong>
                {formatMonto(r)} · {r.frecuencia}
              </strong>
              <div className="muted">
                Destino WA: {r.destinatario_wa}
                {r.proximo_pago && (
                  <>
                    <br />
                    Próximo pago: {new Date(r.proximo_pago).toLocaleString()}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
