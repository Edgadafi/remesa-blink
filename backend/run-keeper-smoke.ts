#!/usr/bin/env npx tsx
/**
 * Smoke test del keeper: pubkey, balance devnet, una pasada de pagos.
 * Uso: npm run keeper:smoke
 */
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

function loadKeypair(): Keypair {
  const key = process.env.KEEPER_PRIVATE_KEY || process.env.SOLANA_PRIVATE_KEY;
  if (!key) throw new Error("KEEPER_PRIVATE_KEY o SOLANA_PRIVATE_KEY no definida");
  try {
    return Keypair.fromSecretKey(bs58.decode(key));
  } catch {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(key) as number[]));
  }
}

async function main() {
  const kp = loadKeypair();
  const rpc = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const conn = new Connection(rpc, "confirmed");
  const bal = await conn.getBalance(kp.publicKey);

  console.log("=== Keeper smoke ===");
  console.log("Pubkey:", kp.publicKey.toBase58());
  console.log("RPC:", rpc);
  console.log("Balance:", (bal / LAMPORTS_PER_SOL).toFixed(6), "SOL");

  if (!process.env.DATABASE_URL) {
    console.warn("WARN: DATABASE_URL no definida — omitiendo keeper:run-once");
    process.exit(1);
  }

  const { ejecutarPagos } = await import("./src/keeper/cron.js");
  await ejecutarPagos();
  console.log("=== Smoke OK (keeper ejecutado) ===");
}

main().catch((e) => {
  console.error("Smoke falló:", e instanceof Error ? e.message : e);
  process.exit(1);
});
