"use client";

// Polyfills MUST be imported first — they intercept the Wallet Standard
// registry before wallet extensions register, and provide Buffer/process globals
import "@/lib/solana/polyfills";
import { ReactNode } from "react";
import { SolanaWalletProvider } from "@/lib/solana/WalletProvider";

export function Providers({ children }: { children: ReactNode }) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
