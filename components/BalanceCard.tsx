"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getTokenBalances, TokenBalance } from "@/lib/solana/wallet";

export default function BalanceCard() {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  // Always call hooks - React requirement
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch balances when wallet connects and component is mounted
  useEffect(() => {
    if (mounted && connected && publicKey) {
      fetchBalances();
    } else {
      setBalances([]);
    }
  }, [mounted, connected, publicKey]);

  const fetchBalances = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const tokenBalances = await getTokenBalances(connection, publicKey);
      setBalances(tokenBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalUsd = balances.reduce((sum, t) => sum + parseFloat(t.usd), 0).toFixed(2);

  return (
    <div
      className="glass"
      style={{
        borderRadius: "20px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, var(--solana-purple), var(--solana-green))",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
            Portfolio Balance
          </p>
          {connected ? (
            loading ? (
              <div
                style={{
                  width: "120px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading...</span>
              </div>
            ) : (
              <p
                className="font-display"
                style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}
              >
                ${totalUsd}
              </p>
            )
          ) : (
            <div
              style={{
                width: "120px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Connect wallet</span>
            </div>
          )}
        </div>
        <button
          id="refresh-balance-btn"
          onClick={() => {
            if (connected) {
              fetchBalances();
            } else {
              setExpanded(!expanded);
            }
          }}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            border: "1px solid var(--border-subtle)",
            background: "rgba(255,255,255,0.04)",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "16px",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={connected ? "Refresh balance" : "Expand balance"}
        >
          {connected ? "🔄" : expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Token list */}
      {connected && balances.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {(expanded ? balances : balances.slice(0, 2)).map((token) => (
            <div
              key={token.symbol}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${token.color}20`,
                    border: `1px solid ${token.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: token.color,
                    fontFamily: "monospace",
                  }}
                >
                  {token.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{token.symbol}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>{token.name}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>
                  {token.amount}
                </p>
                <p style={{ fontSize: "12px", color: token.positive ? "var(--solana-green)" : "#ff6b6b" }}>
                  {token.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!expanded && balances.length > 2 && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "8px",
            borderRadius: "10px",
            border: "1px dashed rgba(255,255,255,0.1)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "all 0.2s ease",
          }}
        >
          +{balances.length - 2} more {balances.length - 2 === 1 ? "token" : "tokens"}
        </button>
      )}
    </div>
  );
}
