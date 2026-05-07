"use server";

/**
 * Fetch real-time SOL price with multiple failovers
 */
export async function getSolPrice(): Promise<number> {
  // Try Jupiter first
  try {
    const response = await fetch(
      "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112",
      { 
        next: { revalidate: 60 },
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const price = data.data["So11111111111111111111111111111111111111112"]?.price;
      if (price) return parseFloat(price);
    }
  } catch (e) {
    console.warn("Jupiter price fetch failed, trying CoinGecko...");
  }

  // Try CoinGecko as backup
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { next: { revalidate: 60 } }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.solana.usd;
    }
  } catch (e) {
    console.warn("CoinGecko price fetch failed");
  }

  // Final fallback
  return 122.5;
}
