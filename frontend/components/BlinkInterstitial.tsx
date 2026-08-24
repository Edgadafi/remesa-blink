"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Transaction } from "@solana/web3.js";
import { useConnectedAddress, WalletConnect } from "@/components/WalletConnect";

type ActionParam = {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
};

type ActionGetResponse = {
  type?: string;
  title?: string;
  icon?: string;
  description?: string;
  label?: string;
  links?: {
    actions?: Array<{
      label?: string;
      href?: string;
      parameters?: ActionParam[];
    }>;
  };
  error?: { message?: string };
};

type PhantomLike = {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect: () => Promise<{ publicKey: { toString(): string } }>;
  signAndSendTransaction: (
    tx: Transaction
  ) => Promise<{ signature: string }>;
};

function getPhantom(): PhantomLike | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { solana?: PhantomLike; phantom?: { solana?: PhantomLike } };
  return w.phantom?.solana ?? (w.solana?.isPhantom ? w.solana : null) ?? null;
}

function resolveActionHref(
  actionUrl: string,
  href?: string
): string {
  if (!href) return actionUrl;
  try {
    return new URL(href, actionUrl).toString();
  } catch {
    return href;
  }
}

export function BlinkInterstitial({ actionUrl }: { actionUrl: string }) {
  const connected = useConnectedAddress();
  const [meta, setMeta] = useState<ActionGetResponse | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const primary = meta?.links?.actions?.[0];
  const postUrl = useMemo(
    () => resolveActionHref(actionUrl, primary?.href),
    [actionUrl, primary?.href]
  );
  const params = primary?.parameters ?? [];

  const inspectorUrl = `https://www.blinks.xyz/inspector?url=${encodeURIComponent(actionUrl)}`;

  const phantomBrowseUrl = useMemo(() => {
    if (typeof window === "undefined") return null;
    const here = window.location.href;
    return `https://phantom.app/ul/browse/${encodeURIComponent(here)}?ref=${encodeURIComponent(window.location.origin)}`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadErr(null);
      setMeta(null);
      try {
        const res = await fetch(actionUrl, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          throw new Error(`No se pudo cargar (${res.status})`);
        }
        const json = (await res.json()) as ActionGetResponse;
        if (cancelled) return;
        if (json.error?.message) {
          setLoadErr(json.error.message);
        }
        setMeta(json);
        const initial: Record<string, string> = {};
        const u = new URL(actionUrl);
        for (const p of json.links?.actions?.[0]?.parameters ?? []) {
          const fromQuery = u.searchParams.get(p.name);
          if (fromQuery) initial[p.name] = fromQuery;
        }
        setValues(initial);
      } catch (e) {
        if (!cancelled) {
          setLoadErr(
            e instanceof Error
              ? e.message
              : "No se pudo abrir la acción. Revisa el enlace o el túnel."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actionUrl]);

  useEffect(() => {
    if (connected) {
      setValues((v) => ({ ...v, account: v.account || connected }));
    }
  }, [connected]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setStatus(null);
      try {
        const phantom = getPhantom();
        let account = values.account || connected || "";
        if (!account && phantom) {
          const c = await phantom.connect();
          account = c.publicKey.toString();
          setValues((v) => ({ ...v, account }));
        }
        if (!account) {
          throw new Error("Pega el código de tu app de dinero o pulsa Iniciar.");
        }

        const body: Record<string, string> = { ...values, account };
        const res = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as {
          transaction?: string;
          message?: string;
          link?: string;
          error?: string | { message?: string };
        };
        if (!res.ok) {
          const msg =
            typeof data.error === "string"
              ? data.error
              : data.error?.message || data.message || `Error ${res.status}`;
          throw new Error(msg);
        }
        if (data.link) {
          setStatus(
            data.message ||
              "Te abrimos el registro seguro. Completa INE + CLABE (~2 min)."
          );
          window.location.href = data.link;
          return;
        }
        if (!data.transaction) {
          if (data.message) {
            setStatus(data.message);
            return;
          }
          throw new Error("La acción no devolvió una transacción para firmar.");
        }

        const ph = getPhantom();
        if (!ph) {
          throw new Error(
            "Abre esta página en el celular, en la misma app donde tienes tu dinero."
          );
        }
        if (!ph.publicKey) {
          await ph.connect();
        }
        const bytes = Uint8Array.from(atob(data.transaction), (c) =>
          c.charCodeAt(0)
        );
        const tx = Transaction.from(bytes);
        const { signature } = await ph.signAndSendTransaction(tx);
        setStatus(
          data.message
            ? `${data.message}\nComprobante: ${signature}`
            : `Listo. Comprobante: ${signature}`
        );
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "No se pudo completar.");
      } finally {
        setBusy(false);
      }
    },
    [values, connected, postUrl]
  );

  if (loadErr && !meta) {
    return (
      <div className="stack-form blink-interstitial-card">
        <p className="msg-error" role="alert">
          {loadErr}
        </p>
        <p className="muted">
          Otra forma de ver el comprobante:{" "}
          <a href={inspectorUrl} target="_blank" rel="noopener noreferrer">
            abrir enlace
          </a>
        </p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="blink-interstitial-card">
        <p className="muted">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="stack-form blink-card blink-interstitial-card">
      {meta.icon && showIcon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={meta.icon}
          alt=""
          width={48}
          height={48}
          className="blink-icon"
          onError={() => setShowIcon(false)}
        />
      )}
      <h1 className="h2">{meta.title || "Confirmar envío"}</h1>
      <p>
        {(meta.description || "").replace(/\s*\(sandbox Etherfuse\)\.?/i, ".")}
      </p>

      <WalletConnect />

      {phantomBrowseUrl && (
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          En el celular:{" "}
          <a href={phantomBrowseUrl} className="btn-wallet" style={{ display: "inline-block" }}>
            Abrir en tu app de dinero
          </a>
          , o pega tu código abajo.
        </p>
      )}

      <form onSubmit={onSubmit} className="stack-form">
        {params.map((p) => (
          <label key={p.name} className="field">
            <span>{p.label || p.name}</span>
            <input
              name={p.name}
              required={p.required !== false && p.name !== "account"}
              type={p.type === "number" ? "number" : "text"}
              value={values[p.name] ?? ""}
              onChange={(ev) =>
                setValues((v) => ({ ...v, [p.name]: ev.target.value }))
              }
              placeholder={
                p.name === "account"
                  ? "Pega el código de tu app de dinero"
                  : undefined
              }
            />
          </label>
        ))}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Procesando…" : primary?.label || meta.label || "Continuar"}
        </button>
      </form>

      {status && (
        <p className={status.startsWith("Listo") ? "msg-ok" : "msg-error"} role="status">
          {status}
        </p>
      )}

      <p className="muted" style={{ fontSize: "0.85rem" }}>
        Otra forma de ver el comprobante:{" "}
        <a href={inspectorUrl} target="_blank" rel="noopener noreferrer">
          abrir enlace
        </a>
      </p>
    </div>
  );
}
