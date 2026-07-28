# Fase E — Roadmap post Demo Day

Documento de planificación (no implementado en MVP). Ver [COMPOSABILITY.md](./COMPOSABILITY.md).

## Objetivo

Migrar de modelo **custodial** (keeper = remitente en PDA) a **no-custodial** donde la wallet del usuario controla fondos y autoriza pagos recurrentes.

## Pasos propuestos

1. **Registro firmado por usuario** — `registrar_suscripcion` con `remitente` = wallet usuario (no keeper).
2. **Vault PDA o delegación SPL** — usuario deposita USDC/SOL; keeper ejecuta solo con permiso on-chain.
3. **Revocación** — `cancelar_suscripcion` + cierre de delegación desde wallet.
4. **Auditoría** — receipts y perfiles ya ligados a `usuario_remitente` siguen siendo válidos tras migración.

## reward_system (Fase D — base on-chain)

Programa `reward_system` incluye:

- `acumular_cashback(wallet, monto)` 
- PDA `["cashback", wallet]`
- Evento `CashbackAcumulado`

Integración CPI desde `ejecutar_pago` pendiente de release post-incubación.

## Checklist pre-mainnet

- [ ] Asesoría legal remesas MX/US
- [ ] Rotación keeper keys
- [ ] Simulación CU con receipt + perfil + CPI cashback
- [ ] Redeploy programas con audit trail
