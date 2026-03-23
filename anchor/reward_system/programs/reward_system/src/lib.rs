use anchor_lang::prelude::*;

declare_id!("BMvqgrBD8Co4aCFzbsyyfL6gvgaqTXpHfSwvjSbF4fH3");

#[program]
pub mod reward_system {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
