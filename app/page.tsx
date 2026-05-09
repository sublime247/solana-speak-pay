"use client";

import { useState, useEffect } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import TransactionModal from "@/components/TransactionModal";
import BalanceCard from "@/components/BalanceCard";
import RecentTransactions from "@/components/RecentTransactions";
import QuickCommands from "@/components/QuickCommands";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import ClientOnly from "@/components/ClientOnly";

export type AppView = "home" | "history" | "contacts" | "security";

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [processingVoice, setProcessingVoice] = useState(false);
  const [pendingTx, setPendingTx] = useState<any>(null);
  const [confirmingTx, setConfirmingTx] = useState<any>(null);
  const [inputMode, setInputMode] = useState<"voice" | "manual">("voice");

  // Command History for the UI
  const [commandHistory, setCommandHistory] = useState<{ text: string, isAi: boolean }[]>([]);

  const parseVoiceCommand = async (text: string) => {
    if (!text) return;
    setProcessingVoice(true);
    setCommandHistory(prev => [...prev, { text, isAi: false }]);

    try {
      // 0. Handle Confirmation Response
      if (confirmingTx && (text.toLowerCase().includes("yes") || text.toLowerCase().includes("proceed") || text.toLowerCase().includes("correct"))) {
        setPendingTx(confirmingTx);
        setConfirmingTx(null);
        setCommandHistory(prev => [...prev, { text: "Confirmed. Opening the transaction review...", isAi: true }]);
        setTimeout(() => setShowModal(true), 500);
        setProcessingVoice(false);
        return;
      } else if (confirmingTx) {
        // If they said something else, cancel the pending one
        setConfirmingTx(null);
      }

      const { parseCommand } = await import("@/lib/ai/parser");
      const result = await parseCommand(text);

      let finalResponse = result.response;

      if (result.action === "transfer") {
        let actualRecipient = result.recipient || "Unknown";
        let displayRecipient = result.recipient || "Unknown";
        
        // Resolve SNS if needed
        if (actualRecipient.endsWith(".sol")) {
          setProcessingVoice(true);
          try {
            const { resolveSNS } = await import("@/lib/solana/sns");
            const resolved = await resolveSNS(connection, actualRecipient);
            if (resolved) {
              displayRecipient = actualRecipient; 
              actualRecipient = resolved; 
              finalResponse = `I've resolved ${displayRecipient} to a Solana address. Setting up the transfer now.`;
            } else {
              finalResponse = `I couldn't resolve the domain ${actualRecipient}. Please check if it's correct.`;
              setCommandHistory(prev => [...prev, { text: finalResponse, isAi: true }]);
              setProcessingVoice(false);
              return;
            }
          } catch (e) {
            console.error("SNS Resolution failed", e);
          }
        }

        setConfirmingTx({
          type: "send",
          amount: result.amount || "0",
          token: result.token || "SOL",
          recipient: actualRecipient,
          recipientDisplay: displayRecipient,
          transcript: text,
        });
        // We DON'T show the modal yet. We wait for confirmation.
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
          const { getSolPrice } = await import("@/lib/solana/prices");
          
          const sol = await getSolBalance(connection, publicKey!);
          const tokens = await getTokenBalances(connection, publicKey!);
          const solPrice = await getSolPrice();
          
          const usdc = tokens.find(t => t.symbol === "USDC")?.amount || "0";
          const totalUsd = (sol * solPrice + parseFloat(usdc)).toFixed(2);
          
          finalResponse = `You have ${sol.toFixed(2)} SOL and ${usdc} USDC. Total value is roughly $${totalUsd} based on the current SOL price of $${solPrice.toFixed(2)}.`;
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
          <NavBtn active={activeView === "security"} onClick={() => setActiveView("security")} icon="🔒" label="Security" />
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
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <h2 className="font-display gradient-text" style={{ fontSize: "48px", fontWeight: 800, marginBottom: "16px" }}>{inputMode === "voice" ? "How can I help?" : "Send Payment"}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "18px" }}>{inputMode === "voice" ? "Voice-activated payments and bridging on Solana." : "Enter details manually to set up a transaction."}</p>
              </div>

              {/* Mode Toggle */}
              <div className="glass" style={{ display: "flex", padding: "4px", borderRadius: "14px", marginBottom: "10px" }}>
                <button 
                  onClick={() => setInputMode("voice")}
                  style={{ 
                    padding: "10px 24px", 
                    borderRadius: "10px", 
                    background: inputMode === "voice" ? "rgba(20,241,149,0.15)" : "transparent",
                    color: inputMode === "voice" ? "var(--solana-green)" : "var(--text-muted)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                    transition: "all 0.2s"
                  }}
                >
                  🎙️ Voice
                </button>
                <button 
                  onClick={() => setInputMode("manual")}
                  style={{ 
                    padding: "10px 24px", 
                    borderRadius: "10px", 
                    background: inputMode === "manual" ? "rgba(20,241,149,0.15)" : "transparent",
                    color: inputMode === "manual" ? "var(--solana-green)" : "var(--text-muted)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                    transition: "all 0.2s"
                  }}
                >
                  ⌨️ Type
                </button>
              </div>

              {inputMode === "voice" ? (
                <>
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
                        
                        {/* If this is the latest AI message and we are confirming, show buttons */}
                        {item.isAi && i === commandHistory.length - 1 && confirmingTx && (
                          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                            <button 
                              onClick={() => {
                                setPendingTx(confirmingTx);
                                setConfirmingTx(null);
                                setShowModal(true);
                              }}
                              className="btn-primary" 
                              style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "8px" }}
                            >
                              Yes, Proceed
                            </button>
                            <button 
                              onClick={() => setConfirmingTx(null)}
                              style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <QuickCommands onSelect={parseVoiceCommand} />
                </>
              ) : (
                <div style={{ width: "100%", maxWidth: "500px" }}>
                  <ManualTransferForm onTransfer={(data) => {
                    if (data.recipient.endsWith(".sol")) {
                      const transcript = `Manual transfer of ${data.amount} ${data.token} to ${data.recipient}`;
                      setPendingTx({
                        type: "send",
                        amount: data.amount,
                        token: data.token,
                        recipient: data.recipient,
                        recipientDisplay: data.recipient,
                        transcript: transcript
                      });
                      setShowModal(true);
                    } else {
                      setPendingTx({
                        type: "send",
                        amount: data.amount,
                        token: data.token,
                        recipient: data.recipient,
                        transcript: "Manual Transfer"
                      });
                      setShowModal(true);
                    }
                  }} />
                </div>
              )}
            </div>
          )}

          {activeView === "history" && (
            <div className="animate-fade-in">
              <h2 className="font-display" style={{ fontSize: "32px", fontWeight: 700, marginBottom: "32px" }}>Transaction Activity</h2>
              <RecentTransactions compact={false} />
            </div>
          )}

          {activeView === "security" && (
            <div className="animate-fade-in">
              <h2 className="font-display" style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>Stealth Mode</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Map secret voice phrases to specific transactions for discrete payments.</p>
              <StealthSettings />
            </div>)}
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
function ManualTransferForm({ onTransfer }: { onTransfer: (data: any) => void }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("SOL");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;
    onTransfer({ recipient, amount, token });
  };

  return (
    <form onSubmit={handleSubmit} className="glass animate-float-up" style={{ padding: "32px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>RECIPIENT ADDRESS OR .SOL</p>
          <input 
            value={recipient} 
            onChange={e => setRecipient(e.target.value)} 
            placeholder="Address or name.sol" 
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "12px", color: "#fff", fontSize: "16px" }} 
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>AMOUNT</p>
          <input 
            type="number"
            step="0.01"
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0.00" 
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "12px", color: "#fff", fontSize: "16px" }} 
          />
        </div>
        <div style={{ width: "120px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700 }}>TOKEN</p>
          <select 
            value={token}
            onChange={e => setToken(e.target.value)}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "12px", color: "#fff", fontSize: "16px" }}
          >
            <option value="SOL">SOL</option>
            <option value="USDC">USDC</option>
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary" style={{ padding: "16px", borderRadius: "14px", fontSize: "16px", fontWeight: 700, marginTop: "8px" }}>
        Review Transaction
      </button>
    </form>
  );
}

function StealthSettings() {
  const [phrases, setPhrases] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPhrase, setNewPhrase] = useState({ phrase: "", label: "", amount: "", token: "SOL", recipient: "", action: "transfer" });

  const load = async () => {
    const { getStealthPhrases } = await import("@/lib/ai/stealth");
    setPhrases(getStealthPhrases());
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { saveStealthPhrase } = await import("@/lib/ai/stealth");
    saveStealthPhrase(newPhrase as any);
    setShowAdd(false);
    setNewPhrase({ phrase: "", label: "", amount: "", token: "SOL", recipient: "", action: "transfer" });
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Active Phrases</p>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          style={{ background: "var(--solana-green)", border: "none", color: "#000", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
        >
          {showAdd ? "Cancel" : "+ Add New"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass animate-float-up" style={{ padding: "20px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--solana-green)" }}>
          <input placeholder="Secret Phrase (e.g. 'Take out the trash')" value={newPhrase.phrase} onChange={e => setNewPhrase({...newPhrase, phrase: e.target.value})} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "#fff" }} required />
          <input placeholder="Label (e.g. 'Emergency Liquidation')" value={newPhrase.label} onChange={e => setNewPhrase({...newPhrase, label: e.target.value})} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "#fff" }} required />
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="number" placeholder="Amount" value={newPhrase.amount} onChange={e => setNewPhrase({...newPhrase, amount: e.target.value})} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "#fff" }} required />
            <select value={newPhrase.token} onChange={e => setNewPhrase({...newPhrase, token: e.target.value})} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "#fff" }}>
              <option value="SOL">SOL</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          <input placeholder="Recipient Address" value={newPhrase.recipient} onChange={e => setNewPhrase({...newPhrase, recipient: e.target.value})} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "#fff" }} required />
          <button type="submit" className="btn-primary" style={{ padding: "12px", borderRadius: "8px", fontSize: "14px" }}>Save Stealth Phrase</button>
        </form>
      )}

      {phrases.map((p, i) => (
        <div key={i} className="glass" style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ color: "var(--solana-green)", fontWeight: 700, fontSize: "14px" }}>"{p.phrase}"</span>
            <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "6px" }}>{p.label}</span>
          </div>
          {p.amount != 0 && (<div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Executes: {p.amount} {p.token} to {p.recipient.slice(0, 8)}...
          </div>)}
        </div>
      ))}
    </div>
  );
}
