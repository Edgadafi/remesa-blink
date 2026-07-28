-- RLS en tablas public — remesa-blink
-- Backend Express (DATABASE_URL postgres) no usa RLS; anon vía PostgREST sí.

-- 1) Función pública solo para contador landing (sin exponer filas)
CREATE OR REPLACE FUNCTION public.piloto_total()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::integer FROM public.usuarios_piloto;
$$;

REVOKE ALL ON FUNCTION public.piloto_total() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.piloto_total() TO anon;
GRANT EXECUTE ON FUNCTION public.piloto_total() TO authenticated;

-- 2) Habilitar RLS en todas las tablas expuestas
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_piloto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_referidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blinks_pendientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiarios_etherfuse ENABLE ROW LEVEL SECURITY;

-- 3) Forzar RLS incluso para owner (defensa en profundidad vía API)
ALTER TABLE public.suscripciones FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pagos FORCE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_piloto FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_programa FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_transacciones FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_referidos FORCE ROW LEVEL SECURITY;
ALTER TABLE public.blinks_pendientes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiarios_etherfuse FORCE ROW LEVEL SECURITY;

-- 4) usuarios_piloto: waitlist anónima (INSERT) — sin SELECT de filas vía anon
DROP POLICY IF EXISTS piloto_anon_insert ON public.usuarios_piloto;
CREATE POLICY piloto_anon_insert
  ON public.usuarios_piloto
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(whatsapp) >= 10
    AND length(whatsapp) <= 50
    AND rol IN ('remitente', 'receptora', 'promotor', 'tiendita')
  );

-- 5) Tablas solo backend: políticas deny-all para anon/authenticated
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'suscripciones', 'pagos', 'cashback_programa', 'cashback_transacciones',
    'cashback_referidos', 'blinks_pendientes', 'beneficiarios_etherfuse'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS deny_anon_all ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY deny_anon_all ON public.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      t
    );
  END LOOP;
END $$;

-- 6) Revocar acceso directo anon a tablas sensibles
REVOKE ALL ON public.suscripciones FROM anon, authenticated;
REVOKE ALL ON public.pagos FROM anon, authenticated;
REVOKE ALL ON public.cashback_programa FROM anon, authenticated;
REVOKE ALL ON public.cashback_transacciones FROM anon, authenticated;
REVOKE ALL ON public.cashback_referidos FROM anon, authenticated;
REVOKE ALL ON public.blinks_pendientes FROM anon, authenticated;
REVOKE ALL ON public.beneficiarios_etherfuse FROM anon, authenticated;

-- usuarios_piloto: solo INSERT para anon (SELECT vía piloto_total())
REVOKE ALL ON public.usuarios_piloto FROM anon, authenticated;
GRANT INSERT ON public.usuarios_piloto TO anon, authenticated;
