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

// Frecuencia enum (debe coincidir con el programa)
export const FrecuenciaAnchor = {
  Desconocida: { desconocida: {} },
  Diario: { diario: {} },
  Semanal: { semanal: {} },
  Mensual: { mensual: {} },
} as const;

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
  const key = process.env.KEEPER_PRIVATE_KEY;
  if (!key) throw new Error("KEEPER_PRIVATE_KEY no configurada");
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

/**
 * Deriva el PDA de una suscripción
 */
export function getSuscripcionPda(
  remitente: PublicKey,
  destinatario: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("suscripcion"), remitente.toBuffer(), destinatario.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Registra una suscripción en el programa Anchor.
 * MVP: keeper actúa como remitente (custodial). Los fondos salen del keeper.
 */
export async function registrarSuscripcionOnChain(
  remitente: PublicKey,
  destinatario: PublicKey,
  monto: bigint,
  frecuencia: "diario" | "semanal" | "mensual"
): Promise<string> {
  const program = getProgram();
  const keeper = getKeeperKeypair();
  const freqMap = {
    diario: FrecuenciaAnchor.Diario,
    semanal: FrecuenciaAnchor.Semanal,
    mensual: FrecuenciaAnchor.Mensual,
  };

  // Keeper = remitente on-chain (modelo custodial para MVP)
  const tx = await program.methods
    .registrarSuscripcion(monto, freqMap[frecuencia])
    .accounts({
      suscripcion: getSuscripcionPda(keeper.publicKey, destinatario)[0],
      remitente: keeper.publicKey,
      destinatario,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .transaction();

  const connection = getConnection();
  const sig = await sendAndConfirmTransaction(connection, tx, [keeper]);
  return sig;
}

/**
 * Ejecuta un pago en el programa Anchor (keeper)
 */
export async function ejecutarPagoOnChain(
  remitente: PublicKey,
  destinatario: PublicKey
): Promise<string> {
  const program = getProgram();
  const [suscripcionPda] = getSuscripcionPda(remitente, destinatario);

  const tx = await program.methods
    .ejecutarPago()
    .accounts({
      suscripcion: suscripcionPda,
      remitente,
      destinatario,
      keeper: getKeeperKeypair().publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .transaction();

  const keeper = getKeeperKeypair();
  const connection = getConnection();
  const sig = await sendAndConfirmTransaction(connection, tx, [keeper]);
  return sig;
}
