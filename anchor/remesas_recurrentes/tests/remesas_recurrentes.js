const anchor = require("@coral-xyz/anchor");
const { SystemProgram, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const { assert } = require("chai");

describe("remesas_recurrentes", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.remesasRecurrentes;
  const provider = anchor.getProvider();

  const remitente = Keypair.generate();
  const usuarioRemitente = Keypair.generate();
  const destinatario = Keypair.generate();
  const keeper = Keypair.generate();

  const frecuenciaDiario = { diario: {} };
  const montoLamports = new anchor.BN(0.01 * LAMPORTS_PER_SOL);

  function receiptPda(suscripcionPda, nonce) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(nonce));
    return PublicKey.findProgramAddressSync(
      [Buffer.from("receipt"), suscripcionPda.toBuffer(), buf],
      program.programId
    );
  }

  function perfilRemitentePda(wallet) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("perfil_remitente"), wallet.toBuffer()],
      program.programId
    );
  }

  function perfilDestinatarioPda(wallet) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("perfil_destinatario"), wallet.toBuffer()],
      program.programId
    );
  }

  before(async () => {
    for (const kp of [remitente, keeper]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    }
  });

  it("registra suscripción SOL con usuario_remitente y ejecuta pago composable", async () => {
    const [suscripcionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("suscripcion"),
        remitente.publicKey.toBuffer(),
        destinatario.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .registrarSuscripcion(montoLamports, frecuenciaDiario, usuarioRemitente.publicKey)
      .accounts({
        suscripcion: suscripcionPda,
        remitente: remitente.publicKey,
        destinatario: destinatario.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([remitente])
      .rpc();

    const acct = await program.account.suscripcion.fetch(suscripcionPda);
    assert.ok(acct.activa);
    assert.equal(acct.monto.toNumber(), montoLamports.toNumber());
    assert.ok(acct.usuarioRemitente.equals(usuarioRemitente.publicKey));
    assert.equal(acct.contadorPagos.toNumber(), 0);

    const destBefore = await provider.connection.getBalance(destinatario.publicKey);
    const [receipt] = receiptPda(suscripcionPda, 0);
    const [perfilRem] = perfilRemitentePda(usuarioRemitente.publicKey);
    const [perfilDest] = perfilDestinatarioPda(destinatario.publicKey);

    await program.methods
      .ejecutarPago()
      .accounts({
        suscripcion: suscripcionPda,
        receipt,
        perfilRemitente: perfilRem,
        perfilDestinatario: perfilDest,
        remitente: remitente.publicKey,
        destinatario: destinatario.publicKey,
        keeper: keeper.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([keeper])
      .rpc();

    const destAfter = await provider.connection.getBalance(destinatario.publicKey);
    assert.equal(destAfter - destBefore, montoLamports.toNumber());

    const acctAfter = await program.account.suscripcion.fetch(suscripcionPda);
    assert.ok(acctAfter.ultimoPago.toNumber() > 0);
    assert.equal(acctAfter.contadorPagos.toNumber(), 1);

    const receiptAcct = await program.account.pagoReceipt.fetch(receipt);
    assert.equal(receiptAcct.nonce.toNumber(), 0);
    assert.ok(receiptAcct.usuarioRemitente.equals(usuarioRemitente.publicKey));

    const perfilR = await program.account.perfilRemitente.fetch(perfilRem);
    assert.equal(perfilR.pagosCompletados.toNumber(), 1);
    assert.equal(perfilR.totalEnviado.toNumber(), montoLamports.toNumber());

    const perfilD = await program.account.perfilDestinatario.fetch(perfilDest);
    assert.equal(perfilD.pagosCompletados.toNumber(), 1);
  });

  it("rechaza pago si no ha vencido", async () => {
    const remitente2 = Keypair.generate();
    const dest2 = Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      remitente2.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("suscripcion"),
        remitente2.publicKey.toBuffer(),
        dest2.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .registrarSuscripcion(montoLamports, frecuenciaDiario, remitente2.publicKey)
      .accounts({
        suscripcion: pda,
        remitente: remitente2.publicKey,
        destinatario: dest2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([remitente2])
      .rpc();

    const [receipt0] = receiptPda(pda, 0);
    const [pr] = perfilRemitentePda(remitente2.publicKey);
    const [pd] = perfilDestinatarioPda(dest2.publicKey);

    await program.methods
      .ejecutarPago()
      .accounts({
        suscripcion: pda,
        receipt: receipt0,
        perfilRemitente: pr,
        perfilDestinatario: pd,
        remitente: remitente2.publicKey,
        destinatario: dest2.publicKey,
        keeper: keeper.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([keeper])
      .rpc();

    const [receipt1] = receiptPda(pda, 1);

    try {
      await program.methods
        .ejecutarPago()
        .accounts({
          suscripcion: pda,
          receipt: receipt1,
          perfilRemitente: pr,
          perfilDestinatario: pd,
          remitente: remitente2.publicKey,
          destinatario: dest2.publicKey,
          keeper: keeper.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([keeper])
        .rpc();
      assert.fail("debió fallar PagoNoVencido");
    } catch (err) {
      assert.include(String(err), "PagoNoVencido");
    }
  });
});
