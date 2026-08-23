"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { LandingSections } from "@/components/landing/LandingSections";
import { ApiError } from "@/lib/api";
import { getWaSupportUrl } from "@/lib/config";
import {
  getPilotoMessages,
  parsePilotoLocale,
  persistLocale,
  readStoredLocale,
  type PilotoLocale,
} from "@/lib/i18n/piloto";
import { pilotoToLandingCopy } from "@/lib/i18n/piloto/landing-copy";
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
import { PilotoLangSwitch } from "./PilotoLangSwitch";

const REF_TO_CANAL: Record<string, CanalConfianza> = {
  comerciantes: "comerciantes",
  tiendita: "tiendita",
  migrantes: "asociacion_migrante",
  pyme: "pyme",
};

type Props = {
  refParam?: string;
  referidoId?: string;
  initialLang?: string | null;
};

export function PilotoLanding({ refParam, referidoId, initialLang }: Props) {
  const fromQuery = parsePilotoLocale(initialLang);
  const [locale, setLocale] = useState<PilotoLocale>(fromQuery ?? "es");
  const t = getPilotoMessages(locale);
  const copy = pilotoToLandingCopy(t);

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

  const scrollToForm = useCallback(() => {
    document.getElementById("piloto-form")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleLocaleChange = useCallback((next: PilotoLocale) => {
    setLocale(next);
    persistLocale(next);
  }, []);

  useEffect(() => {
    if (fromQuery) return;
    const stored = readStoredLocale();
    if (stored) setLocale(stored);
  }, [fromQuery]);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "es";
  }, [locale]);

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
      setError(t.errorValidation);
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
          ? t.errorValidation
          : t.errorSave
      );
    } finally {
      setLoading(false);
    }
  };

  const waUrl = getWaSupportUrl();
  const counter =
    total != null
      ? t.counterWithTotal(total, PILOTO_META_GOAL)
      : t.counterGoalOnly(PILOTO_META_GOAL);

  const formSlot = (
    <div className="piloto-form-card">
      <p className="piloto-proof-inline">{t.proof}</p>
      {success ? (
        <div className="piloto-msg-ok">
          <h3>{t.successTitle}</h3>
          <p className="piloto-msg-ok-note">{t.successNote}</p>
          {waUrl ? (
            <a href={waUrl} className="piloto-btn-secondary" target="_blank" rel="noopener noreferrer">
              {t.successWa}
            </a>
          ) : (
            <a href="mailto:remesatia@gmail.com" className="piloto-btn-secondary">
              remesatia@gmail.com
            </a>
          )}
        </div>
      ) : (
        <form className="piloto-form" onSubmit={handleSubmit}>
          <div className="piloto-field">
            <label htmlFor="whatsapp">{t.formWhatsapp}</label>
            <input
              id="whatsapp"
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder={t.formWhatsappPlaceholder}
            />
          </div>
          <div className="piloto-field">
            <label htmlFor="rol">{t.formRol}</label>
            <select id="rol" required value={rol} onChange={(e) => setRol(e.target.value as RolPiloto)}>
              <option value="">{t.formSelect}</option>
              <option value="remitente">{t.formRolRemitente}</option>
              <option value="receptora">{t.formRolReceptora}</option>
              <option value="promotor">{t.formRolPromotor}</option>
              <option value="tiendita">{t.formRolTiendita}</option>
            </select>
          </div>
          <div className="piloto-field">
            <label htmlFor="nombre">{t.formNombre}</label>
            <input id="nombre" value={nombreOpcional} onChange={(e) => setNombreOpcional(e.target.value)} />
          </div>
          <div className="piloto-field-row">
            <div className="piloto-field">
              <label htmlFor="estado">{t.formEstado}</label>
              <input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
            </div>
            <div className="piloto-field">
              <label htmlFor="municipio">{t.formMunicipio}</label>
              <input id="municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
            </div>
          </div>
          <div className="piloto-field-row">
            <div className="piloto-field">
              <label htmlFor="zona">{t.formZona}</label>
              <select id="zona" value={zona} onChange={(e) => setZona(e.target.value as ZonaPiloto | "")}>
                <option value="">{t.formZonaEmpty}</option>
                <option value="rural">{t.formZonaRural}</option>
                <option value="semiurbana">{t.formZonaSemiurbana}</option>
                <option value="urbana">{t.formZonaUrbana}</option>
              </select>
            </div>
            <div className="piloto-field">
              <label htmlFor="bancarizado">{t.formBancarizado}</label>
              <select
                id="bancarizado"
                value={bancarizado}
                onChange={(e) => setBancarizado(e.target.value as BancarizadoPiloto | "")}
              >
                <option value="">{t.formZonaEmpty}</option>
                <option value="si">{t.formBancarizadoSi}</option>
                <option value="no">{t.formBancarizadoNo}</option>
                <option value="sub">{t.formBancarizadoSub}</option>
              </select>
            </div>
          </div>
          <div className="piloto-field">
            <label htmlFor="canal">{t.formCanal}</label>
            <select
              id="canal"
              value={canalConfianza}
              onChange={(e) => setCanalConfianza(e.target.value as CanalConfianza | "")}
            >
              <option value="">{t.formZonaEmpty}</option>
              <option value="tiendita">{t.formCanalTiendita}</option>
              <option value="comerciantes">{t.formCanalComerciantes}</option>
              <option value="pyme">{t.formCanalPyme}</option>
              <option value="asociacion_migrante">{t.formCanalMigrante}</option>
              <option value="asociacion">{t.formCanalAsociacion}</option>
              <option value="familia">{t.formCanalFamilia}</option>
              <option value="microfinanzas">{t.formCanalMicrofinanzas}</option>
              <option value="iglesia">{t.formCanalIglesia}</option>
              <option value="otro">{t.formCanalOtro}</option>
            </select>
          </div>
          <div className="piloto-field">
            <label htmlFor="notas">{t.formNotas}</label>
            <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
          {error ? <p className="piloto-msg-error">{error}</p> : null}
          <button type="submit" className="piloto-btn-primary piloto-btn-primary--full" disabled={loading}>
            {loading ? t.formSubmitting : t.formSubmit}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="piloto-page">
      <header className="piloto-header piloto-header--landing">
        <span className="piloto-wordmark">holatia.app</span>
        <div className="piloto-header-actions">
          <PilotoLangSwitch
            locale={locale}
            label={t.langSwitchLabel}
            onChange={handleLocaleChange}
          />
          <span className="piloto-counter">{counter}</span>
        </div>
      </header>
      <main className="piloto-main landing-main">
        <LandingSections
          copy={copy}
          primaryAction={scrollToForm}
          formSlot={formSlot}
          onScrollToSteps={() =>
            document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })
          }
        />
      </main>
      <footer className="piloto-footer">
        <p>{t.footer}</p>
        <p>
          <a href="mailto:remesatia@gmail.com">remesatia@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}
