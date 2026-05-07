"use client";

import { useEffect, useState } from "react";
import { useSendTransaction } from "@/lib/solana/useSendTransaction";
import { useWallet } from "@solana/wallet-adapter-react";

interface Tx {
  type: "send" | "bridge";
  amount: string;
  token: string;
  recipient: string;
  chain?: string;
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
  const { send, loading, error } = useSendTransaction();
  const { connected } = useWallet();
  
  const usdValue = (parseFloat(tx.amount) * (MOCK_RATE_USD[tx.token] ?? 1)).toFixed(2);

  const [bridgeQuote, setBridgeQuote] = useState<any>(null);

  useEffect(() => {
    if (tx.type === "bridge") {
      const fetchQuote = async () => {
        try {
          const { getBridgeQuote } = await import("@/lib/lifi/bridge");
          const quote = await getBridgeQuote({
            fromChain: tx.chain || "Ethereum",
            fromToken: tx.token,
            toAmount: tx.amount,
            toAddress: tx.recipient,
          });
          if (quote) {
            setBridgeQuote(quote);
          }
        } catch (e) {
          console.error("Failed to fetch bridge quote", e);
        }
      };
      fetchQuote();
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
      } catch (err: any) {
        setErrorMsg(err.message || "Bridge failed");
        setStep("error");
      }
      return;
    }

    setStep("signing");
    
    try {
      const txSignature = await send({
        recipient: tx.recipient,
        amount: parseFloat(tx.amount),
        token: tx.token as "SOL" | "USDC" | "USDT",
      });

      if (txSignature) {
        setSignature(txSignature);
        setStep("done");
        setTimeout(() => onConfirm(txSignature), 1500);
      } else {
        setErrorMsg(error || "Transaction failed");
        setStep("error");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Transaction failed");
      setStep("error");
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

            {/* Amount display */}
            <div
              style={{
                padding: "24px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <p
                className="font-display"
                style={{ fontSize: "40px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}
              >
                {tx.amount} <span style={{ color: tx.type === "bridge" ? "var(--accent-blue)" : "var(--solana-green)" }}>{tx.token}</span>
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "6px" }}>≈ ${usdValue} USD</p>
            </div>

            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <DetailRow label={tx.type === "bridge" ? "From Chain" : "To"} value={tx.type === "bridge" ? (tx.chain ?? "Ethereum") : tx.recipient} />
              {tx.type === "bridge" && <DetailRow label="To Chain" value="Solana" />}
              {tx.type === "bridge" && <DetailRow label="Protocol" value={bridgeQuote?.toolDetails?.name || "LiFi Protocol"} highlight />}
              <DetailRow 
                label="Network Fee" 
                value={bridgeQuote ? `$${parseFloat(bridgeQuote.estimate.feeCosts[0]?.amountUsd || "0").toFixed(2)}` : `${MOCK_FEE} SOL`} 
              />
              <DetailRow 
                label="Estimated Time" 
                value={bridgeQuote ? `${Math.ceil(bridgeQuote.estimate.executionDuration / 60)} minutes` : (tx.type === "bridge" ? "2–5 minutes" : "~1 second")} 
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
