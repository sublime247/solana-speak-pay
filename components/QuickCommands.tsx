"use client";

interface QuickCommandsProps {
  onSelect: (cmd: string) => void;
}

const COMMANDS = [
  { label: "Send USDC", cmd: "Send 10 USDC to Alice", icon: "💸", color: "#14f195" },
  { label: "Check Balance", cmd: "What's my balance?", icon: "💰", color: "#9945ff" },
  { label: "Bridge ETH", cmd: "Bridge 100 USDC from Ethereum", icon: "🌉", color: "#4da8ff" },
  { label: "Transactions", cmd: "Show my recent transactions", icon: "📋", color: "#ff9f43" },
  { label: "Send SOL", cmd: "Transfer 5 SOL to Sarah", icon: "◎", color: "#a29bfe" },
  { label: "Add Contact", cmd: "Save this address as John", icon: "👤", color: "#fd79a8" },
];

export default function QuickCommands({ onSelect }: QuickCommandsProps) {
  return (
    <div
      className="glass"
      style={{
        borderRadius: "20px",
        padding: "24px",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "16px",
        }}
      >
        ⚡ Quick Commands
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {COMMANDS.map((item) => (
          <button
            key={item.cmd}
            id={`quick-cmd-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => onSelect(item.cmd)}
            style={{
              padding: "14px 12px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.03)",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s ease",
              fontFamily: "Inter, sans-serif",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${item.color}12`;
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${item.color}40`;
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "22px" }}>{item.icon}</span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
