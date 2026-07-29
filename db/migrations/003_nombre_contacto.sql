-- Migración: nombre/alias del contacto en suscripciones (UX bot P0)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'suscripciones'
          AND column_name = 'nombre_contacto'
    ) THEN
        ALTER TABLE public.suscripciones
          ADD COLUMN nombre_contacto VARCHAR(40);
    END IF;
END $$;
