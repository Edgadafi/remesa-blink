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
    monto BIGINT NOT NULL CHECK (monto > 0),
    frecuencia VARCHAR(20) NOT NULL CHECK (frecuencia IN ('diario', 'semanal', 'mensual')),
    tipo_activo VARCHAR(10) NOT NULL DEFAULT 'SOL' CHECK (tipo_activo IN ('SOL', 'USDC')),
    proximo_pago TIMESTAMPTZ NOT NULL,
    ultimo_pago TIMESTAMPTZ,
    pda_address VARCHAR(44),
    usuario_remitente_solana VARCHAR(44),
    activa BOOLEAN NOT NULL DEFAULT true,
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
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('remesa', 'referido')),
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
-- Onboarding Etherfuse para off-ramp USDC -> MXN
CREATE TABLE IF NOT EXISTS beneficiarios_etherfuse (
    destinatario_solana VARCHAR(44) PRIMARY KEY,
    destinatario_wa VARCHAR(50),
    etherfuse_customer_id UUID NOT NULL,
    etherfuse_bank_account_id UUID NOT NULL,
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
