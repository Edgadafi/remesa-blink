import { autoDiscover, createClient, filterByNames, resolveCluster } from "@solana/client";

function getClusterConfig() {
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  if (rpc) {
    const ws =
      process.env.NEXT_PUBLIC_SOLANA_WS_URL?.trim() ??
      rpc.replace("https://", "wss://").replace("http://", "ws://");
    return { endpoint: rpc, websocketEndpoint: ws };
  }
  const cluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER?.trim() || "devnet") as
    | "devnet"
    | "mainnet"
    | "testnet"
    | "localnet";
  return resolveCluster({ moniker: cluster });
}

const { endpoint, websocketEndpoint } = getClusterConfig();

export const solanaClient = createClient({
  endpoint,
  websocketEndpoint,
  walletConnectors: autoDiscover({
    filter: filterByNames("phantom", "solflare", "backpack"),
  }),
});

export { endpoint as solanaRpcEndpoint };
