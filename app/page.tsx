"use client";

import { useState, useEffect } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import TransactionModal from "@/components/TransactionModal";
import BalanceCard from "@/components/BalanceCard";
import RecentTransactions from "@/components/RecentTransactions";
import QuickCommands from "@/components/QuickCommands";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import ClientOnly from "@/components/ClientOnly";

export type AppView = "home" | "history" | "contacts";

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [processingVoice, setProcessingVoice] = useState(false);
  const [pendingTx, setPendingTx] = useState<any>(null);

  // Command History for the UI
  const [commandHistory, setCommandHistory] = useState<{text: string, isAi: boolean}[]>([]);

  const parseVoiceCommand = async (text: string) => {
    if (!text) return;
    setProcessingVoice(true);
    setCommandHistory(prev => [...prev, { text, isAi: false }]);

    try {
      const { parseCommand } = await import("@/lib/ai/parser");
      const result = await parseCommand(text);
      
      let finalResponse = result.response;

      if (result.action === "transfer") {
        setPendingTx({
          type: "send",
          amount: result.amount || "0",
          token: result.token || "SOL",
          recipient: result.recipient || "Unknown",
        });
        setTimeout(() => setShowModal(true), 800);
      } else if (result.action === "bridge") {
        setPendingTx({
          type: "bridge",
          amount: result.amount || "0",
          token: result.token || "USDC",
          recipient: publicKey?.toString() || "Your Solana Wallet",
          chain: result.fromChain || "Ethereum",
        });
        setTimeout(() => setShowModal(true), 800);
      } else if (result.action === "query_balance") {
        try {
          const { getSolBalance, getTokenBalances } = await import("@/lib/solana/wallet");
          const sol = await getSolBalance(connection, publicKey!);
          const tokens = await getTokenBalances(connection, publicKey!);
          const usdc = tokens.find(t => t.symbol === "USDC")?.amount || "0";
          finalResponse = `You have ${sol.toFixed(2)} SOL and ${usdc} USDC. Total value is roughly $${(sol * 122.5 + parseFloat(usdc)).toFixed(2)}.`;
        } catch (e) {
          finalResponse = "I couldn't fetch your live balance, but I've updated the display on the right.";
        }
      } else if (result.action === "query_history") {
        setActiveView("history");
      } else if (result.action === "query_contacts") {
        setActiveView("contacts");
      }

      setCommandHistory(prev => [...prev, { text: finalResponse, isAi: true }]);

      // Voice Feedback
      try {
        const { textToSpeech } = await import("@/lib/ai/speech");
        const audioBase64 = await textToSpeech(finalResponse);
        if (audioBase64) {
          const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
          audio.play();
        }
      } catch (e) { console.error(e); }

    } catch (error) {
      console.error(error);
    } finally {
      setProcessingVoice(false);
    }
  };

  const handleQuickCommand = (cmd: string) => {
    parseVoiceCommand(cmd);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", color: "#fff" }}>
      {/* 1. Futuristic Sidebar */}
      <aside className="glass" style={{ 
        width: "280px", 
        borderRight: "1px solid var(--border-subtle)", 
        display: "flex", 
        flexDirection: "column",
        padding: "32px 20px",
        gap: "40px",
        position: "sticky",
        top: 0,
        height: "100vh"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, var(--solana-green), var(--solana-purple))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚡</div>
          <h1 className="font-display" style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px" }}>SpeakPay</h1>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <NavBtn active={activeView === "home"} onClick={() => setActiveView("home")} icon="🎙️" label="Assistant" />
          <NavBtn active={activeView === "history"} onClick={() => setActiveView("history")} icon="📋" label="Activity" />
          <NavBtn active={activeView === "contacts"} onClick={() => setActiveView("contacts")} icon="👤" label="Contacts" />
        </nav>

        <div style={{ marginTop: "auto" }}>
          <BalanceCard />
        </div>
      </aside>

      {/* 2. Main Content Stage */}
      <main style={{ flex: 1, position: "relative", overflowY: "auto", padding: "40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
          {/* Mobile-only Balance Display */}
          <div className="mobile-only" style={{ marginBottom: "24px" }}>
            <BalanceCard />
          </div>

          {activeView === "home" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center" }}>
              
              {/* The \"Stage\" */}
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <h2 className="font-display gradient-text" style={{ fontSize: "48px", fontWeight: 800, marginBottom: "16px" }}>How can I help?</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "18px" }}>Voice-activated payments and bridging on Solana.</p>
              </div>

              <VoiceOrb 
                isListening={isListening} 
                onToggle={setIsListening} 
                onTranscript={parseVoiceCommand} 
                processing={processingVoice} 
              />

              {/* Chat-style Command History */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                {commandHistory.slice(-3).map((item, i) => (
                  <div key={i} className="glass animate-float-up" style={{ 
                    padding: "16px 24px", 
                    borderRadius: "18px",
                    alignSelf: item.isAi ? "flex-start" : "flex-end",
                    maxWidth: "80%",
                    border: item.isAi ? "1px solid rgba(20,241,149,0.2)" : "1px solid rgba(255,255,255,0.1)",
                    background: item.isAi ? "rgba(20,241,149,0.05)" : "rgba(255,255,255,0.03)"
                  }}>
                    <p style={{ fontSize: "12px", color: item.isAi ? "var(--solana-green)" : "var(--text-muted)", marginBottom: "4px", fontWeight: 700 }}>{item.isAi ? "ASSISTANT" : "YOU"}</p>
                    <p style={{ fontSize: "16px", lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                ))}
              </div>

              <QuickCommands onSelect={parseVoiceCommand} />
            </div>
          )}

          {activeView === "history" && (
            <div className="animate-fade-in">
              <h2 className="font-display" style={{ fontSize: "32px", fontWeight: 700, marginBottom: "32px" }}>Transaction Activity</h2>
              <RecentTransactions compact={false} />
            </div>
          )}

          {activeView === "contacts" && (
            <div className="animate-fade-in">
              <h2 className="font-display" style={{ fontSize: "32px", fontWeight: 700, marginBottom: "32px" }}>Your Contacts</h2>
              <ContactsView onSend={(name) => parseVoiceCommand(`Send to ${name}`)} />
            </div>
          )}
        </div>
      </main>

      {/* 3. Global Modals */}
      {showModal && pendingTx && (
        <TransactionModal
          tx={pendingTx}
          onConfirm={() => {
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />
      )}

      <style jsx>{`
        .wallet-adapter-sidebar :global(.wallet-adapter-button) {
          width: 100% !important;
          justify-content: center !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid var(--border-subtle) !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          height: 44px !important;
          transition: all 0.2s ease !important;
        }
        .wallet-adapter-sidebar :global(.wallet-adapter-button:hover) {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: var(--solana-green) !important;
        }
        .mobile-only { display: none; }
        @media (max-width: 1024px) {
          aside { display: none !important; }
          .mobile-only { display: block; }
          main { padding: 20px !important; }
        }
      `}</style>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      borderRadius: "12px",
      background: active ? "rgba(20,241,149,0.1)" : "transparent",
      color: active ? "var(--solana-green)" : "var(--text-secondary)",
      border: "none",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: 600,
      transition: "all 0.2s ease",
      textAlign: "left"
    }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      {label}
    </button>
  );
}

interface ContactsViewProps {
  onSend: (name: string) => void;
}

function ContactsView({ onSend }: ContactsViewProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const load = () => import("@/lib/solana/contacts").then(m => setContacts(m.getContacts()));
  
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const m = await import("@/lib/solana/contacts");
    m.addContact({ name: newName, address: newAddress });
    setNewName(""); setNewAddress(""); setShowAdd(false);
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary" style={{ padding: "10px 20px" }}>
          {showAdd ? "Cancel" : "+ Add New Contact"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass animate-float-up" style={{ padding: "32px", borderRadius: "24px", display: "flex", gap: "16px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>NAME</p>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Alice" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "12px", color: "#fff" }} />
          </div>
          <div style={{ flex: 2 }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>SOLANA ADDRESS</p>
            <input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Enter address..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "12px", color: "#fff" }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "12px 24px" }}>Save</button>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {contacts.map(c => (
          <div key={c.name} className="glass glass-hover" style={{ padding: "24px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👤</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: "17px" }}>{c.name}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{c.address.slice(0, 4)}...{c.address.slice(-4)}</p>
            </div>
            <button onClick={() => onSend(c.name)} className="btn-primary" style={{ padding: "8px 12px", borderRadius: "10px" }}>Send</button>
          </div>
        ))}
      </div>
    </div>
  );
}
