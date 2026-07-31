-- Club TIA — lealtad por volumen (piloto 100–500)
-- Ejecutar: psql $DATABASE_URL -f db/migrations/004_lealtad_club_tia.sql

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Permitir débitos de canje en ledger cashback
DO $$
BEGIN
  ALTER TABLE cashback_transacciones DROP CONSTRAINT IF EXISTS cashback_transacciones_tipo_check;
  ALTER TABLE cashback_transacciones
    ADD CONSTRAINT cashback_transacciones_tipo_check
    CHECK (tipo IN ('remesa', 'referido', 'canje'));
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS lealtad_niveles (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL,
    rank INTEGER NOT NULL UNIQUE,
    envios_min INTEGER NOT NULL DEFAULT 0,
    volumen_usd_min NUMERIC(18, 2) NOT NULL DEFAULT 0,
    frecuencia_30d_min INTEGER NOT NULL DEFAULT 0,
    fee_mult NUMERIC(5, 4) NOT NULL DEFAULT 1.0,
    cashback_pct NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    cupo_recurrente_gratis INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO lealtad_niveles (
  codigo, nombre, rank, envios_min, volumen_usd_min, frecuencia_30d_min,
  fee_mult, cashback_pct, cupo_recurrente_gratis
) VALUES
  ('semilla', 'Semilla', 1, 1, 50, 0, 1.00, 1.00, 0),
  ('nopal',   'Nopal',   2, 3, 300, 1, 0.90, 1.00, 0),
  ('tunal',   'Tunal',   3, 6, 1000, 2, 0.75, 1.25, 1),
  ('aguila',  'Águila',  4, 12, 3000, 3, 0.60, 1.50, 2),
  ('escudo',  'Escudo',  5, 24, 8000, 4, 0.50, 2.00, 5)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  rank = EXCLUDED.rank,
  envios_min = EXCLUDED.envios_min,
  volumen_usd_min = EXCLUDED.volumen_usd_min,
  frecuencia_30d_min = EXCLUDED.frecuencia_30d_min,
  fee_mult = EXCLUDED.fee_mult,
  cashback_pct = EXCLUDED.cashback_pct,
  cupo_recurrente_gratis = EXCLUDED.cupo_recurrente_gratis;

CREATE TABLE IF NOT EXISTS lealtad_miembros (
    usuario_wa VARCHAR(50) PRIMARY KEY,
    nivel VARCHAR(20) NOT NULL DEFAULT 'semilla' REFERENCES lealtad_niveles(codigo),
    puntos_90d NUMERIC(18, 2) NOT NULL DEFAULT 0,
    envios_90d INTEGER NOT NULL DEFAULT 0,
    volumen_usd_90d NUMERIC(18, 2) NOT NULL DEFAULT 0,
    frecuencia_30d INTEGER NOT NULL DEFAULT 0,
    nivel_desde TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grace_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lealtad_miembros_nivel ON lealtad_miembros(nivel);

DROP TRIGGER IF EXISTS trg_lealtad_miembros_updated_at ON lealtad_miembros;
CREATE TRIGGER trg_lealtad_miembros_updated_at
    BEFORE UPDATE ON lealtad_miembros
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS lealtad_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_wa VARCHAR(50) NOT NULL,
    pago_id UUID REFERENCES pagos(id),
    suscripcion_id UUID REFERENCES suscripciones(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('envio', 'bonus_streak', 'ajuste', 'upgrade', 'canje')),
    puntos NUMERIC(18, 2) NOT NULL DEFAULT 0,
    monto_usd NUMERIC(18, 2) NOT NULL DEFAULT 0,
    detalle JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lealtad_eventos_usuario_created
  ON lealtad_eventos(usuario_wa, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lealtad_eventos_pago
  ON lealtad_eventos(pago_id) WHERE pago_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS lealtad_beneficios_aplicados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_wa VARCHAR(50) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('fee_discount', 'cashback', 'recurrente_gratis', 'canje')),
    ref_id VARCHAR(88),
    detalle JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lealtad_beneficios_usuario
  ON lealtad_beneficios_aplicados(usuario_wa, created_at DESC);

-- Cupo recurrente gratis (Club TIA)
ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS fee_waived BOOLEAN NOT NULL DEFAULT false;

-- RLS (mismo patrón que 002 — solo backend)
ALTER TABLE public.lealtad_niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lealtad_miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lealtad_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lealtad_beneficios_aplicados ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lealtad_niveles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lealtad_miembros FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lealtad_eventos FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lealtad_beneficios_aplicados FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'lealtad_niveles', 'lealtad_miembros', 'lealtad_eventos', 'lealtad_beneficios_aplicados'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS deny_anon_all ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY deny_anon_all ON public.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      t
    );
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
  END LOOP;
END $$;
