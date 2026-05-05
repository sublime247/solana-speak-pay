"use client";

import { useState, useEffect, useRef } from "react";

// Add TypeScript definitions for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  var SpeechRecognition: any;
  var webkitSpeechRecognition: any;
}

interface VoiceOrbProps {
  isListening: boolean;
  onToggle: (v: boolean) => void;
  onTranscript: (t: string) => void;
  processing: boolean;
}

const DEMO_COMMANDS = [
  "Send 10 USDC to Alice",
  "What's my balance?",
  "Bridge 100 USDC from Ethereum",
  "Show my recent transactions",
  "Transfer 5 SOL to Sarah",
];

export default function VoiceOrb({ isListening, onToggle, onTranscript, processing }: VoiceOrbProps) {
  const [barHeights, setBarHeights] = useState([6, 6, 6, 6, 6, 6, 6]);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const demoIndexRef = useRef(0);

  // Animate sound bars
  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setBarHeights(Array.from({ length: 7 }, () => Math.random() * 28 + 6));
        animFrameRef.current = requestAnimationFrame(() => {
          setTimeout(animate, 100);
        });
      };
      animate();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setBarHeights([6, 6, 6, 6, 6, 6, 6]);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening]);

  const handleToggle = () => {
    if (isListening) {
      // Stop listening
      onToggle(false);
      recognitionRef.current?.stop();

      // Demo: simulate a recognized command
      const cmd = DEMO_COMMANDS[demoIndexRef.current % DEMO_COMMANDS.length];
      demoIndexRef.current++;
      setTimeout(() => onTranscript(cmd), 300);
    } else {
      // Start listening
      onToggle(true);

      // Try real Web Speech API first
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SR = (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
        if (SR) {
          const recognition = new SR();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = "en-US";
          recognition.onresult = (e: any) => {
            const text = e.results[0][0].transcript;
            onToggle(false);
            onTranscript(text);
          };
          recognition.onerror = () => {
            onToggle(false);
            // Fallback to demo
            const cmd = DEMO_COMMANDS[demoIndexRef.current % DEMO_COMMANDS.length];
            demoIndexRef.current++;
            onTranscript(cmd);
          };
          recognition.onend = () => onToggle(false);
          recognition.start();
          recognitionRef.current = recognition;
        }
      } else {
        // Demo mode — auto-stop after 2.5s
        setTimeout(() => {
          onToggle(false);
          const cmd = DEMO_COMMANDS[demoIndexRef.current % DEMO_COMMANDS.length];
          demoIndexRef.current++;
          onTranscript(cmd);
        }, 2500);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      {/* Orb button */}
      <div style={{ position: "relative", width: "120px", height: "120px" }}>
        {/* Outer pulse ring */}
        {isListening && (
          <>
            <div
              style={{
                position: "absolute",
                inset: "-20px",
                borderRadius: "50%",
                border: "2px solid rgba(20,241,149,0.3)",
                animation: "pulse-ring 2s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-36px",
                borderRadius: "50%",
                border: "1px solid rgba(20,241,149,0.15)",
                animation: "pulse-ring-2 2s ease-in-out infinite 0.3s",
              }}
            />
          </>
        )}

        {/* Main orb */}
        <button
          id="voice-orb-btn"
          onClick={handleToggle}
          disabled={processing}
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: "none",
            cursor: processing ? "not-allowed" : "pointer",
            position: "relative",
            overflow: "hidden",
            background: isListening
              ? "radial-gradient(circle at 40% 35%, #28ffad, #0dcc7a 50%, #06a85e)"
              : "radial-gradient(circle at 40% 35%, #2a2f45, #151929 50%, #0a0e1a)",
            boxShadow: isListening
              ? "0 0 0 0 rgba(20,241,149,0.4), 0 0 60px rgba(20,241,149,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: isListening ? "scale(1.08)" : "scale(1)",
          }}
          aria-label={isListening ? "Stop listening" : "Start voice command"}
        >
          {/* Shine overlay */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "18px",
              width: "30px",
              height: "18px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              transform: "rotate(-30deg)",
              pointerEvents: "none",
            }}
          />

          {/* Icon */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {processing ? (
              <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#fff",
                      animation: `blink 1s ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            ) : isListening ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <rect x="9" y="2" width="6" height="13" rx="3" />
                <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="13" rx="3" fill="rgba(20,241,149,0.9)" />
                <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke="rgba(20,241,149,0.9)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Sound bars */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "40px" }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              width: "4px",
              height: `${h}px`,
              borderRadius: "2px",
              background: isListening
                ? `hsl(${155 + i * 8}, 90%, ${55 + (h / 34) * 20}%)`
                : "rgba(255,255,255,0.12)",
              transition: "height 0.1s ease",
            }}
          />
        ))}
      </div>

      <p
        style={{
          fontSize: "15px",
          color: isListening ? "var(--solana-green)" : "var(--text-secondary)",
          fontWeight: 500,
          transition: "color 0.3s ease",
          marginTop: "-8px",
        }}
      >
        {processing ? "Processing..." : isListening ? "Listening... tap to stop" : "Tap to speak"}
      </p>
    </div>
  );
}
