import { Connection, PublicKey } from "@solana/web3.js";
import { getDomainKeySync, NameRegistryState } from "@bonfida/spl-name-service";

/**
 * Resolves a .sol domain to a Solana public key string
 * @param connection Solana connection
 * @param domain The .sol domain (e.g. "bonfida.sol")
 * @returns The public key string or null if not found
 */
export async function resolveSNS(connection: Connection, domain: string): Promise<string | null> {
  if (!domain.endsWith(".sol")) return null;
  
  try {
    const { pubkey } = getDomainKeySync(domain);
    const { registry } = await NameRegistryState.retrieve(connection, pubkey);
    return registry.owner.toBase58();
  } catch (e) {
    console.error(`Failed to resolve SNS domain: ${domain}`, e);
    return null;
  }
}

/**
 * Checks if a string looks like an SNS domain
 */
export function isSNSDomain(text: string): boolean {
  return /^[a-zA-Z0-9-]+\.sol$/.test(text.toLowerCase().trim());
}
