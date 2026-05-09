export interface StealthPhrase {
  phrase: string;
  action: "transfer" | "bridge";
  amount: string;
  token: string;
  recipient: string;
  label: string;
}

const STORAGE_KEY = "solana_speak_pay_stealth";

const DEFAULT_PHRASES: StealthPhrase[] = [
  {
    phrase: "order a large pepperoni pizza",
    label: "Emergency Transfer to Ledger",
    action: "transfer",
    amount: "1.0",
    token: "SOL",
    recipient: "CvPTanAUAeqVpyHc8jAdhZ6iGYeXJy9udRtWNbDfbjRg", // Demo Address
  },
  {
    phrase: "check the weather in lagos",
    label: "Discrete Balance Check",
    action: "query_balance",
    amount: "0",
    token: "SOL",
    recipient: "",
  }
];

export function getStealthPhrases(): StealthPhrase[] {
  if (typeof window === "undefined") return DEFAULT_PHRASES;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_PHRASES;
}

export function saveStealthPhrase(phrase: StealthPhrase) {
  const current = getStealthPhrases();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, phrase]));
}

/**
 * Checks if the input text matches any stealth phrases
 */
export function matchStealthPhrase(text: string) {
  const lower = text.toLowerCase();
  const phrases = getStealthPhrases();
  
  for (const item of phrases) {
    if (lower.includes(item.phrase.toLowerCase())) {
      const isSensitive = item.action === "transfer" || item.action === "bridge";
      
      return {
        action: item.action,
        amount: item.amount,
        token: item.token,
        recipient: item.recipient,
        isStealth: true,
        label: item.label,
        response: isSensitive 
          ? `Executing your stealth command: "${item.label}". Should I proceed?`
          : `Sure, checking that for you...` // Non-sensitive actions execute immediately
      };
    }
  }
  
  return null;
}
