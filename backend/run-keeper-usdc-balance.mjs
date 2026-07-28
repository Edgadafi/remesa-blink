#!/usr/bin/env node
/**
 * Muestra balance USDC del keeper y cómo fondear en devnet.
 * Uso: npm run keeper:usdc-balance
 */
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import bs58 from "bs58";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const isDevnet = String(RPC).includes("devnet");
const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_MINT = new PublicKey(
  process.env.USDC_MINT || (isDevnet ? USDC_DEVNET : USDC_MAINNET)
);

function getKeeperKeypair() {
  const key = process.env.KEEPER_PRIVATE_KEY || process.env.SOLANA_PRIVATE_KEY;
  if (!key) throw new Error("KEEPER_PRIVATE_KEY o SOLANA_PRIVATE_KEY no definida");
  try {
    return Keypair.fromSecretKey(bs58.decode(key));
  } catch {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(key)));
  }
}

async function main() {
  const connection = new Connection(RPC);
  const keeper = getKeeperKeypair();
  const ata = getAssociatedTokenAddressSync(USDC_MINT, keeper.publicKey);

  console.log("Keeper:", keeper.publicKey.toBase58());
  console.log("USDC mint:", USDC_MINT.toBase58());
  console.log("ATA:", ata.toBase58());

  try {
    const acc = await getAccount(connection, ata);
    console.log("Balance USDC:", Number(acc.amount) / 1e6);
  } catch {
    console.log("Balance USDC: (ATA no existe — npm run keeper:usdc-ata)");
  }

  if (isDevnet) {
    console.log("\nFondear USDC devnet:");
    console.log("  1. npm run keeper:usdc-ata");
    console.log("  2. Circle faucet: https://faucet.circle.com/ (red Solana devnet)");
    console.log("  3. O transferir desde otra wallet:");
    console.log(
      `     spl-token transfer ${USDC_MINT.toBase58()} 1 ${ata.toBase58()} --url devnet --fund-recipient`
    );
    console.log("  4. npm run e2e:usdc");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
