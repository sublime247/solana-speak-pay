import * as anchor from "@coral-xyz/anchor";
import { Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import idl from "./idl.json";

// The Program ID you just deployed
export const PROGRAM_ID = new PublicKey("H9BHwpMzpUDGBoYkNpD1peoLaNVuGnSWjYX9iW6TGir1");

/**
 * Creates a transaction instruction to call the SpeakPay Gateway program
 */
export async function createGatewayPaymentInstruction(
  connection: Connection,
  wallet: any,
  recipient: string,
  amountSol: number,
  transcript: string
) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  
  const program = new Program(idl as Idl, PROGRAM_ID, provider);

  const amountLamports = new anchor.BN(amountSol * LAMPORTS_PER_SOL);
  
  // Build the instruction
  const instruction = await program.methods
    .payWithVoice(amountLamports, transcript)
    .accounts({
      payer: wallet.publicKey,
      recipient: new PublicKey(recipient),
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();

  return instruction;
}
