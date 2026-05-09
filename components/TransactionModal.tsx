"use client";

import { useEffect, useState } from "react";
import { useSendTransaction } from "@/lib/solana/useSendTransaction";
import { useWallet } from "@solana/wallet-adapter-react";

interface Tx {
  type: "send" | "bridge";
  amount: string;
  token: string;
  recipient: string;
  recipientDisplay?: string;
  transcript?: string;
  chain?: string;
}

interface BridgeRoute {
  id: string;
  steps: {
    tool: string;
    action: string;
  }[];
  estimate: {
    toAmountUSD: string;
    executionDuration: number;
    feeCosts: { amount: string; token: { symbol: string } }[];
  };
}

interface TransactionModalProps {
  tx: Tx;
  onConfirm: (signature?: string) => void;
  onCancel: () => void;
}

const MOCK_FEE = "0.000025";
const MOCK_RATE_USD: Record<string, number> = {
  SOL: 122.15,
  USDC: 1.0,
  USDT: 1.0,
  ETH: 3183.0,
};

export default function TransactionModal({ tx, onConfirm, onCancel }: TransactionModalProps) {
  const [step, setStep] = useState<"review" | "signing" | "done" | "error">("review");
  const [errorMsg, setErrorMsg] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<BridgeRoute | null>(null);
  const { send, error: solError } = useSendTransaction();
  const { connected } = useWallet();
  const [solPrice, setSolPrice] = useState(MOCK_RATE_USD.SOL);
  const [editableAmount, setEditableAmount] = useState(tx.amount);
  const [editableRecipient, setEditableRecipient] = useState(tx.recipient);

  const currentRate = tx.token === "SOL" ? solPrice : (MOCK_RATE_USD[tx.token] ?? 1);
  const usdValue = (parseFloat(editableAmount || "0") * currentRate).toFixed(2);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const { getSolPrice } = await import("@/lib/solana/prices");
        const price = await getSolPrice();
        setSolPrice(price);
      } catch (e) {
        console.error("Failed to fetch live price for modal", e);
      }
    };
    fetchPrice();
  }, []);

  useEffect(() => {
    if (tx.type === "bridge") {
      const fetchRoute = async () => {
        setLoading(true);
        try {
          const { getBridgeQuote } = await import("@/lib/lifi/bridge");
          const quote = await getBridgeQuote({
            fromChain: tx.chain || "Ethereum",
            fromToken: tx.token,
            toAmount: tx.amount,
            toAddress: tx.recipient,
          });
          setRoute(quote as BridgeRoute);
        } catch {
          setErrorMsg("Failed to fetch bridge quote.");
          setStep("error");
        } finally {
          setLoading(false);
        }
      };
      fetchRoute();
    }
  }, [tx]);

  const handleConfirm = async () => {
    if (!connected) {
      setErrorMsg("Please connect your wallet first");
      setStep("error");
      return;
    }

    if (tx.type === "bridge") {
      setStep("signing");
      try {
        // Here we would use the LiFi SDK to execute the cross-chain transaction
        // This requires an EVM signer (from Phantom or MetaMask)
        // For the demo, we'll simulate the execution but use real quote data
        setTimeout(() => {
          setStep("done");
          onConfirm();
        }, 3000);
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : "Bridge failed";
        setErrorMsg(errorMsg);
        setStep("error");
      }
      return;
    }

    setStep("signing");

    try {
      const txSignature = await send({
        recipient: editableRecipient,
        amount: parseFloat(editableAmount),
        token: tx.token as "SOL" | "USDC" | "USDT",
        transcript: tx.transcript,
      });

      if (txSignature) {
        setSignature(txSignature);
        setStep("done");
        setTimeout(() => onConfirm(txSignature), 1500);
      } else {
        setErrorMsg(solError || "Transaction failed");
        setStep("error");
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Transaction failed";
      setErrorMsg(errorMsg);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && step === "review") onCancel();
  };

  // Trap Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step === "review") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, onCancel]);

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(5,10,20,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: "20px",
        animation: "fade-in 0.2s ease",
      }}
    >
      <div
        className="glass animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "24px",
          padding: "32px",
          border: "1px solid rgba(20,241,149,0.2)",
          boxShadow: "0 0 60px rgba(20,241,149,0.12), 0 40px 80px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              tx.type === "bridge"
                ? "linear-gradient(90deg, var(--accent-blue), var(--solana-purple))"
                : "linear-gradient(90deg, var(--solana-green), var(--accent-blue))",
          }}
        />

        {step === "review" && (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: tx.type === "bridge" ? "var(--accent-blue)" : "var(--solana-green)",
                    marginBottom: "4px",
                  }}
                >
                  {tx.type === "bridge" ? "🌉 Cross-Chain Bridge" : "💸 Send Payment"}
                </p>
                <p className="font-display" style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Confirm Transaction
                </p>
              </div>
              <button
                onClick={onCancel}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  background: "rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Amount display (Editable) */}
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "8px" }}>
                <input 
                  value={editableAmount}
                  onChange={(e) => setEditableAmount(e.target.value)}
                  className="font-display"
                  style={{ 
                    fontSize: "40px", 
                    fontWeight: 800, 
                    color: "var(--text-primary)", 
                    background: "transparent", 
                    border: "none", 
                    width: "140px", 
                    textAlign: "right",
                    outline: "none",
                    borderBottom: "1px dashed rgba(255,255,255,0.2)"
                  }}
                />
                <span style={{ fontSize: "24px", fontWeight: 700, color: tx.type === "bridge" ? "var(--accent-blue)" : "var(--solana-green)" }}>{tx.token}</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>≈ ${usdValue} USD</p>
            </div>

            {/* Details (Editable Recipient) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginLeft: "4px" }}>RECIPIENT</p>
                <input 
                  value={editableRecipient}
                  onChange={(e) => setEditableRecipient(e.target.value)}
                  style={{ 
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  placeholder="Address or .sol"
                />
              </div>
              {tx.type === "bridge" && <DetailRow label="To Chain" value="Solana" />}
              {tx.type === "bridge" && <DetailRow label="Protocol" value={route?.steps[0]?.tool || "LiFi Protocol"} highlight />}
              <DetailRow
                label="Network Fee"
                value={route ? `$${parseFloat(route.estimate.feeCosts[0]?.amount || "0").toFixed(2)}` : `${MOCK_FEE} SOL`}
              />
              <DetailRow
                label="Estimated Time"
                value={route ? `${Math.ceil(route.estimate.executionDuration / 60)} minutes` : (tx.type === "bridge" ? "2–5 minutes" : "~1 second")}
              />
            </div>

            {/* Warning */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(255,159,67,0.08)",
                border: "1px solid rgba(255,159,67,0.2)",
                marginBottom: "20px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: "13px", color: "rgba(255,180,80,0.9)", lineHeight: 1.5 }}>
                Review carefully. This transaction cannot be reversed once confirmed.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                id="cancel-tx-btn"
                onClick={onCancel}
                className="btn-ghost"
                style={{ flex: 1, fontSize: "15px" }}
              >
                Cancel
              </button>
              <button
                id="confirm-tx-btn"
                onClick={handleConfirm}
                className="btn-primary"
                style={{ flex: 2, fontSize: "15px" }}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm & Sign"}
              </button>
            </div>
          </>
        )}

        {step === "signing" && (
          <div style={{ textAlign: "center", padding: "20px 0" }} className="animate-fade-in">
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(20,241,149,0.1)",
                border: "3px solid transparent",
                borderTopColor: "var(--solana-green)",
                margin: "0 auto 24px",
                animation: "rotate-gradient 0.8s linear infinite",
              }}
            />
            <p className="font-display" style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Signing Transaction
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Waiting for wallet confirmation...
            </p>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }} className="animate-fade-in">
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(20,241,149,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: "36px",
                boxShadow: "0 0 30px rgba(20,241,149,0.3)",
              }}
            >
              ✅
            </div>
            <p className="font-display" style={{ fontSize: "20px", fontWeight: 700, color: "var(--solana-green)", marginBottom: "8px" }}>
              Transaction Sent!
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "12px" }}>
              Awaiting network confirmation...
            </p>
            {signature && (
              <a
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  color: "var(--accent-blue)",
                  textDecoration: "underline",
                }}
              >
                View on Explorer
              </a>
            )}
          </div>
        )}

        {step === "error" && (
          <div style={{ textAlign: "center", padding: "20px 0" }} className="animate-fade-in">
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(255,107,107,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: "36px",
              }}
            >
              ❌
            </div>
            <p className="font-display" style={{ fontSize: "20px", fontWeight: 700, color: "#ff6b6b", marginBottom: "8px" }}>
              Transaction Failed
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
              {errorMsg}
            </p>
            <button
              onClick={onCancel}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{label}</span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: highlight ? "var(--accent-blue)" : "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
