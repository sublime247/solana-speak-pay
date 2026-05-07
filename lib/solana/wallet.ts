import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Token mint addresses on Devnet
export const TOKENS = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    mint: null, // Native SOL doesn't have a mint
    icon: "◎",
    color: "#9945ff",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    mint: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"), // Devnet USDC
    icon: "💵",
    color: "#2775ca",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    mint: new PublicKey("EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"), // Devnet USDT (example)
    icon: "💰",
    color: "#26a17b",
  },
};

export interface TokenBalance {
  symbol: string;
  name: string;
  amount: string;
  usd: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
  mint: PublicKey | null;
}

/**
 * Get SOL balance for a wallet
 */
export async function getSolBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    return 0;
  }
}

/**
 * Get SPL token balances for a wallet
 */
export async function getTokenBalances(
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenBalance[]> {
  try {
    const balances: TokenBalance[] = [];

    // Get SOL balance
    const solBalance = await getSolBalance(connection, publicKey);
    
    // Fetch real SOL price from Jupiter via Server Action (to avoid CORS)
    let solPrice = 122.5;
    try {
      const { getSolPrice } = await import("./prices");
      solPrice = await getSolPrice();
    } catch (e) {
      console.warn("Failed to fetch SOL price, using fallback", e);
    }

    balances.push({
      ...TOKENS.SOL,
      amount: solBalance.toFixed(4),
      usd: (solBalance * solPrice).toFixed(2),
      change: "+3.2%",
      positive: true,
      mint: null,
    });

    // Get SPL token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    // Process each token account
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info;
      const mint = new PublicKey(parsedInfo.mint);
      const amount = parsedInfo.tokenAmount.uiAmount || 0;

      // Match with known tokens
      if (TOKENS.USDC.mint?.equals(mint)) {
        balances.push({
          ...TOKENS.USDC,
          amount: amount.toFixed(2),
          usd: amount.toFixed(2),
          change: "0.0%",
          positive: true,
        });
      } else if (TOKENS.USDT.mint?.equals(mint)) {
        balances.push({
          ...TOKENS.USDT,
          amount: amount.toFixed(2),
          usd: amount.toFixed(2),
          change: "+0.1%",
          positive: true,
        });
      }
    }

    return balances;
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return [];
  }
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch recent transaction history for a public key
 */
export async function getTransactionHistory(
  connection: Connection,
  publicKey: PublicKey,
  limit: number = 10
): Promise<unknown[]> {
  try {
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    
    return signatures.map(sig => ({
      id: sig.signature,
      type: "transfer", 
      amount: "Activity", 
      token: "SOL",
      recipient: sig.signature.slice(0, 8) + "...",
      status: sig.err ? "failed" : (sig.confirmationStatus === "finalized" ? "completed" : "pending"),
      date: sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleDateString() : "Pending",
      time: sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      positive: false, 
    }));
  } catch (e: unknown) {
      console.error("Error fetching history:", e);
      return [];
    }
}
