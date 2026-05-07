import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export interface TransferParams {
  connection: Connection;
  fromPubkey: PublicKey;
  toPubkey: PublicKey;
  amount: number;
  tokenMint?: PublicKey; // If undefined, transfer SOL
}

/**
 * Transfer SOL from one wallet to another
 */
export async function transferSol(
  connection: Connection,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amount: number
): Promise<string> {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    return transaction.serialize({ requireAllSignatures: false }).toString("base64");
  } catch (error) {
    console.error("Error creating SOL transfer:", error);
    throw error;
  }
}

/**
 * Transfer SPL tokens from one wallet to another
 */
export async function transferToken(
  connection: Connection,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  tokenMint: PublicKey,
  amount: number,
  decimals: number
): Promise<string> {
  try {
    const transaction = new Transaction();

    // Get source token account
    const fromTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      fromPubkey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Get or create destination token account
    const toTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      toPubkey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Check if destination token account exists
    const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
    
    if (!toTokenAccountInfo) {
      // Create associated token account for recipient
      transaction.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey, // payer
          toTokenAccount, // associated token account
          toPubkey, // owner
          tokenMint, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        amount * Math.pow(10, decimals),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    return transaction.serialize({ requireAllSignatures: false }).toString("base64");
  } catch (error) {
    console.error("Error creating token transfer:", error);
    throw error;
  }
}

/**
 * Get transaction fee estimate
 */
export async function getTransactionFee(
  connection: Connection,
  transaction: Transaction
): Promise<number> {
  try {
    const fee = await connection.getFeeForMessage(
      transaction.compileMessage(),
      "confirmed"
    );
    return (fee.value || 5000) / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error estimating fee:", error);
    return 0.000005; // Default estimate
  }
}

/**
 * Check transaction status
 */
export async function checkTransactionStatus(
  connection: Connection,
  signature: string
): Promise<"confirmed" | "finalized" | "pending" | "failed"> {
  try {
    const status = await connection.getSignatureStatus(signature);
    
    if (!status.value) return "pending";
    if (status.value.err) return "failed";
    if (status.value.confirmationStatus === "finalized") return "finalized";
    if (status.value.confirmationStatus === "confirmed") return "confirmed";
    
    return "pending";
  } catch (error) {
    console.error("Error checking transaction status:", error);
    return "failed";
  }
}
