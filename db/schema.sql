-- Schema PostgreSQL: Remesa Blink - Remesas Recurrentes
-- Ejecutar: psql $DATABASE_URL -f db/schema.sql

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función compartida para triggers updated_at (debe existir antes de los triggers)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabla: suscripciones
-- Almacena las remesas recurrentes (on-chain + off-chain)
CREATE TABLE IF NOT EXISTS suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remitente_wa VARCHAR(50) NOT NULL,
    destinatario_wa VARCHAR(50) NOT NULL,
    destinatario_solana VARCHAR(44),
    nombre_contacto VARCHAR(40),
    monto BIGINT NOT NULL CHECK (monto > 0),
    frecuencia VARCHAR(20) NOT NULL CHECK (frecuencia IN ('diario', 'semanal', 'mensual')),
    tipo_activo VARCHAR(10) NOT NULL DEFAULT 'SOL' CHECK (tipo_activo IN ('SOL', 'USDC')),
    proximo_pago TIMESTAMPTZ NOT NULL,
    ultimo_pago TIMESTAMPTZ,
    pda_address VARCHAR(44),
    usuario_remitente_solana VARCHAR(44),
    tx_signature VARCHAR(88),
    activa BOOLEAN NOT NULL DEFAULT true,
    fee_waived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migración: añadir tipo_activo si no existe (DBs existentes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'suscripciones' AND column_name = 'tipo_activo'
    ) THEN
        ALTER TABLE suscripciones ADD COLUMN tipo_activo VARCHAR(10) NOT NULL DEFAULT 'SOL' CHECK (tipo_activo IN ('SOL', 'USDC'));
    END IF;
END $$;

-- Migración: usuario_remitente_solana
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'suscripciones' AND column_name = 'usuario_remitente_solana'
    ) THEN
        ALTER TABLE suscripciones ADD COLUMN usuario_remitente_solana VARCHAR(44);
    END IF;
END $$;

-- Migración: tx_signature (registro on-chain al crear suscripción)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'suscripciones' AND column_name = 'tx_signature'
    ) THEN
        ALTER TABLE suscripciones ADD COLUMN tx_signature VARCHAR(88);
    END IF;
END $$;

-- Migración: nombre_contacto (alias familiar en confirmaciones WA)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'suscripciones' AND column_name = 'nombre_contacto'
    ) THEN
        ALTER TABLE suscripciones ADD COLUMN nombre_contacto VARCHAR(40);
    END IF;
END $$;

-- Tabla: pagos (mirror off-chain del historial composable)
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suscripcion_id UUID REFERENCES suscripciones(id),
    receipt_pda VARCHAR(44),
    tx_signature VARCHAR(88) NOT NULL,
    nonce BIGINT NOT NULL DEFAULT 0,
    monto BIGINT NOT NULL,
    tipo_activo VARCHAR(10) NOT NULL CHECK (tipo_activo IN ('SOL', 'USDC')),
    usuario_remitente_solana VARCHAR(44),
    destinatario_solana VARCHAR(44),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_suscripcion ON pagos(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario_remitente ON pagos(usuario_remitente_solana);
CREATE INDEX IF NOT EXISTS idx_pagos_destinatario ON pagos(destinatario_solana);

-- Tabla: usuarios_piloto (identificación temprana — validación M2/M4)
CREATE TABLE IF NOT EXISTS usuarios_piloto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp VARCHAR(50) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('remitente', 'receptora', 'promotor', 'tiendita')),
    nombre_opcional VARCHAR(120),
    genero VARCHAR(20) CHECK (genero IN ('femenino', 'masculino', 'otro', 'prefiero_no_decir')),
    edad_rango VARCHAR(20),
    estado VARCHAR(80),
    municipio VARCHAR(120),
    zona VARCHAR(20) CHECK (zona IN ('rural', 'semiurbana', 'urbana')),
    bancarizado VARCHAR(10) CHECK (bancarizado IN ('si', 'no', 'sub')),
    canal_confianza VARCHAR(30) CHECK (canal_confianza IN (
        'tiendita', 'comerciantes', 'pyme', 'asociacion_migrante',
        'iglesia', 'asociacion', 'familia', 'microfinanzas', 'otro'
    )),
    canal_detalle TEXT,
    referido_por_id UUID REFERENCES usuarios_piloto(id),
    wallet_solana VARCHAR(44),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_piloto_rol ON usuarios_piloto(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_piloto_zona ON usuarios_piloto(zona);
CREATE INDEX IF NOT EXISTS idx_usuarios_piloto_whatsapp ON usuarios_piloto(whatsapp);

DROP TRIGGER IF EXISTS trg_usuarios_piloto_updated_at ON usuarios_piloto;
CREATE TRIGGER trg_usuarios_piloto_updated_at
    BEFORE UPDATE ON usuarios_piloto
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_suscripciones_remitente_activa ON suscripciones(remitente_wa, activa);
CREATE INDEX IF NOT EXISTS idx_suscripciones_destinatario ON suscripciones(destinatario_wa, activa);
CREATE INDEX IF NOT EXISTS idx_suscripciones_proximo_pago ON suscripciones(proximo_pago) WHERE activa = true;

-- Tabla: cashback_programa
-- Configuración del programa de cashback (porcentajes por nivel)
CREATE TABLE IF NOT EXISTS cashback_programa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    porcentaje_nivel1 DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    porcentaje_nivel2 DECIMAL(5,2) NOT NULL DEFAULT 0.5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO cashback_programa (porcentaje_nivel1, porcentaje_nivel2)
SELECT 1.0, 0.5
WHERE NOT EXISTS (SELECT 1 FROM cashback_programa LIMIT 1);

-- Tabla: cashback_transacciones
-- Registro de cada transacción que genera cashback
CREATE TABLE IF NOT EXISTS cashback_transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_wa VARCHAR(50) NOT NULL,
    monto DECIMAL(18,6) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('remesa', 'referido', 'canje')),
    suscripcion_id UUID REFERENCES suscripciones(id),
    referido_wa VARCHAR(50),
    nivel INTEGER CHECK (nivel IN (1, 2)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cashback_transacciones_usuario ON cashback_transacciones(usuario_wa);
CREATE INDEX IF NOT EXISTS idx_cashback_transacciones_created ON cashback_transacciones(usuario_wa, created_at DESC);

-- Tabla: cashback_referidos
-- Relación referidor -> referido con código único
CREATE TABLE IF NOT EXISTS cashback_referidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referidor_wa VARCHAR(50) NOT NULL,
    referido_wa VARCHAR(50) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(referidor_wa, referido_wa)
);

CREATE INDEX IF NOT EXISTS idx_cashback_referidos_codigo ON cashback_referidos(codigo) WHERE referidor_wa = referido_wa;
CREATE INDEX IF NOT EXISTS idx_cashback_referidos_referidor ON cashback_referidos(referidor_wa);

-- Tabla: blinks_pendientes
-- Blinks generados para notificar a destinatarios
CREATE TABLE IF NOT EXISTS blinks_pendientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suscripcion_id UUID REFERENCES suscripciones(id),
    tx_signature VARCHAR(88),
    destinatario_wa VARCHAR(50) NOT NULL,
    monto BIGINT NOT NULL,
    url_blink TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'reclamado', 'expirado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blinks_pendientes_suscripcion ON blinks_pendientes(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_blinks_pendientes_estado ON blinks_pendientes(estado);

-- Tabla: beneficiarios_etherfuse
-- Onboarding Etherfuse para off-ramp USDC -> MXN (SPEI). Demo Day path.
-- Bitso MXNB: no integrado (TODO post-demo). Ver docs/OFFRAMP-DEMO-DAY.md
CREATE TABLE IF NOT EXISTS beneficiarios_etherfuse (
    destinatario_solana VARCHAR(44) PRIMARY KEY,
    destinatario_wa VARCHAR(50),
    etherfuse_customer_id UUID NOT NULL,
    etherfuse_bank_account_id UUID NOT NULL,
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'failed')),
    last_order_id UUID,
    last_order_status VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent upgrades for DBs created before last_order_* columns
ALTER TABLE beneficiarios_etherfuse ADD COLUMN IF NOT EXISTS last_order_id UUID;
ALTER TABLE beneficiarios_etherfuse ADD COLUMN IF NOT EXISTS last_order_status VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_beneficiarios_etherfuse_kyc ON beneficiarios_etherfuse(kyc_status);

-- Triggers updated_at
DROP TRIGGER IF EXISTS trg_beneficiarios_etherfuse_updated_at ON beneficiarios_etherfuse;
CREATE TRIGGER trg_beneficiarios_etherfuse_updated_at
    BEFORE UPDATE ON beneficiarios_etherfuse
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_suscripciones_updated_at ON suscripciones;
CREATE TRIGGER trg_suscripciones_updated_at
    BEFORE UPDATE ON suscripciones
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Club TIA (ver db/migrations/004_lealtad_club_tia.sql)
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
ON CONFLICT (codigo) DO NOTHING;

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

ALTER TABLE suscripciones ADD COLUMN IF NOT EXISTS fee_waived BOOLEAN NOT NULL DEFAULT false;

-- Soporte tickets (piloto WhatsApp)
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
