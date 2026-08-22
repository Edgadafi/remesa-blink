import { Keypair } from "@solana/web3.js";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const kp = Keypair.generate();
const dir = join(__dirname, "..", ".demo-wallets");
mkdirSync(dir, { recursive: true });
const base = join(dir, "demo-1000-2026-08-22");
writeFileSync(`${base}.json`, JSON.stringify(Array.from(kp.secretKey)));
writeFileSync(`${base}.pub.txt`, kp.publicKey.toBase58());
console.log(kp.publicKey.toBase58());
