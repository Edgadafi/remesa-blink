/**
 * Probe which sourceAsset the Etherfuse sandbox accepts for offramp.
 * Usage: npx tsx scripts/demo-quote-assets.ts [wallet]
 *
 * GET /ramp/assets requires `wallet` (+ `currency`).
 * Known good (2026-07): BXTou3… USDC (Etherfuse Devnet) → quote 200.
 */
import "dotenv/config";
import { randomUUID } from "crypto";

const BASE = process.env.ETHERFUSE_API_URL!;
const KEY = process.env.ETHERFUSE_API_KEY!;
const ORG =
  process.env.ETHERFUSE_DEMO_CUSTOMER_ID ||
  "3787b9ab-60ab-44c1-b8f8-2e19a6eed707";
const WALLET =
  process.argv[2] || "5HopANGJo1yjUx8o6RCdt2CCNXqYep23r4fUb2XKtQ5x";

async function quote(sourceAsset: string) {
  const quoteId = randomUUID();
  const r = await fetch(`${BASE}/ramp/quote`, {
    method: "POST",
    headers: { Authorization: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteId,
      customerId: ORG,
      blockchain: "solana",
      quoteAssets: { type: "offramp", sourceAsset, targetAsset: "MXN" },
      sourceAmount: "10",
    }),
  });
  const text = await r.text();
  console.log(`\n=== sourceAsset=${sourceAsset} → ${r.status}`);
  console.log(text.slice(0, 400));
  return r.status;
}

async function main() {
  const assetsUrl = `${BASE}/ramp/assets?blockchain=solana&currency=USD&wallet=${WALLET}`;
  const assets = await fetch(assetsUrl, { headers: { Authorization: KEY } });
  const assetsText = await assets.text();
  console.log("assets", assets.status, assetsText.slice(0, 1000));

  let identifiers: string[] = [];
  try {
    const parsed = JSON.parse(assetsText) as {
      assets?: { symbol?: string; identifier?: string }[];
    };
    identifiers = (parsed.assets || [])
      .filter((a) => a.identifier)
      .map((a) => a.identifier!);
    const usdc = (parsed.assets || []).find((a) => a.symbol === "USDC");
    if (usdc?.identifier) {
      console.log("\n>>> Sandbox USDC identifier:", usdc.identifier);
    }
  } catch {
    /* ignore */
  }

  const candidates = [
    ...identifiers.slice(0, 4),
    "BXTou3CvPxpFVAJvzvEZcAnRLGCHqT1LHKsFTSQft7s",
    "USDC",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  ];
  const seen = new Set<string>();
  for (const a of candidates) {
    if (seen.has(a)) continue;
    seen.add(a);
    await quote(a);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
