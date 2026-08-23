-- Hábito US→MX: envío cada quincena (14 días)
ALTER TABLE suscripciones DROP CONSTRAINT IF EXISTS suscripciones_frecuencia_check;
ALTER TABLE suscripciones
  ADD CONSTRAINT suscripciones_frecuencia_check
  CHECK (frecuencia IN ('diario', 'semanal', 'quincenal', 'mensual'));
