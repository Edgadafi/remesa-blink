"use client";

import { useBalance, useWalletConnection } from "@solana/react-hooks";

function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function lamportsToSol(lamports: bigint | null | undefined): string {
  if (lamports == null) return "—";
  const sol = Number(lamports) / 1e9;
  return sol.toFixed(4);
}

export function WalletConnect() {
  const { connectors, connect, disconnect, wallet, status, currentConnector } =
    useWalletConnection();
  const address = wallet?.account.address?.toString();
  const balance = useBalance(address);

  if (status === "connected" && address) {
    return (
      <div className="wallet-panel">
        <span className="wallet-meta" title={address}>
          {currentConnector?.name ?? "Wallet"} · {shortAddress(address)} ·{" "}
          {lamportsToSol(balance.lamports)} SOL
        </span>
        <button type="button" className="btn-wallet" onClick={() => disconnect()}>
          Desconectar
        </button>
      </div>
    );
  }

  if (connectors.length === 0) {
    return (
      <p className="wallet-hint">
        Instala Phantom, Solflare o Backpack (devnet).
      </p>
    );
  }

  return (
    <div className="wallet-panel">
      {connectors.map((c) => (
        <button
          key={c.id}
          type="button"
          className="btn-wallet"
          onClick={() => connect(c.id)}
        >
          Conectar {c.name}
        </button>
      ))}
    </div>
  );
}

/** Dirección conectada para rellenar formularios (null si no hay wallet). */
export function useConnectedAddress(): string | null {
  const { wallet, status } = useWalletConnection();
  if (status !== "connected" || !wallet?.account.address) return null;
  return wallet.account.address.toString();
}
