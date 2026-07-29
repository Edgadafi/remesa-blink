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
  tx_signature?: string | null;
};

type PagoRow = {
  monto: string | number;
  tipo_activo?: string;
  created_at?: string;
  tx_signature?: string;
};

function formatMonto(r: { monto: string | number; tipo_activo?: string }): string {
  const s = String(r.monto).replace(/\..*$/, "");
  const raw = BigInt(s || "0");
  const tipo = (r.tipo_activo || "SOL").toUpperCase();
  if (tipo === "USDC") {
    const n = Number(raw) / 1e6;
    return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
  }
  return `${Number(raw) / 1e9} SOL`;
}

function explorerTxUrl(sig: string): string {
  const cluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet").includes("mainnet")
    ? ""
    : "?cluster=devnet";
  return `https://explorer.solana.com/tx/${sig}${cluster}`;
}

export function MisRemesasLookup() {
  const [wa, setWa] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [pagos, setPagos] = useState<PagoRow[] | null>(null);
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
    setPagos(null);
    setLoading(true);
    try {
      const enc = encodeURIComponent(key);
      const [data, pagosData] = await Promise.all([
        apiFetch<unknown>(`/api/suscripciones/${enc}`),
        apiFetch<unknown>(`/api/suscripciones/${enc}/pagos`).catch(() => []),
      ]);
      if (!Array.isArray(data)) {
        setErr("Respuesta inesperada del servidor.");
        setRows(null);
        return;
      }
      setRows(data as Row[]);
      setPagos(Array.isArray(pagosData) ? (pagosData as PagoRow[]) : []);
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
      setPagos(null);
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
      {rows && rows.length === 0 && (
        <p className="muted">No hay remesas programadas para ese número.</p>
      )}
      {rows && rows.length > 0 && (
        <section>
          <h2 className="h3" style={{ marginBottom: "0.75rem" }}>
            Programadas
          </h2>
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
                      Próximo envío: {new Date(r.proximo_pago).toLocaleString()}
                    </>
                  )}
                  {r.tx_signature && (
                    <>
                      <br />
                      <a
                        href={explorerTxUrl(r.tx_signature)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver comprobante
                      </a>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {pagos && pagos.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2 className="h3" style={{ marginBottom: "0.75rem" }}>
            Últimos envíos
          </h2>
          <ul className="list-plain">
            {pagos.map((p, i) => (
              <li key={i} style={{ marginBottom: "0.75rem" }}>
                <strong>{formatMonto(p)}</strong>
                {p.created_at && (
                  <span className="muted">
                    {" "}
                    · {new Date(p.created_at).toLocaleDateString("es-MX")}
                  </span>
                )}
                {p.tx_signature && (
                  <div>
                    <a
                      href={explorerTxUrl(p.tx_signature)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver comprobante
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {rows && rows.length > 0 && pagos && pagos.length === 0 && (
        <p className="muted" style={{ marginTop: "1rem" }}>
          Aún no hay envíos hechos; el primero llega según la frecuencia.
        </p>
      )}
    </div>
  );
}
