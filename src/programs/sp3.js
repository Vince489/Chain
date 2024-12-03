import { PublicKey } from '../pk2.js'; // Import the PublicKey class
import { TransactionInstruction } from '../transactionInstruction.js'; // Import the TransactionInstruction class

class SystemProgram {
  constructor() {}

  // Define the program ID (unique identifier for the System program)
  static programId = new PublicKey('11111111111111111111111111111111');

  /**
   * Generate a transaction instruction that transfers vinnies from one account to another
   * @param {Object} params
   * @param {PublicKey} params.fromPubkey - Sender's public key
   * @param {PublicKey} params.toPubkey - Recipient's public key
   * @param {number} params.vinnies - Amount to transfer in vinnies (smallest unit)
   * @returns {TransactionInstruction}
   */
  static transfer({ fromPubkey, toPubkey, vinnies }) {
    // Validate input parameters
    if (!fromPubkey || !toPubkey || vinnies <= 0) {
      throw new Error('Invalid transfer parameters');
    }

    // Encode data for the instruction (simple encoding for MVP)
    const data = new Uint8Array([1, ...SystemProgram._encodeVinnies(vinnies)]);

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
   * Generate a transaction instruction that creates a new account
   */
  static createAccount() {

  }

  /**
   * Helper to encode vinnies into a byte array
   * @param {number} vinnies - Amount to encode
   * @returns {Uint8Array}
   */
  static _encodeVinnies(vinnies) {
    const buffer = new ArrayBuffer(8); // Assume 64-bit unsigned integer
    new DataView(buffer).setBigUint64(0, BigInt(vinnies), true); // Little-endian
    return new Uint8Array(buffer);
  }
}

export { SystemProgram };