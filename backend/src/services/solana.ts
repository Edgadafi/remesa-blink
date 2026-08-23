/**
 * Servicio de integración con el programa Anchor remesas_recurrentes
 */
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BN from "bn.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import bs58 from "bs58";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || "B1G72CcRGHYc1UpG4o51VrJySLiwm3d7tCHbQiSb5vZ2"
);

/** Mint sentinel on-chain para pagos SOL (Pubkey default). */
export const MINT_SOL_SENTINEL = PublicKey.default;

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
/** USDC mint (devnet vs mainnet difieren) */
export const USDC_MINT = new PublicKey(
  process.env.USDC_MINT || (RPC_URL.includes("devnet") ? USDC_DEVNET : USDC_MAINNET)
);

export const FrecuenciaAnchor = {
  Desconocida: { desconocida: {} },
  Diario: { diario: {} },
  Semanal: { semanal: {} },
  Mensual: { mensual: {} },
  Quincenal: { quincenal: {} },
} as const;

export interface PagoOnChainResult {
  txSignature: string;
  receiptPda: string;
  nonce: number;
}

export function getProgram(): Program {
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
  );

  const wallet = getKeeperKeypair();
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const idl = JSON.parse(
    readFileSync(
      join(__dirname, "../../../anchor/remesas_recurrentes/target/idl/remesas_recurrentes.json"),
      "utf-8"
    )
  );

  return new Program(idl, provider);
}

export function getKeeperKeypair(): Keypair {
  const key = process.env.KEEPER_PRIVATE_KEY || process.env.SOLANA_PRIVATE_KEY;
  if (!key) throw new Error("KEEPER_PRIVATE_KEY o SOLANA_PRIVATE_KEY no configurada");
  try {
    return Keypair.fromSecretKey(bs58.decode(key));
  } catch {
    const arr = JSON.parse(key) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(arr));
  }
}

export function getConnection(): Connection {
  return new Connection(
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
  );
}

export function getSuscripcionPda(
  remitente: PublicKey,
  destinatario: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("suscripcion"), remitente.toBuffer(), destinatario.toBuffer()],
    PROGRAM_ID
  );
}

export function getSuscripcionUsdcPda(
  remitente: PublicKey,
  destinatario: PublicKey,
  mint: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("suscripcion_usdc"),
      remitente.toBuffer(),
      destinatario.toBuffer(),
      mint.toBuffer(),
    ],
    PROGRAM_ID
  );
}

export function getPagoReceiptPda(
  suscripcionPda: PublicKey,
  nonce: number | bigint
): [PublicKey, number] {
  const nonceBuf = Buffer.alloc(8);
  nonceBuf.writeBigUInt64LE(BigInt(nonce));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), suscripcionPda.toBuffer(), nonceBuf],
    PROGRAM_ID
  );
}

export function getPerfilRemitentePda(wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("perfil_remitente"), wallet.toBuffer()],
    PROGRAM_ID
  );
}

export function getPerfilDestinatarioPda(wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("perfil_destinatario"), wallet.toBuffer()],
    PROGRAM_ID
  );
}

export async function fetchPerfilRemitente(wallet: PublicKey) {
  const program = getProgram();
  const [pda] = getPerfilRemitentePda(wallet);
  try {
    return await program.account.perfilRemitente.fetch(pda);
  } catch {
    return null;
  }
}

export async function fetchPerfilDestinatario(wallet: PublicKey) {
  const program = getProgram();
  const [pda] = getPerfilDestinatarioPda(wallet);
  try {
    return await program.account.perfilDestinatario.fetch(pda);
  } catch {
    return null;
  }
}

export async function fetchSuscripcionContadorPagos(
  remitente: PublicKey,
  destinatario: PublicKey,
  tipo: "SOL" | "USDC" = "SOL",
  mint: PublicKey = USDC_MINT
): Promise<number> {
  const program = getProgram();
  if (tipo === "USDC") {
    const [pda] = getSuscripcionUsdcPda(remitente, destinatario, mint);
    const acct = await program.account.suscripcionUsdc.fetch(pda);
    return Number(acct.contadorPagos);
  }
  const [pda] = getSuscripcionPda(remitente, destinatario);
  const acct = await program.account.suscripcion.fetch(pda);
  return Number(acct.contadorPagos);
}

/** True if Solana rejected init because the PDA account already exists. */
export function isAccountAlreadyInUseError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /already in use/i.test(msg) || /Allocate:/i.test(msg);
}

/**
 * Returns PDA if the on-chain account exists (any owner/data), else null.
 * Used to skip `init` on re-register (same keeper + destinatario [+ mint]).
 */
export async function findExistingSuscripcionPda(
  tipo: "SOL" | "USDC",
  remitente: PublicKey,
  destinatario: PublicKey,
  mint: PublicKey = USDC_MINT
): Promise<PublicKey | null> {
  const connection = getConnection();
  const [pda] =
    tipo === "USDC"
      ? getSuscripcionUsdcPda(remitente, destinatario, mint)
      : getSuscripcionPda(remitente, destinatario);
  const info = await connection.getAccountInfo(pda, "confirmed");
  return info ? pda : null;
}

/** On-chain monto (raw units) when PDA exists; null if missing/unreadable. */
export async function fetchSuscripcionMontoOnChain(
  tipo: "SOL" | "USDC",
  remitente: PublicKey,
  destinatario: PublicKey,
  mint: PublicKey = USDC_MINT
): Promise<bigint | null> {
  const program = getProgram();
  try {
    if (tipo === "USDC") {
      const [pda] = getSuscripcionUsdcPda(remitente, destinatario, mint);
      const acct = await program.account.suscripcionUsdc.fetch(pda);
      return BigInt(acct.monto.toString());
    }
    const [pda] = getSuscripcionPda(remitente, destinatario);
    const acct = await program.account.suscripcion.fetch(pda);
    return BigInt(acct.monto.toString());
  } catch {
    return null;
  }
}

/**
 * Registra suscripción SOL. usuarioRemitente = identidad composable (wallet real).
 */
export async function registrarSuscripcionOnChain(
  remitente: PublicKey,
  destinatario: PublicKey,
  monto: bigint,
  frecuencia: "diario" | "semanal" | "quincenal" | "mensual",
  usuarioRemitente?: PublicKey
): Promise<string> {
  const program = getProgram();
  const keeper = getKeeperKeypair();
  const freqMap = {
    diario: FrecuenciaAnchor.Diario,
    semanal: FrecuenciaAnchor.Semanal,
    quincenal: FrecuenciaAnchor.Quincenal,
    mensual: FrecuenciaAnchor.Mensual,
  };

  const identity = usuarioRemitente ?? keeper.publicKey;
  const montoBn = new BN(monto.toString());
  const tx = await program.methods
    .registrarSuscripcion(montoBn, freqMap[frecuencia], identity)
    .accounts({
      suscripcion: getSuscripcionPda(keeper.publicKey, destinatario)[0],
      remitente: keeper.publicKey,
      destinatario,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .transaction();

  const connection = getConnection();
  return sendAndConfirmTransaction(connection, tx, [keeper]);
}

export async function ejecutarPagoOnChain(
  remitente: PublicKey,
  destinatario: PublicKey
): Promise<PagoOnChainResult> {
  const program = getProgram();
  const keeper = getKeeperKeypair();
  const [suscripcionPda] = getSuscripcionPda(remitente, destinatario);

  const suscripcionBefore = await program.account.suscripcion.fetch(suscripcionPda);
  const nonce = Number(suscripcionBefore.contadorPagos);
  const [receiptPda] = getPagoReceiptPda(suscripcionPda, nonce);
  const [perfilRemitentePda] = getPerfilRemitentePda(suscripcionBefore.usuarioRemitente);
  const [perfilDestinatarioPda] = getPerfilDestinatarioPda(destinatario);

  const tx = await program.methods
    .ejecutarPago()
    .accounts({
      suscripcion: suscripcionPda,
      receipt: receiptPda,
      perfilRemitente: perfilRemitentePda,
      perfilDestinatario: perfilDestinatarioPda,
      remitente,
      destinatario,
      keeper: keeper.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .transaction();

  const connection = getConnection();
  const txSignature = await sendAndConfirmTransaction(connection, tx, [keeper]);
  return { txSignature, receiptPda: receiptPda.toBase58(), nonce };
}

export async function registrarSuscripcionUsdcOnChain(
  remitente: PublicKey,
  destinatario: PublicKey,
  montoRaw: bigint,
  frecuencia: "diario" | "semanal" | "quincenal" | "mensual",
  mint: PublicKey = USDC_MINT,
  usuarioRemitente?: PublicKey
): Promise<string> {
  const program = getProgram();
  const keeper = getKeeperKeypair();
  const freqMap = {
    diario: FrecuenciaAnchor.Diario,
    semanal: FrecuenciaAnchor.Semanal,
    quincenal: FrecuenciaAnchor.Quincenal,
    mensual: FrecuenciaAnchor.Mensual,
  };

  const identity = usuarioRemitente ?? keeper.publicKey;
  const montoBn = new BN(montoRaw.toString());
  const tx = await program.methods
    .registrarSuscripcionUsdc(montoBn, freqMap[frecuencia], identity)
    .accounts({
      suscripcionUsdc: getSuscripcionUsdcPda(keeper.publicKey, destinatario, mint)[0],
      remitente: keeper.publicKey,
      destinatario,
      mint,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .transaction();

  const connection = getConnection();
  return sendAndConfirmTransaction(connection, tx, [keeper]);
}

export async function ejecutarPagoUsdcOnChain(
  remitente: PublicKey,
  destinatario: PublicKey,
  mint: PublicKey = USDC_MINT
): Promise<PagoOnChainResult> {
  const program = getProgram();
  const keeper = getKeeperKeypair();
  const [suscripcionPda] = getSuscripcionUsdcPda(remitente, destinatario, mint);

  const suscripcionBefore = await program.account.suscripcionUsdc.fetch(suscripcionPda);
  const nonce = Number(suscripcionBefore.contadorPagos);
  const [receiptPda] = getPagoReceiptPda(suscripcionPda, nonce);
  const [perfilRemitentePda] = getPerfilRemitentePda(suscripcionBefore.usuarioRemitente);
  const [perfilDestinatarioPda] = getPerfilDestinatarioPda(destinatario);

  const sourceAta = getAssociatedTokenAddressSync(mint, keeper.publicKey);
  const destAta = getAssociatedTokenAddressSync(mint, destinatario);

  const createAtaIx = createAssociatedTokenAccountIdempotentInstruction(
    keeper.publicKey,
    destAta,
    destinatario,
    mint
  );

  const ix = await program.methods
    .ejecutarPagoUsdc()
    .accounts({
      suscripcionUsdc: suscripcionPda,
      receipt: receiptPda,
      perfilRemitente: perfilRemitentePda,
      perfilDestinatario: perfilDestinatarioPda,
      sourceTokenAccount: sourceAta,
      destTokenAccount: destAta,
      authority: keeper.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();

  const tx = new Transaction().add(createAtaIx, ix);

  const connection = getConnection();
  const txSignature = await sendAndConfirmTransaction(connection, tx, [keeper]);
  return { txSignature, receiptPda: receiptPda.toBase58(), nonce };
}
