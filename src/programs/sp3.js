import { PublicKey } from '../publicKey.js'; // Import the PublicKey class
import { TransactionInstruction } from '../transactionInstruction.js'; // Import the TransactionInstruction class

class SystemProgram {
  constructor() {}

  // Define the program ID (unique identifier for the System program)
  static programId = new PublicKey('11111111111111111111111111111111');

  /**
   * Generate a transaction instruction that transfers lamports from one account to another
   * @param {Object} params
   * @param {PublicKey} params.fromPubkey - Sender's public key
   * @param {PublicKey} params.toPubkey - Recipient's public key
   * @param {number} params.lamports - Amount to transfer in vinnies (smallest unit)
   * @returns {TransactionInstruction}
   */
  static transfer({ fromPubkey, toPubkey, lamports }) {
    // Validate input parameters
    if (!fromPubkey || !toPubkey || lamports <= 0) {
      throw new Error('Invalid transfer parameters');
    }

    // Encode data for the instruction (simple encoding for MVP)
    const data = new Uint8Array([1, ...SystemProgram._encodeLamports(lamports)]);

    // Create the instruction with necessary keys
    return new TransactionInstruction({
      keys: [
        { pubkey: fromPubkey, isSigner: true, isWritable: true },
        { pubkey: toPubkey, isSigner: false, isWritable: true },
      ],
      programId: this.programId,
      data,
    });
  }

  /**
   * Helper to encode lamports into a byte array
   * @param {number} lamports - Amount to encode
   * @returns {Uint8Array}
   */
  static _encodeLamports(lamports) {
    const buffer = new ArrayBuffer(8); // Assume 64-bit unsigned integer
    new DataView(buffer).setBigUint64(0, BigInt(lamports), true); // Little-endian
    return new Uint8Array(buffer);
  }
}

export { SystemProgram };