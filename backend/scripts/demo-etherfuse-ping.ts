import "dotenv/config";

async function main() {
  const base = process.env.ETHERFUSE_API_URL || "";
  const key = process.env.ETHERFUSE_API_KEY || "";
  console.log("etherfuse_url", base);
  console.log("key_len", key.length);
  try {
    const r = await fetch(`${base}/health`, {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
    });
    console.log("etherfuse_health_status", r.status);
    const t = await r.text();
    console.log("body_prefix", t.slice(0, 120));
  } catch (e) {
    console.log("etherfuse_fetch_err", e instanceof Error ? e.message : e);
  }
}

main();
