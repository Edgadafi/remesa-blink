/**
 * Fondea keeper con ≥ N USDC en devnet para demo ($1,000+).
 *
 * 1) Transfiere desde FUNDER_PRIVATE_KEY si hay saldo (mint Circle devnet).
 * 2) Si falta: mint en USDC de prueba local (mint propio) y actualiza USDC_MINT en .env.
 *
 * Uso: npx tsx scripts/fund-keeper-usdc-demo.ts --amount 1000
 */
import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createMint,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  transfer,
} from "@solana/spl-token";
import bs58 from "bs58";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = join(__dirname, "..");
const ENV_PATH = join(BACKEND_ROOT, ".env");
const MINT_STORE = join(BACKEND_ROOT, ".devnet-test-usdc-mint.json");

const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const CIRCLE_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

function loadKeypair(envName: string): Keypair {
  const raw = process.env[envName];
  if (!raw) throw new Error(`${envName} no definida`);
  try {
    return Keypair.fromSecretKey(bs58.decode(raw));
  } catch {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
  }
}

function parseAmountArg(): number {
  const i = process.argv.indexOf("--amount");
  const n = i >= 0 ? parseFloat(process.argv[i + 1] ?? "") : 1000;
  if (!Number.isFinite(n) || n <= 0) throw new Error("--amount inválido");
  return n;
}

async function usdcBalance(
  conn: Connection,
  mint: PublicKey,
  owner: PublicKey
): Promise<number> {
  const ata = getAssociatedTokenAddressSync(mint, owner);
  try {
    const acc = await getAccount(conn, ata);
    return Number(acc.amount) / 1e6;
  } catch {
    return 0;
  }
}

async function ensureTestMint(
  conn: Connection,
  payer: Keypair
): Promise<{ mint: PublicKey; authority: Keypair }> {
  if (existsSync(MINT_STORE)) {
    const authority = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(readFileSync(MINT_STORE, "utf8")) as number[])
    );
    return { mint: authority.publicKey, authority };
  }

  const mintKp = Keypair.generate();
  await createMint(
    conn,
    payer,
    mintKp.publicKey,
    mintKp.publicKey,
    6,
    mintKp
  );
  writeFileSync(MINT_STORE, JSON.stringify(Array.from(mintKp.secretKey)));
  console.log("   Mint de prueba creado:", mintKp.publicKey.toBase58());
  console.log("   Guardado en:", MINT_STORE);
  return { mint: mintKp.publicKey, authority: mintKp };
}

function upsertEnvUsdcMint(mint: string) {
  const line = `USDC_MINT=${mint}`;
  if (!existsSync(ENV_PATH)) {
    writeFileSync(ENV_PATH, `${line}\n`, "utf8");
    return;
  }
  const raw = readFileSync(ENV_PATH, "utf8");
  if (/^USDC_MINT=/m.test(raw)) {
    writeFileSync(
      ENV_PATH,
      raw.replace(/^USDC_MINT=.*$/m, line),
      "utf8"
    );
  } else {
    writeFileSync(ENV_PATH, `${raw.trimEnd()}\n${line}\n`, "utf8");
  }
}

async function mintToKeeper(
  conn: Connection,
  payer: Keypair,
  mint: PublicKey,
  authority: Keypair,
  keeper: PublicKey,
  amount: number
) {
  const ata = getAssociatedTokenAddressSync(mint, keeper);
  const tx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey,
      ata,
      keeper,
      mint
    ),
    createMintToInstruction(
      mint,
      ata,
      authority.publicKey,
      BigInt(Math.round(amount * 1e6))
    )
  );
  const sig = await sendAndConfirmTransaction(conn, tx, [payer, authority]);
  console.log("   Mint tx:", sig);
}

async function transferFromFunder(
  conn: Connection,
  funder: Keypair,
  keeper: PublicKey,
  mint: PublicKey,
  amount: number
) {
  const from = getAssociatedTokenAddressSync(mint, funder.publicKey);
  const to = getAssociatedTokenAddressSync(mint, keeper);
  const tx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      funder.publicKey,
      to,
      keeper,
      mint
    )
  );
  await sendAndConfirmTransaction(conn, tx, [funder]);
  const sig = await transfer(
    conn,
    funder,
    from,
    to,
    funder.publicKey,
    BigInt(Math.round(amount * 1e6))
  );
  console.log("   Transfer tx:", sig);
}

async function main() {
  const target = parseAmountArg();
  const conn = new Connection(RPC, "confirmed");
  const keeper = loadKeypair("KEEPER_PRIVATE_KEY");
  const circleMint = new PublicKey(process.env.USDC_MINT || CIRCLE_DEVNET);

  console.log("=== Fondeo keeper demo devnet ===");
  console.log("Target USDC:", target);
  console.log("Keeper:", keeper.publicKey.toBase58());
  console.log("Mint activo (.env):", circleMint.toBase58());

  let bal = await usdcBalance(conn, circleMint, keeper.publicKey);
  console.log("Balance actual:", bal, "USDC");

  if (bal >= target) {
    console.log("\n=== Ya tienes suficiente USDC — nada que hacer ===");
    return;
  }

  let need = target - bal;

  if (process.env.FUNDER_PRIVATE_KEY) {
    try {
      const funder = loadKeypair("FUNDER_PRIVATE_KEY");
      const fBal = await usdcBalance(conn, circleMint, funder.publicKey);
      console.log("\nFunder:", funder.publicKey.toBase58(), "USDC:", fBal);
      if (fBal > 0) {
        const xfer = Math.min(need, fBal);
        console.log(`Transfiriendo ${xfer} USDC desde funder…`);
        await transferFromFunder(conn, funder, keeper.publicKey, circleMint, xfer);
        bal = await usdcBalance(conn, circleMint, keeper.publicKey);
        need = Math.max(0, target - bal);
      }
    } catch (e) {
      console.warn("FUNDER_PRIVATE_KEY omitido:", (e as Error).message);
    }
  }

  if (need <= 0) {
    console.log("\n=== Fondeo OK (Circle USDC) ===");
    console.log("Balance:", bal, "USDC");
    return;
  }

  console.log(
    `\nFaltan ${need} USDC en mint Circle — mint de prueba devnet (+ buffer 200)…`
  );
  console.log("(Circle faucet ≈20 USDC / 2 h; esto es normal en devnet.)");

  const { mint: testMint, authority } = await ensureTestMint(conn, keeper);

  const toMint = need + 200;
  await mintToKeeper(conn, keeper, testMint, authority, keeper.publicKey, toMint);

  upsertEnvUsdcMint(testMint.toBase58());
  console.log("\n   USDC_MINT actualizado en backend/.env");

  const newBal = await usdcBalance(conn, testMint, keeper.publicKey);
  console.log("\n=== Fondeo OK (mint de prueba) ===");
  console.log("Nuevo mint:", testMint.toBase58());
  console.log("Balance keeper:", newBal, "USDC");
  console.log("\nReinicia backend + bot para cargar USDC_MINT:");
  console.log("  cd backend && npm run dev");
  console.log("  cd bot && npm start");
  console.log("\nDemo: wallet NUEVA + enviar ahora 1000");
}

main().catch((e) => {
  console.error("\nFondeo falló:", e instanceof Error ? e.message : e);
  process.exit(1);
});
