-- Migración: ampliar canal_confianza en usuarios_piloto (GTM comerciantes/PYMEs)

ALTER TABLE usuarios_piloto DROP CONSTRAINT IF EXISTS usuarios_piloto_canal_confianza_check;

ALTER TABLE usuarios_piloto ADD CONSTRAINT usuarios_piloto_canal_confianza_check
  CHECK (canal_confianza IN (
    'tiendita', 'comerciantes', 'pyme', 'asociacion_migrante',
    'iglesia', 'asociacion', 'familia', 'microfinanzas', 'otro'
  ));
