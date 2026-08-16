"use client";

import { useEffect, useState, type ComponentType } from "react";

/**
 * Wallet adapters stay off the hub critical path. Copy paints first;
 * Phantom/Solflare hydrate after idle.
 */
export function DeferredWallet() {
  const [Slot, setSlot] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void Promise.all([import("@/app/providers"), import("@/components/WalletConnect")]).then(
        ([{ Providers }, { WalletConnect }]) => {
          if (cancelled) return;
          function WalletSlot() {
            return (
              <Providers>
                <WalletConnect />
              </Providers>
            );
          }
          setSlot(() => WalletSlot);
        }
      );
    };
    const hasIdle = "requestIdleCallback" in window;
    const idle = hasIdle
      ? window.requestIdleCallback(load, { timeout: 4000 })
      : window.setTimeout(load, 2000);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle);
    };
  }, []);

  if (!Slot) {
    return <p className="wallet-hint">Wallet opcional</p>;
  }
  return <Slot />;
}
