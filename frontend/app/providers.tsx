"use client";

import { SolanaProvider } from "@solana/react-hooks";
import { solanaClient } from "@/lib/solana-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SolanaProvider client={solanaClient}>{children}</SolanaProvider>;
}
