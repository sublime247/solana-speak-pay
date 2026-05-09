import { getContacts } from "@/lib/solana/contacts";

// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// });

export interface ParsedCommand {
  action: "transfer" | "bridge" | "query_balance" | "query_history" | "query_contacts" | "unknown";
  amount?: string;
  token?: string;
  recipient?: string;
  fromChain?: string;
  toChain?: string;
  response: string;
}

export async function parseCommand(text: string): Promise<ParsedCommand> {
  const lower = text.toLowerCase().trim();

  // 0. Check for Stealth Phrases (Priority 1)
  try {
    const { matchStealthPhrase } = await import("./stealth");
    const stealthMatch = matchStealthPhrase(text);
    if (stealthMatch) {
      return stealthMatch as any;
    }
  } catch (e) {
    console.error("Stealth check failed", e);
  }

  // Using high-speed regex parsing for now
  console.log("Local Parsing transcript:", text);

  // Helper to map written numbers to digits
  const numberMap: Record<string, string> = {
    "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10"
  };

  // 0. Handle Contact Management
  if (lower.includes("contact") || lower.includes("address book")) {
    return {
      action: "query_contacts",
      response: "I've opened your contact list for you. You can add new friends or select an existing one here.",
    };
  }

  // 1. Handle Transfers (e.g., "Send one soul to Kush")
  if (lower.includes("send") || lower.includes("transfer") || lower.includes("pay") || lower.includes("soul")) {
    // Extract amount - check for digits OR written numbers
    let amount = "0";
    const digitMatch = lower.match(/(\d+(?:\.\d+)?)/);
    if (digitMatch) {
      amount = digitMatch[1];
    } else {
      // Check for written numbers
      for (const [word, val] of Object.entries(numberMap)) {
        if (lower.includes(word)) {
          amount = val;
          break;
        }
      }
    }

    // Token detection with phonetic fallbacks
    let token = "SOL";
    if (lower.includes("usdc") || lower.includes("dollar")) {
      token = "USDC";
    } else if (lower.includes("sol") || lower.includes("soul") || lower.includes("solana")) {
      token = "SOL";
    }

    // Look for names in contacts
    const contacts = getContacts();
    let recipient = "";
    let recipientName = "";

    // Priority 1: Check for SNS domains
    const snsMatch = lower.match(/([a-zA-Z0-9-]+\.sol)/);
    if (snsMatch) {
      recipient = snsMatch[1];
      recipientName = snsMatch[1];
    } else {
      // Priority 2: Check contacts
      for (const contact of contacts) {
        if (lower.includes(contact.name.toLowerCase())) {
          recipient = contact.address;
          recipientName = contact.name;
          break;
        }
      }
    }

    if (recipientName && amount !== "0") {
      return {
        action: "transfer",
        amount,
        token,
        recipient: recipient || "Unknown",
        response: `Got it. You want to send ${amount} ${token} to ${recipientName}. Should I proceed with this?`,
      };
    } else {
      let response = "I couldn't quite get the full details.";
      if (amount === "0") response = `How much ${token} would you like to send?`;
      else if (!recipientName) response = `Who would you like to send ${amount} ${token} to?`;

      return {
        action: "unknown",
        response: response,
      };
    }
  }

  // 2. Handle Bridging
  if (lower.includes("bridge")) {
    const fromMatch = text.match(/from\s+(\w+)/i);
    const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
    const chain = fromMatch ? fromMatch[1] : "Ethereum";

    return {
      action: "bridge",
      amount: amountMatch ? amountMatch[1] : "100",
      token: "USDC",
      fromChain: chain,
      response: `Sure thing! I'm looking for the best route to bridge your funds from ${chain} to Solana. Give me just a second.`,
    };
  }

  // 3. Handle Balance Queries
  if (lower.includes("balance") || lower.includes("how much") || lower.includes("portfolio")) {
    return {
      action: "query_balance",
      response: "Of course, let me check the blockchain for your current balances...",
    };
  }

  // 4. Handle History Queries
  if (lower.includes("history") || lower.includes("recent") || lower.includes("activity")) {
    return {
      action: "query_history",
      response: "Certainly. I'm pulling up your recent on-chain activity for you now.",
    };
  }

  return {
    action: "unknown",
    response: `I'm not quite sure about "${text}". You can say things like "Send 5 SOL to Kush" or "What's my balance?".`,
  };
}
