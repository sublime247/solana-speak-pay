"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getTransactionHistory } from "@/lib/solana/wallet";

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  send: { icon: "↑", color: "#ff6b6b", bg: "rgba(255,107,107,0.1)" },
  receive: { icon: "↓", color: "#14f195", bg: "rgba(20,241,149,0.1)" },
  transfer: { icon: "⇄", color: "#4da8ff", bg: "rgba(77,168,255,0.1)" },
};

interface RecentTransactionsProps {
  compact: boolean;
}

export default function RecentTransactions({ compact }: RecentTransactionsProps) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setTransactions([]);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const history = await getTransactionHistory(connection, publicKey, compact ? 3 : 10);
        setTransactions(history);
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // Refresh history every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [connected, publicKey, connection, compact]);

  if (!connected) {
    return (
      <div className="glass" style={{ borderRadius: "20px", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Connect wallet to see activity</p>
      </div>
    );
  }

  return (
    <div
      className="glass"
      style={{
        borderRadius: "20px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          📋 {loading ? "Loading..." : "Recent activity"}
        </p>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {transactions.length} total
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {transactions.length === 0 && !loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "20px" }}>
            No recent transactions found
          </p>
        ) : (
          transactions.map((tx) => {
            const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.transfer;
            return (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: cfg.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: cfg.color,
                    flexShrink: 0,
                    marginRight: "12px",
                  }}
                >
                  {cfg.icon}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontFamily: "monospace"
                    }}
                  >
                    {tx.id.slice(0, 12)}...
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    {tx.date} · {tx.time}
                  </p>
                </div>

                {/* Amount */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      color: tx.status === "failed" ? "#ff6b6b" : "var(--text-primary)",
                    }}
                  >
                    {tx.status === "completed" ? "Finalized" : tx.status}
                  </p>
                  <a 
                    href={`https://explorer.solana.com/tx/${tx.id}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--solana-green)", fontSize: "10px", textDecoration: "underline" }}
                  >
                    View
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {compact && transactions.length > 0 && (
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "12px" }} />
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Live data from <span style={{ color: "var(--solana-green)" }}>Devnet</span>
          </p>
        </div>
      )}
    </div>
  );
}
