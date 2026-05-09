import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { transferSol, transferToken } from "./transactions";
import { TOKENS } from "./wallet";

export interface SendTransactionParams {
  recipient: string;
  amount: number;
  token: "SOL" | "USDC" | "USDT";
  transcript?: string;
}

export function useSendTransaction() {
  const { publicKey, sendTransaction, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async ({ recipient, amount, token, transcript }: SendTransactionParams): Promise<string | null> => {
    if (!publicKey) {
      setError("Wallet not connected");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate and resolve recipient address
      const { resolveAddress } = await import("./contacts");
      const finalRecipient = resolveAddress(recipient);
      
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(finalRecipient);
      } catch {
        throw new Error(`Could not find a valid address for "${recipient}". Please use a full Solana address or add them to your contacts.`);
      }

      let signature: string;

      if (token === "SOL") {
        // Use custom program gateway for SOL transfers if transcript is provided (Hackathon Requirement)
        if (transcript) {
          try {
            const { createGatewayPaymentInstruction } = await import("./gateway");
            const instruction = await createGatewayPaymentInstruction(
              connection,
              { publicKey, signTransaction, signAllTransactions },
              recipientPubkey.toString(),
              amount,
              transcript
            );
            const transaction = new Transaction().add(instruction);
            signature = await sendTransaction(transaction, connection);
          } catch (e) {
            console.error("Gateway transfer failed, falling back to direct transfer", e);
            const serializedTx = await transferSol(connection, publicKey, recipientPubkey, amount);
            const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
            signature = await sendTransaction(transaction, connection);
          }
        } else {
          // Transfer SOL directly
          const serializedTx = await transferSol(connection, publicKey, recipientPubkey, amount);
          const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
          signature = await sendTransaction(transaction, connection);
        }
      } else {
        // Transfer SPL token
        const tokenInfo = TOKENS[token];
        if (!tokenInfo.mint) {
          throw new Error(`Token ${token} not supported`);
        }

        const serializedTx = await transferToken(
          connection,
          publicKey,
          recipientPubkey,
          tokenInfo.mint,
          amount,
          tokenInfo.decimals
        );
        const transaction = Transaction.from(Buffer.from(serializedTx, "base64"));
        signature = await sendTransaction(transaction, connection);
      }

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      setLoading(false);
      return signature;
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Transaction failed";
      setError(errorMsg);
      setLoading(false);
      return null;
    }
  };

  return { send, loading, error };
}
