"use client";

const TRANSACTIONS = [
  {
    id: "tx1",
    type: "send",
    token: "USDC",
    amount: "-25.00",
    usd: "25.00",
    recipient: "Alice",
    address: "7x3kN...9mPq",
    time: "2 min ago",
    status: "confirmed",
  },
  {
    id: "tx2",
    type: "bridge",
    token: "USDC",
    amount: "+100.00",
    usd: "100.00",
    recipient: "From Ethereum",
    address: "via LiFi",
    time: "1 hr ago",
    status: "confirmed",
  },
  {
    id: "tx3",
    type: "send",
    token: "SOL",
    amount: "-1.5",
    usd: "183.30",
    recipient: "Sarah",
    address: "Ht9pL...4rKq",
    time: "3 hrs ago",
    status: "confirmed",
  },
  {
    id: "tx4",
    type: "receive",
    token: "USDC",
    amount: "+50.00",
    usd: "50.00",
    recipient: "From John",
    address: "BcD3m...7sNp",
    time: "Yesterday",
    status: "confirmed",
  },
  {
    id: "tx5",
    type: "bridge",
    token: "ETH",
    amount: "+0.02",
    usd: "63.80",
    recipient: "From Polygon",
    address: "via LiFi",
    time: "2 days ago",
    status: "confirmed",
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  send: { icon: "↑", color: "#ff6b6b", bg: "rgba(255,107,107,0.1)" },
  receive: { icon: "↓", color: "#14f195", bg: "rgba(20,241,149,0.1)" },
  bridge: { icon: "⇄", color: "#4da8ff", bg: "rgba(77,168,255,0.1)" },
};

interface RecentTransactionsProps {
  compact: boolean;
}

export default function RecentTransactions({ compact }: RecentTransactionsProps) {
  const txs = compact ? TRANSACTIONS.slice(0, 3) : TRANSACTIONS;

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
          📋 Recent
        </p>
        {compact && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {TRANSACTIONS.length} total
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {txs.map((tx) => {
          const cfg = TYPE_CONFIG[tx.type];
          const isPositive = tx.amount.startsWith("+");
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
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
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
                  }}
                >
                  {tx.recipient}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  {tx.address} · {tx.time}
                </p>
              </div>

              {/* Amount */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    color: isPositive ? "var(--solana-green)" : "var(--text-primary)",
                    fontFamily: "monospace",
                  }}
                >
                  {tx.amount} {tx.token}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>${tx.usd}</p>
              </div>
            </div>
          );
        })}
      </div>

      {compact && (
        <div
          style={{
            marginTop: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              height: "1px",
              background: "var(--border-subtle)",
              marginBottom: "12px",
            }}
          />
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Say <span style={{ color: "var(--solana-green)", fontStyle: "italic" }}>"Show my transactions"</span> for full history
          </p>
        </div>
      )}
    </div>
  );
}
