"use client";

import { useState, useEffect, useRef } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import TransactionModal from "@/components/TransactionModal";
import BalanceCard from "@/components/BalanceCard";
import RecentTransactions from "@/components/RecentTransactions";
import Header from "@/components/Header";
import QuickCommands from "@/components/QuickCommands";

export type AppView = "home" | "history" | "contacts";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pendingTx, setPendingTx] = useState<{
    type: "send" | "bridge";
    amount: string;
    token: string;
    recipient: string;
    chain?: string;
  } | null>(null);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [walletConnected, setWalletConnected] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [processingVoice, setProcessingVoice] = useState(false);

  // Simulated voice command parser
  const parseVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    setProcessingVoice(true);
    setAiResponse("");

    setTimeout(() => {
      if (lower.includes("send") || lower.includes("transfer") || lower.includes("pay")) {
        const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
        const tokenMatch = text.match(/\b(sol|usdc|usdt|eth)\b/i);
        const toMatch = text.match(/to\s+(\w+)/i);
        
        setPendingTx({
          type: "send",
          amount: amountMatch ? amountMatch[1] : "10",
          token: tokenMatch ? tokenMatch[1].toUpperCase() : "USDC",
          recipient: toMatch ? toMatch[1] : "Alice",
        });
        setAiResponse(`Got it! I'll prepare a transfer of ${amountMatch ? amountMatch[1] : "10"} ${tokenMatch ? tokenMatch[1].toUpperCase() : "USDC"} to ${toMatch ? toMatch[1] : "Alice"}.`);
        setTimeout(() => setShowModal(true), 800);
      } else if (lower.includes("bridge")) {
        const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
        const tokenMatch = text.match(/\b(sol|usdc|usdt|eth)\b/i);
        const fromMatch = text.match(/from\s+(\w+)/i);

        setPendingTx({
          type: "bridge",
          amount: amountMatch ? amountMatch[1] : "100",
          token: tokenMatch ? tokenMatch[1].toUpperCase() : "USDC",
          recipient: "Your Solana Wallet",
          chain: fromMatch ? fromMatch[1] : "Ethereum",
        });
        setAiResponse(`Preparing to bridge ${amountMatch ? amountMatch[1] : "100"} ${tokenMatch ? tokenMatch[1].toUpperCase() : "USDC"} from ${fromMatch ? fromMatch[1] : "Ethereum"} to Solana via LiFi.`);
        setTimeout(() => setShowModal(true), 800);
      } else if (lower.includes("balance") || lower.includes("how much")) {
        setAiResponse("Your current balance: 4.28 SOL ($523.40), 245.00 USDC, 0.012 ETH");
      } else if (lower.includes("transaction") || lower.includes("history") || lower.includes("recent")) {
        setAiResponse("Showing your recent transactions...");
        setActiveView("history");
      } else {
        setAiResponse("I heard you! Try saying 'Send 10 USDC to Alice', 'Bridge 100 USDC from Ethereum', or 'What's my balance?'");
      }
      setProcessingVoice(false);
    }, 1200);
  };

  const handleQuickCommand = (cmd: string) => {
    setTranscript(cmd);
    parseVoiceCommand(cmd);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background orbs */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          right: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(153,69,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-10%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,241,149,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header
          walletConnected={walletConnected}
          onConnectWallet={() => setWalletConnected(!walletConnected)}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <main
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "24px 20px 80px",
          }}
        >
          {activeView === "home" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 340px",
                gap: "24px",
                alignItems: "start",
              }}
              className="main-grid"
            >
              {/* Left column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Voice section */}
                <div
                  style={{
                    borderRadius: "24px",
                    padding: "48px 40px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="glass"
                >
                  {/* Card inner glow */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "200px",
                      height: "1px",
                      background: "linear-gradient(90deg, transparent, var(--solana-green), transparent)",
                    }}
                  />

                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      color: "var(--solana-green)",
                      textTransform: "uppercase",
                      marginBottom: "12px",
                    }}
                  >
                    Voice Interface
                  </p>
                  <h1
                    className="font-display gradient-text"
                    style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "8px" }}
                  >
                    Just Speak Your Intent
                  </h1>
                  <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "40px" }}>
                    AI handles the rest — payments, bridging, queries
                  </p>

                  <VoiceOrb
                    isListening={isListening}
                    onToggle={setIsListening}
                    onTranscript={(t) => {
                      setTranscript(t);
                      parseVoiceCommand(t);
                    }}
                    processing={processingVoice}
                  />

                  {/* Transcript display */}
                  {transcript && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "16px 20px",
                        borderRadius: "14px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        textAlign: "left",
                      }}
                      className="animate-fade-in"
                    >
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        🎤 You said
                      </p>
                      <p style={{ color: "var(--text-primary)", fontSize: "16px", fontStyle: "italic" }}>
                        "{transcript}"
                      </p>
                    </div>
                  )}

                  {/* AI Response */}
                  {(aiResponse || processingVoice) && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "16px 20px",
                        borderRadius: "14px",
                        background: "rgba(20, 241, 149, 0.06)",
                        border: "1px solid rgba(20, 241, 149, 0.15)",
                        textAlign: "left",
                      }}
                      className="animate-fade-in"
                    >
                      <p style={{ fontSize: "12px", color: "var(--solana-green)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        🤖 AI Agent
                      </p>
                      {processingVoice ? (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "var(--solana-green)",
                                animation: `blink 1.2s ${i * 0.2}s infinite`,
                                opacity: 0.7,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: "var(--text-primary)", fontSize: "15px" }}>{aiResponse}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Commands */}
                <QuickCommands onSelect={handleQuickCommand} />
              </div>

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <BalanceCard walletConnected={walletConnected} />
                <RecentTransactions compact />
              </div>
            </div>
          )}

          {activeView === "history" && (
            <div className="animate-fade-in">
              <h2
                className="font-display"
                style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}
              >
                Transaction History
              </h2>
              <RecentTransactions compact={false} />
            </div>
          )}

          {activeView === "contacts" && (
            <div className="animate-fade-in">
              <h2
                className="font-display"
                style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}
              >
                Contacts
              </h2>
              <ContactsView />
            </div>
          )}
        </main>
      </div>

      {showModal && pendingTx && (
        <TransactionModal
          tx={pendingTx}
          onConfirm={() => {
            setShowModal(false);
            setAiResponse("✅ Transaction submitted successfully! Awaiting confirmation on Solana...");
          }}
          onCancel={() => {
            setShowModal(false);
            setAiResponse("Transaction cancelled.");
          }}
        />
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function ContactsView() {
  const contacts = [
    { name: "Alice", address: "7x3kN...9mPq", avatar: "🧑" },
    { name: "Sarah", address: "Ht9pL...4rKq", avatar: "👩" },
    { name: "John", address: "BcD3m...7sNp", avatar: "🧔" },
    { name: "Mom", address: "9xKqL...2mRt", avatar: "👵" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {contacts.map((c) => (
        <div
          key={c.name}
          className="glass glass-hover"
          style={{
            borderRadius: "16px",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(20,241,149,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              {c.avatar}
            </div>
            <div>
              <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "15px" }}>{c.name}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", fontFamily: "monospace" }}>{c.address}</p>
            </div>
          </div>
          <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "8px" }}>
            Send
          </button>
        </div>
      ))}
    </div>
  );
}
