import { createConfig } from '@lifi/sdk';

// Initialize LiFi Config only on client side
if (typeof window !== 'undefined') {
  createConfig({
    integrator: 'solana-speak-pay',
  });
}

export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', logo: '🌐' },
  { id: 137, name: 'Polygon', logo: '🟣' },
  { id: 8453, name: 'Base', logo: '🔵' },
  { id: 42161, name: 'Arbitrum', logo: '🟦' },
];

export interface BridgeParams {
  fromChain: string;
  fromToken: string;
  toAmount: string;
  toAddress: string;
}
