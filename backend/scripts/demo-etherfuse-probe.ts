/**
 * Try quote/order using partner org + real bank accounts (sandbox).
 */
import "dotenv/config";
import { randomUUID } from "crypto";

const BASE = process.env.ETHERFUSE_API_URL!;
const KEY = process.env.ETHERFUSE_API_KEY!;

async function ef(path: string, init?: RequestInit) {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: KEY,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await r.text();
  console.log(path, r.status, text.slice(0, 500));
  return { status: r.status, text, json: (() => { try { return JSON.parse(text); } catch { return null; } })() };
}

async function main() {
  const org = await ef("/ramp");
  const orgId = org.json?.org_id as string;
  console.log("orgId", orgId);

  await ef("/ramp/bank-accounts", { method: "GET" });
  await ef("/ramp/bank-accounts", {
    method: "POST",
    body: JSON.stringify({ pageSize: 10, pageNumber: 0 }),
  });

  // Try quote as own org
  const quoteId = randomUUID();
  const quote = await ef("/ramp/quote", {
    method: "POST",
    body: JSON.stringify({
      quoteId,
      customerId: orgId,
      blockchain: "solana",
      quoteAssets: {
        type: "offramp",
        sourceAsset: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        targetAsset: "MXN",
      },
      sourceAmount: "10",
    }),
  });

  // Onboarding with userInfo
  const customerId = randomUUID();
  const bankAccountId = randomUUID();
  await ef("/ramp/onboarding-url", {
    method: "POST",
    body: JSON.stringify({
      customerId,
      bankAccountId,
      publicKey: "5HopANGJo1yjUx8o6RCdt2CCNXqYep23r4fUb2XKtQ5x",
      blockchain: "solana",
      userInfo: {
        email: "piloto+5hop@remesatia.test",
        displayName: "Piloto Remesa",
      },
    }),
  });
}

main();
