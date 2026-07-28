use anchor_lang::prelude::*;

declare_id!("BMvqgrBD8Co4aCFzbsyyfL6gvgaqTXpHfSwvjSbF4fH3");

/// Cashback composable por wallet (Fase D — post-MVP base).
/// CPI desde remesas_recurrentes en fase futura; hoy acumulación vía instrucción directa.
#[program]
pub mod reward_system {
    use super::*;

    pub fn acumular_cashback(ctx: Context<AcumularCashback>, monto: u64) -> Result<()> {
        require!(monto > 0, RewardError::MontoInvalido);

        let balance = &mut ctx.accounts.cashback_balance;
        if balance.pagos_acumulados == 0 {
            balance.wallet = ctx.accounts.wallet.key();
            balance.bump = ctx.bumps.cashback_balance;
        }

        balance.total_acumulado = balance
            .total_acumulado
            .checked_add(monto)
            .ok_or(RewardError::Overflow)?;
        balance.pagos_acumulados = balance
            .pagos_acumulados
            .checked_add(1)
            .ok_or(RewardError::Overflow)?;

        emit!(CashbackAcumulado {
            wallet: balance.wallet,
            monto,
            total: balance.total_acumulado,
        });

        Ok(())
    }
}

#[event]
pub struct CashbackAcumulado {
    pub wallet: Pubkey,
    pub monto: u64,
    pub total: u64,
}

#[account]
pub struct CashbackBalance {
    pub wallet: Pubkey,
    pub total_acumulado: u64,
    pub pagos_acumulados: u64,
    pub bump: u8,
}

impl CashbackBalance {
    pub const LEN: usize = 32 + 8 + 8 + 1;
}

#[derive(Accounts)]
pub struct AcumularCashback<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + CashbackBalance::LEN,
        seeds = [b"cashback", wallet.key().as_ref()],
        bump
    )]
    pub cashback_balance: Account<'info, CashbackBalance>,

    /// CHECK: wallet del beneficiario de cashback
    pub wallet: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum RewardError {
    #[msg("El monto debe ser mayor a 0")]
    MontoInvalido,
    #[msg("Arithmetic overflow")]
    Overflow,
}
