import { getQuote, getStatus } from '@lifi/sdk';

export interface BridgeQuoteParams {
  fromChain: string;
  fromToken: string;
  toAmount: string;
  toAddress: string;
  fromAddress?: string; // Optional EVM address
}

/**
 * Get a quote for bridging to Solana
 */
export async function getBridgeQuote(params: BridgeQuoteParams): Promise<any> {
  try {
    const chainIds: Record<string, string> = {
      'ethereum': '1',
      'eth': '1',
      'base': '8453',
      'polygon': '137',
      'arbitrum': '42161',
    };

    const fromChainId = chainIds[params.fromChain.toLowerCase()] || '1';
    
    // Default tokens
    const fromToken = params.fromToken.toUpperCase() === 'SOL' ? '0x0000000000000000000000000000000000000000' : '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const toToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    const quote = await getQuote({
      fromChain: fromChainId,
      toChain: '115111108', // Solana
      fromToken: fromToken,
      toToken: toToken,
      fromAmount: (parseFloat(params.toAmount) * 10 ** 6).toString(),
      fromAddress: params.fromAddress || '0x0000000000000000000000000000000000000000', // Required by latest SDK
      toAddress: params.toAddress,
    });

    return quote;
  } catch (error) {
    console.error('Error getting bridge quote:', error);
    return null;
  }
}

/**
 * Track a bridge transaction status
 */
export async function trackBridgeStatus(bridgeId: string) {
  // This would poll LiFi for status updates
  return await getStatus({
    txHash: bridgeId,
    bridge: 'lifi',
  });
}
