//! Programa Anchor: Remesas Recurrentes
//! Gestiona suscripciones de pagos recurrentes en Solana (SOL y USDC).
//! Composabilidad: eventos, PagoReceipt y perfiles on-chain por wallet.

use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, Transfer};

declare_id!("B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2");

/// Sentinel: mint = default indica pago en SOL nativo.
pub const MINT_SOL: Pubkey = Pubkey::new_from_array([0u8; 32]);

#[program]
pub mod remesas_recurrentes {
    use super::*;

    /// Registra una nueva suscripción de remesa recurrente.
    /// PDA: ["suscripcion", remitente, destinatario]
    pub fn registrar_suscripcion(
        ctx: Context<RegistrarSuscripcion>,
        monto: u64,
        frecuencia: Frecuencia,
        usuario_remitente: Pubkey,
    ) -> Result<()> {
        require!(monto > 0, ErrorCode::MontoInvalido);
        require!(frecuencia != Frecuencia::Desconocida, ErrorCode::FrecuenciaInvalida);

        let clock = Clock::get()?;
        let now = clock.unix_timestamp;

        let suscripcion = &mut ctx.accounts.suscripcion;
        suscripcion.remitente = ctx.accounts.remitente.key();
        suscripcion.destinatario = ctx.accounts.destinatario.key();
        suscripcion.usuario_remitente = if usuario_remitente == Pubkey::default() {
            ctx.accounts.remitente.key()
        } else {
            usuario_remitente
        };
        suscripcion.monto = monto;
        suscripcion.frecuencia = frecuencia;
        suscripcion.proximo_pago = now;
        suscripcion.ultimo_pago = 0;
        suscripcion.contador_pagos = 0;
        suscripcion.activa = true;
        suscripcion.bump = ctx.bumps.suscripcion;

        msg!("Suscripcion registrada: {} lamports cada {:?}", monto, frecuencia);
        Ok(())
    }

    /// Ejecuta un pago SOL. Crea receipt, actualiza perfiles y emite evento.
    pub fn ejecutar_pago(ctx: Context<EjecutarPago>) -> Result<()> {
        let suscripcion = &mut ctx.accounts.suscripcion;
        require!(suscripcion.activa, ErrorCode::SuscripcionInactiva);

        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        require!(suscripcion.proximo_pago <= now, ErrorCode::PagoNoVencido);

        let monto = suscripcion.monto;
        let nonce = suscripcion.contador_pagos;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.remitente.to_account_info(),
                to: ctx.accounts.destinatario.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, monto)?;

        suscripcion.ultimo_pago = now;
        suscripcion.proximo_pago = calcular_proximo_pago(now, suscripcion.frecuencia);
        suscripcion.contador_pagos = nonce
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        let receipt = &mut ctx.accounts.receipt;
        receipt.suscripcion = suscripcion.key();
        receipt.usuario_remitente = suscripcion.usuario_remitente;
        receipt.destinatario = suscripcion.destinatario;
        receipt.monto = monto;
        receipt.mint = MINT_SOL;
        receipt.timestamp = now;
        receipt.nonce = nonce;
        receipt.bump = ctx.bumps.receipt;

        actualizar_perfil_remitente(
            &mut ctx.accounts.perfil_remitente,
            suscripcion.usuario_remitente,
            monto,
            now,
            ctx.bumps.perfil_remitente,
        )?;
        actualizar_perfil_destinatario(
            &mut ctx.accounts.perfil_destinatario,
            suscripcion.destinatario,
            monto,
            now,
            ctx.bumps.perfil_destinatario,
        )?;

        emit!(PagoEjecutado {
            suscripcion: suscripcion.key(),
            usuario_remitente: suscripcion.usuario_remitente,
            destinatario: suscripcion.destinatario,
            monto,
            mint: MINT_SOL,
            timestamp: now,
            nonce,
        });

        msg!("Pago ejecutado: {} lamports. Proximo pago: {}", monto, suscripcion.proximo_pago);
        Ok(())
    }

    pub fn cancelar_suscripcion(ctx: Context<CancelarSuscripcion>) -> Result<()> {
        let suscripcion = &mut ctx.accounts.suscripcion;
        suscripcion.activa = false;
        msg!("Suscripcion cancelada");
        Ok(())
    }

    pub fn registrar_suscripcion_usdc(
        ctx: Context<RegistrarSuscripcionUsdc>,
        monto: u64,
        frecuencia: Frecuencia,
        usuario_remitente: Pubkey,
    ) -> Result<()> {
        require!(monto > 0, ErrorCode::MontoInvalido);
        require!(frecuencia != Frecuencia::Desconocida, ErrorCode::FrecuenciaInvalida);

        let clock = Clock::get()?;
        let now = clock.unix_timestamp;

        let suscripcion = &mut ctx.accounts.suscripcion_usdc;
        suscripcion.remitente = ctx.accounts.remitente.key();
        suscripcion.destinatario = ctx.accounts.destinatario.key();
        suscripcion.mint = ctx.accounts.mint.key();
        suscripcion.usuario_remitente = if usuario_remitente == Pubkey::default() {
            ctx.accounts.remitente.key()
        } else {
            usuario_remitente
        };
        suscripcion.monto = monto;
        suscripcion.frecuencia = frecuencia;
        suscripcion.proximo_pago = now;
        suscripcion.ultimo_pago = 0;
        suscripcion.contador_pagos = 0;
        suscripcion.activa = true;
        suscripcion.bump = ctx.bumps.suscripcion_usdc;

        msg!("Suscripcion USDC registrada: {} unidades cada {:?}", monto, frecuencia);
        Ok(())
    }

    pub fn ejecutar_pago_usdc(ctx: Context<EjecutarPagoUsdc>) -> Result<()> {
        let suscripcion_key = ctx.accounts.suscripcion_usdc.key();
        let usuario_remitente = ctx.accounts.suscripcion_usdc.usuario_remitente;
        let destinatario = ctx.accounts.suscripcion_usdc.destinatario;
        let mint = ctx.accounts.suscripcion_usdc.mint;

        let suscripcion = &ctx.accounts.suscripcion_usdc;
        require!(suscripcion.activa, ErrorCode::SuscripcionInactiva);

        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        require!(suscripcion.proximo_pago <= now, ErrorCode::PagoNoVencido);

        let monto = suscripcion.monto;
        let nonce = suscripcion.contador_pagos;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.source_token_account.to_account_info(),
                to: ctx.accounts.dest_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, monto)?;

        let suscripcion = &mut ctx.accounts.suscripcion_usdc;
        suscripcion.ultimo_pago = now;
        suscripcion.proximo_pago = calcular_proximo_pago(now, suscripcion.frecuencia);
        suscripcion.contador_pagos = nonce
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;

        let receipt = &mut ctx.accounts.receipt;
        receipt.suscripcion = suscripcion_key;
        receipt.usuario_remitente = usuario_remitente;
        receipt.destinatario = destinatario;
        receipt.monto = monto;
        receipt.mint = mint;
        receipt.timestamp = now;
        receipt.nonce = nonce;
        receipt.bump = ctx.bumps.receipt;

        actualizar_perfil_remitente(
            &mut ctx.accounts.perfil_remitente,
            usuario_remitente,
            monto,
            now,
            ctx.bumps.perfil_remitente,
        )?;
        actualizar_perfil_destinatario(
            &mut ctx.accounts.perfil_destinatario,
            destinatario,
            monto,
            now,
            ctx.bumps.perfil_destinatario,
        )?;

        emit!(PagoEjecutado {
            suscripcion: suscripcion_key,
            usuario_remitente,
            destinatario,
            monto,
            mint,
            timestamp: now,
            nonce,
        });

        msg!("Pago USDC ejecutado: {}. Proximo pago: {}", monto, suscripcion.proximo_pago);
        Ok(())
    }
}

fn actualizar_perfil_remitente(
    perfil: &mut Account<PerfilRemitente>,
    wallet: Pubkey,
    monto: u64,
    now: i64,
    bump: u8,
) -> Result<()> {
    if perfil.pagos_completados == 0 {
        perfil.wallet = wallet;
        perfil.primera_actividad = now;
        perfil.bump = bump;
    }
    perfil.total_enviado = perfil
        .total_enviado
        .checked_add(monto)
        .ok_or(ErrorCode::Overflow)?;
    perfil.pagos_completados = perfil
        .pagos_completados
        .checked_add(1)
        .ok_or(ErrorCode::Overflow)?;
    perfil.ultima_actividad = now;
    Ok(())
}

fn actualizar_perfil_destinatario(
    perfil: &mut Account<PerfilDestinatario>,
    wallet: Pubkey,
    monto: u64,
    now: i64,
    bump: u8,
) -> Result<()> {
    if perfil.pagos_completados == 0 {
        perfil.wallet = wallet;
        perfil.primera_actividad = now;
        perfil.bump = bump;
    }
    perfil.total_recibido = perfil
        .total_recibido
        .checked_add(monto)
        .ok_or(ErrorCode::Overflow)?;
    perfil.pagos_completados = perfil
        .pagos_completados
        .checked_add(1)
        .ok_or(ErrorCode::Overflow)?;
    perfil.ultima_actividad = now;
    Ok(())
}

#[event]
pub struct PagoEjecutado {
    pub suscripcion: Pubkey,
    pub usuario_remitente: Pubkey,
    pub destinatario: Pubkey,
    pub monto: u64,
    pub mint: Pubkey,
    pub timestamp: i64,
    pub nonce: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Frecuencia {
    Desconocida,
    Diario,
    Semanal,
    Mensual,
    /// Payday habit US→MX (every 14 days). Appended — does not shift existing discriminants.
    Quincenal,
}

fn calcular_proximo_pago(ultimo: i64, frecuencia: Frecuencia) -> i64 {
    const SEGUNDOS_DIA: i64 = 86400;
    const SEGUNDOS_SEMANA: i64 = 7 * SEGUNDOS_DIA;
    const SEGUNDOS_QUINCENA: i64 = 14 * SEGUNDOS_DIA;
    const SEGUNDOS_MES: i64 = 30 * SEGUNDOS_DIA;

    let delta = match frecuencia {
        Frecuencia::Diario => SEGUNDOS_DIA,
        Frecuencia::Semanal => SEGUNDOS_SEMANA,
        Frecuencia::Quincenal => SEGUNDOS_QUINCENA,
        Frecuencia::Mensual => SEGUNDOS_MES,
        _ => 0,
    };
    ultimo.checked_add(delta).unwrap_or(ultimo)
}

#[account]
pub struct Suscripcion {
    pub remitente: Pubkey,
    pub destinatario: Pubkey,
    pub usuario_remitente: Pubkey,
    pub monto: u64,
    pub frecuencia: Frecuencia,
    pub proximo_pago: i64,
    pub ultimo_pago: i64,
    pub contador_pagos: u64,
    pub activa: bool,
    pub bump: u8,
}

impl Suscripcion {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 1 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct SuscripcionUsdc {
    pub remitente: Pubkey,
    pub destinatario: Pubkey,
    pub mint: Pubkey,
    pub usuario_remitente: Pubkey,
    pub monto: u64,
    pub frecuencia: Frecuencia,
    pub proximo_pago: i64,
    pub ultimo_pago: i64,
    pub contador_pagos: u64,
    pub activa: bool,
    pub bump: u8,
}

impl SuscripcionUsdc {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 8 + 1 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct PagoReceipt {
    pub suscripcion: Pubkey,
    pub usuario_remitente: Pubkey,
    pub destinatario: Pubkey,
    pub monto: u64,
    pub mint: Pubkey,
    pub timestamp: i64,
    pub nonce: u64,
    pub bump: u8,
}

impl PagoReceipt {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 32 + 8 + 8 + 1;
}

#[account]
pub struct PerfilRemitente {
    pub wallet: Pubkey,
    pub total_enviado: u64,
    pub pagos_completados: u64,
    pub primera_actividad: i64,
    pub ultima_actividad: i64,
    pub bump: u8,
}

impl PerfilRemitente {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct PerfilDestinatario {
    pub wallet: Pubkey,
    pub total_recibido: u64,
    pub pagos_completados: u64,
    pub primera_actividad: i64,
    pub ultima_actividad: i64,
    pub bump: u8,
}

impl PerfilDestinatario {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8 + 1;
}

#[derive(Accounts)]
pub struct RegistrarSuscripcion<'info> {
    #[account(
        init,
        payer = remitente,
        space = 8 + Suscripcion::LEN,
        seeds = [b"suscripcion", remitente.key().as_ref(), destinatario.key().as_ref()],
        bump
    )]
    pub suscripcion: Account<'info, Suscripcion>,

    #[account(mut)]
    pub remitente: Signer<'info>,

    /// CHECK: Solo almacenamos la dirección del destinatario
    pub destinatario: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EjecutarPago<'info> {
    #[account(
        mut,
        seeds = [b"suscripcion", suscripcion.remitente.as_ref(), suscripcion.destinatario.as_ref()],
        bump = suscripcion.bump,
        constraint = suscripcion.activa @ ErrorCode::SuscripcionInactiva
    )]
    pub suscripcion: Account<'info, Suscripcion>,

    #[account(
        init,
        payer = keeper,
        space = 8 + PagoReceipt::LEN,
        seeds = [
            b"receipt",
            suscripcion.key().as_ref(),
            &suscripcion.contador_pagos.to_le_bytes(),
        ],
        bump
    )]
    pub receipt: Account<'info, PagoReceipt>,

    #[account(
        init_if_needed,
        payer = keeper,
        space = 8 + PerfilRemitente::LEN,
        seeds = [b"perfil_remitente", suscripcion.usuario_remitente.as_ref()],
        bump
    )]
    pub perfil_remitente: Account<'info, PerfilRemitente>,

    #[account(
        init_if_needed,
        payer = keeper,
        space = 8 + PerfilDestinatario::LEN,
        seeds = [b"perfil_destinatario", suscripcion.destinatario.as_ref()],
        bump
    )]
    pub perfil_destinatario: Account<'info, PerfilDestinatario>,

    #[account(mut, address = suscripcion.remitente)]
    pub remitente: SystemAccount<'info>,

    #[account(mut, address = suscripcion.destinatario)]
    pub destinatario: SystemAccount<'info>,

    #[account(mut)]
    pub keeper: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelarSuscripcion<'info> {
    #[account(
        mut,
        seeds = [b"suscripcion", suscripcion.remitente.as_ref(), suscripcion.destinatario.as_ref()],
        bump = suscripcion.bump,
        constraint = remitente.key() == suscripcion.remitente @ ErrorCode::SoloRemitente
    )]
    pub suscripcion: Account<'info, Suscripcion>,

    pub remitente: Signer<'info>,
}

#[derive(Accounts)]
pub struct RegistrarSuscripcionUsdc<'info> {
    #[account(
        init,
        payer = remitente,
        space = 8 + SuscripcionUsdc::LEN,
        seeds = [b"suscripcion_usdc", remitente.key().as_ref(), destinatario.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub suscripcion_usdc: Account<'info, SuscripcionUsdc>,

    #[account(mut)]
    pub remitente: Signer<'info>,

    /// CHECK: Dirección del destinatario
    pub destinatario: UncheckedAccount<'info>,

    /// CHECK: USDC mint
    pub mint: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EjecutarPagoUsdc<'info> {
    #[account(
        mut,
        seeds = [b"suscripcion_usdc", suscripcion_usdc.remitente.as_ref(), suscripcion_usdc.destinatario.as_ref(), suscripcion_usdc.mint.as_ref()],
        bump = suscripcion_usdc.bump,
        constraint = suscripcion_usdc.activa @ ErrorCode::SuscripcionInactiva
    )]
    pub suscripcion_usdc: Account<'info, SuscripcionUsdc>,

    #[account(
        init,
        payer = authority,
        space = 8 + PagoReceipt::LEN,
        seeds = [
            b"receipt",
            suscripcion_usdc.key().as_ref(),
            &suscripcion_usdc.contador_pagos.to_le_bytes(),
        ],
        bump
    )]
    pub receipt: Account<'info, PagoReceipt>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + PerfilRemitente::LEN,
        seeds = [b"perfil_remitente", suscripcion_usdc.usuario_remitente.as_ref()],
        bump
    )]
    pub perfil_remitente: Account<'info, PerfilRemitente>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + PerfilDestinatario::LEN,
        seeds = [b"perfil_destinatario", suscripcion_usdc.destinatario.as_ref()],
        bump
    )]
    pub perfil_destinatario: Account<'info, PerfilDestinatario>,

    /// CHECK: ATA del keeper para el mint.
    #[account(mut)]
    pub source_token_account: UncheckedAccount<'info>,

    /// CHECK: ATA del destinatario para el mint.
    #[account(mut)]
    pub dest_token_account: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = authority.key() == suscripcion_usdc.remitente @ ErrorCode::SoloRemitente
    )]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("El monto debe ser mayor a 0")]
    MontoInvalido,

    #[msg("Frecuencia no valida")]
    FrecuenciaInvalida,

    #[msg("La suscripcion esta inactiva")]
    SuscripcionInactiva,

    #[msg("El pago aun no ha vencido")]
    PagoNoVencido,

    #[msg("Solo el remitente puede cancelar")]
    SoloRemitente,

    #[msg("Cuenta de token invalida")]
    InvalidTokenAccount,

    #[msg("Arithmetic overflow")]
    Overflow,
}
