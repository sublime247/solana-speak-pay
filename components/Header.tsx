"use client";

import { AppView } from "@/app/page";

interface HeaderProps {
  walletConnected: boolean;
  onConnectWallet: () => void;
  activeView: AppView;
  setActiveView: (v: AppView) => void;
}

export default function Header({ walletConnected, onConnectWallet, activeView, setActiveView }: HeaderProps) {
  const navItems: { label: string; view: AppView; icon: string }[] = [
    { label: "Home", view: "home", icon: "⚡" },
    { label: "History", view: "history", icon: "📋" },
    { label: "Contacts", view: "contacts", icon: "👥" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "0 20px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(5, 10, 20, 0.85)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--solana-green), var(--solana-purple))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 0 16px rgba(20,241,149,0.3)",
            }}
          >
            🎤
          </div>
          <div>
            <span
              className="font-display"
              style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", lineHeight: 1 }}
            >
              SolanaSpeakPay
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "var(--solana-green)",
                  boxShadow: "0 0 6px var(--solana-green)",
                }}
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>Devnet</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", gap: "4px" }}>
          {navItems.map((item) => (
            <button
              key={item.view}
              id={`nav-${item.view}`}
              onClick={() => setActiveView(item.view)}
              style={{
                padding: "7px 14px",
                borderRadius: "9px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s ease",
                background: activeView === item.view ? "rgba(20,241,149,0.12)" : "transparent",
                color: activeView === item.view ? "var(--solana-green)" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Wallet button */}
        <button
          id="connect-wallet-btn"
          onClick={onConnectWallet}
          style={{
            padding: "9px 16px",
            borderRadius: "10px",
            border: walletConnected ? "1px solid rgba(20,241,149,0.3)" : "1px solid var(--border-subtle)",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            transition: "all 0.2s ease",
            background: walletConnected ? "rgba(20,241,149,0.08)" : "rgba(255,255,255,0.04)",
            color: walletConnected ? "var(--solana-green)" : "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <span style={{ fontSize: "16px" }}>{walletConnected ? "👛" : "🔗"}</span>
          {walletConnected ? "7x3k...9mPq" : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
}
