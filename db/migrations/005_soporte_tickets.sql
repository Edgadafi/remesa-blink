-- Soporte tickets (piloto) — log desde bot WhatsApp
-- psql $DATABASE_URL -f db/migrations/005_soporte_tickets.sql

CREATE TABLE IF NOT EXISTS soporte_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_wa VARCHAR(50) NOT NULL,
    motivo VARCHAR(40) NOT NULL CHECK (
      motivo IN ('no_aviso', 'cambiar_envio', 'sin_codigo', 'otra')
    ),
    detalle TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'abierto' CHECK (
      estado IN ('abierto', 'en_curso', 'cerrado')
    ),
    canal VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soporte_tickets_usuario
  ON soporte_tickets(usuario_wa, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soporte_tickets_estado
  ON soporte_tickets(estado) WHERE estado <> 'cerrado';

DROP TRIGGER IF EXISTS trg_soporte_tickets_updated_at ON soporte_tickets;
CREATE TRIGGER trg_soporte_tickets_updated_at
    BEFORE UPDATE ON soporte_tickets
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.soporte_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soporte_tickets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_anon_all ON public.soporte_tickets;
CREATE POLICY deny_anon_all
  ON public.soporte_tickets
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

REVOKE ALL ON public.soporte_tickets FROM anon, authenticated;
