"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getTokenBalances, TokenBalance } from "@/lib/solana/wallet";

export default function BalanceCard() {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const fetchBalances = useCallback(async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const tokens = await getTokenBalances(connection, publicKey);
      setBalances(tokens);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch balances when wallet connects and component is mounted
  useEffect(() => {
    if (mounted && connected && publicKey) {
      setTimeout(() => fetchBalances(), 0);
    } else {
      const timer = setTimeout(() => setBalances([]), 0);
      return () => clearTimeout(timer);
    }
  }, [mounted, connected, publicKey, fetchBalances]);

  const totalUsd = balances.reduce((sum, t) => sum + parseFloat(t.usd), 0).toFixed(2);

  if (!mounted) return null;

  return (
    <div className="glass card-shine" style={{ 
      padding: "24px", 
      borderRadius: "24px", 
      background: "rgba(255, 255, 255, 0.03)", 
      border: "1px solid var(--border-subtle)",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Portfolio Value</p>
          <h2 className="font-display" style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-1px" }}>
            ${connected ? totalUsd : "0.00"}
          </h2>
        </div>
        <div style={{ padding: "8px", background: "rgba(20, 241, 149, 0.1)", borderRadius: "12px", color: "var(--solana-green)", fontSize: "18px" }}>
          📈
        </div>
      </div>

      {!connected ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>Connect your wallet to see your assets</p>
          <div className="wallet-adapter-sidebar">
            <WalletMultiButton />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {loading && balances.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Updating balances...</div>
          ) : (
            balances.map((token) => (
              <div key={token.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    {token.symbol === "SOL" ? "☀️" : "💵"}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600 }}>{token.symbol}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{token.amount} {token.symbol}</p>
                  </div>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 600 }}>${token.usd}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
