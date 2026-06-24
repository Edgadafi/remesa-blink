"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { getWaSupportUrl } from "@/lib/config";
import {
  fetchPilotosTotal,
  registrarPiloto,
  type BancarizadoPiloto,
  type CanalConfianza,
  type RolPiloto,
  type ZonaPiloto,
} from "@/lib/pilotos";
import { PILOTO_META_GOAL } from "@/lib/piloto-config";
import { normalizeWa } from "@/lib/wa";

const REF_TO_CANAL: Record<string, CanalConfianza> = {
  comerciantes: "comerciantes",
  tiendita: "tiendita",
  migrantes: "asociacion_migrante",
  pyme: "pyme",
};

type Props = { refParam?: string; referidoId?: string };

export function PilotoLanding({ refParam, referidoId }: Props) {
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [rol, setRol] = useState<RolPiloto | "">("");
  const [nombreOpcional, setNombreOpcional] = useState("");
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [zona, setZona] = useState<ZonaPiloto | "">("");
  const [bancarizado, setBancarizado] = useState<BancarizadoPiloto | "">("");
  const [canalConfianza, setCanalConfianza] = useState<CanalConfianza | "">(
    refParam ? REF_TO_CANAL[refParam] ?? "" : ""
  );
  const [notas, setNotas] = useState("");

  const refreshTotal = useCallback(async () => {
    try {
      setTotal(await fetchPilotosTotal());
    } catch {
      setTotal(null);
    }
  }, []);

  useEffect(() => {
    void refreshTotal();
  }, [refreshTotal]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const waNorm = normalizeWa(whatsapp);
    if (waNorm.length < 10 || !rol) {
      setError("Revisa tu WhatsApp (incluye lada) y el rol.");
      return;
    }
    setLoading(true);
    try {
      await registrarPiloto({
        whatsapp: waNorm,
        rol,
        nombre_opcional: nombreOpcional.trim() || undefined,
        estado: estado.trim() || undefined,
        municipio: municipio.trim() || undefined,
        zona: zona || undefined,
        bancarizado: bancarizado || undefined,
        canal_confianza: canalConfianza || undefined,
        canal_detalle: refParam ? `ref:${refParam}` : undefined,
        referido_por_id: referidoId,
        notas: notas.trim() || undefined,
      });
      setSuccess(true);
      await refreshTotal();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? "Revisa tu WhatsApp (incluye lada) y el rol."
          : "No pudimos guardar tu registro. Escríbenos a soporte@remesablink.com."
      );
    } finally {
      setLoading(false);
    }
  };

  const waUrl = getWaSupportUrl();
  const counter =
    total != null
      ? `${total}/${PILOTO_META_GOAL} familias piloto`
      : `Meta ${PILOTO_META_GOAL} familias piloto`;

  return (
    <div className="piloto-page">
      <header className="piloto-header">
        <span className="piloto-wordmark">Remesa + Solana Blink + WhatsApp + IA</span>
        <span className="piloto-counter">{counter}</span>
      </header>
      <main className="piloto-main">
        <section className="piloto-section piloto-hero">
          <img
            className="piloto-hero-img"
            src="/piloto/hero-banner.png"
            alt="Remesa con Solana Blink, WhatsApp e IA — envía dólares desde EE.UU. y llega en pesos a México en segundos"
            width={1200}
            height={630}
            fetchPriority="high"
          />
          <p className="piloto-tagline">BRINGING - IT - CLOSER</p>
          <h1 className="piloto-headline">Tu familia más cerca, cada mes</h1>
          <p className="piloto-subhead">Programa una vez. Tu familia recibe aviso por WhatsApp.</p>
          <button
            type="button"
            className="piloto-btn-primary"
            onClick={() => document.getElementById("piloto-form")?.scrollIntoView({ behavior: "smooth" })}
          >
            Quiero ser piloto
          </button>
        </section>
        <section className="piloto-section">
          <h2>Mes tras mes, la misma fila</h2>
          <p>Colas en la tiendita, INE a mano, comisiones — y tu familia esperando el aviso cada quincena.</p>
        </section>
        <section className="piloto-section">
          <ol className="piloto-steps">
            <li><strong>Tú lo programas</strong><em>Por WhatsApp, en minutos.</em></li>
            <li><strong>Solana lo confirma</strong><em>Pago verificable en segundos.</em></li>
            <li><strong>Tu familia lo recibe</strong><em>Aviso directo y link seguro.</em></li>
          </ol>
        </section>
        <section className="piloto-section">
          <div className="piloto-proof">
            Buscamos <strong>10 familias piloto</strong> en corredor CAN-EU-MX.
          </div>
        </section>
        <section className="piloto-section" id="piloto-form">
          <div className="piloto-form-card">
            {success ? (
              <div className="piloto-msg-ok">
                <h3>Gracias — te contactamos en 48 h por WhatsApp.</h3>
                {waUrl ? (
                  <a href={waUrl} className="piloto-btn-secondary" target="_blank" rel="noopener noreferrer">
                    Escríbenos por WhatsApp
                  </a>
                ) : (
                  <a href="mailto:soporte@remesablink.com" className="piloto-btn-secondary">
                    soporte@remesablink.com
                  </a>
                )}
              </div>
            ) : (
              <form className="piloto-form" onSubmit={handleSubmit}>
                <div className="piloto-field">
                  <label htmlFor="whatsapp">WhatsApp *</label>
                  <input id="whatsapp" type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+1 713… o +52 443…" />
                </div>
                <div className="piloto-field">
                  <label htmlFor="rol">Soy… *</label>
                  <select id="rol" required value={rol} onChange={(e) => setRol(e.target.value as RolPiloto)}>
                    <option value="">Selecciona</option>
                    <option value="remitente">Remitente (EE.UU.)</option>
                    <option value="receptora">Receptora (México)</option>
                    <option value="promotor">Promotor / aliado</option>
                    <option value="tiendita">Dueño/a tiendita</option>
                  </select>
                </div>
                <div className="piloto-field">
                  <label htmlFor="nombre">Nombre (opcional)</label>
                  <input id="nombre" value={nombreOpcional} onChange={(e) => setNombreOpcional(e.target.value)} />
                </div>
                <div className="piloto-field-row">
                  <div className="piloto-field">
                    <label htmlFor="estado">Estado o ciudad</label>
                    <input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
                  </div>
                  <div className="piloto-field">
                    <label htmlFor="municipio">Municipio</label>
                    <input id="municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
                  </div>
                </div>
                <div className="piloto-field-row">
                  <div className="piloto-field">
                    <label htmlFor="zona">Zona</label>
                    <select id="zona" value={zona} onChange={(e) => setZona(e.target.value as ZonaPiloto | "")}>
                      <option value="">—</option>
                      <option value="rural">Rural</option>
                      <option value="semiurbana">Semiurbana</option>
                      <option value="urbana">Urbana</option>
                    </select>
                  </div>
                  <div className="piloto-field">
                    <label htmlFor="bancarizado">¿Cuenta bancaria?</label>
                    <select id="bancarizado" value={bancarizado} onChange={(e) => setBancarizado(e.target.value as BancarizadoPiloto | "")}>
                      <option value="">—</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                      <option value="sub">Sub-bancarizada</option>
                    </select>
                  </div>
                </div>
                <div className="piloto-field">
                  <label htmlFor="canal">¿Cómo nos conociste?</label>
                  <select id="canal" value={canalConfianza} onChange={(e) => setCanalConfianza(e.target.value as CanalConfianza | "")}>
                    <option value="">—</option>
                    <option value="tiendita">Tiendita</option>
                    <option value="comerciantes">Red de comerciantes / CANACO</option>
                    <option value="pyme">Grupo emprendedores / PYME</option>
                    <option value="asociacion_migrante">Asociación migrante</option>
                    <option value="asociacion">Asociación comunitaria</option>
                    <option value="familia">Familia o conocido</option>
                    <option value="microfinanzas">Cooperativa / microfinanzas</option>
                    <option value="iglesia">Iglesia / comunidad</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="piloto-field">
                  <label htmlFor="notas">Notas</label>
                  <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
                </div>
                {error ? <p className="piloto-msg-error">{error}</p> : null}
                <button type="submit" className="piloto-btn-primary" disabled={loading}>
                  {loading ? "Enviando…" : "Unirme al piloto"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <footer className="piloto-footer">
        <p>Solo usamos tu WhatsApp para contactarte. Piloto en devnet — montos pequeños.</p>
        <p><a href="mailto:soporte@remesablink.com">soporte@remesablink.com</a></p>
      </footer>
    </div>
  );
}
