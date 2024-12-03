import { PublicKey } from '../pk2.js'; // Import the PublicKey class
import { TransactionInstruction } from '../transactionInstruction.js'; // Import the TransactionInstruction class
import { NonceAccount } from './nonceAccount.js'; // Import the NonceAccount class

class SystemProgram {
  constructor() {}

  // Define the program ID (unique identifier for the System program)
  static programId = new PublicKey('11111111111111111111111111111111');

  /**
   * Generate a transaction instruction that transfers vinnies from one account to another
   */
  static transfer({ fromPubkey, toPubkey, vinnies }) {
    if (!fromPubkey || !toPubkey || vinnies <= 0) {
      throw new Error('Invalid transfer parameters');
    }

    const data = new Uint8Array([1, ...SystemProgram._encodeVinnies(vinnies)]);

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
   * Generate an instruction to initialize a nonce account
   */
  static nonceInitialize({ noncePubkey, authorizedPubkey }) {
    if (!noncePubkey || !authorizedPubkey) {
      throw new Error('Invalid nonce initialization parameters');
    }

    const data = new Uint8Array([2]); // 2 as opcode for initialize nonce

    return new TransactionInstruction({
      keys: [
        { pubkey: noncePubkey, isSigner: true, isWritable: true },
        { pubkey: authorizedPubkey, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  /**
   * Generate an instruction to advance a nonce
   */
  static nonceAdvance({ noncePubkey, authorizedPubkey }) {
    if (!noncePubkey || !authorizedPubkey) {
      throw new Error('Invalid nonce advance parameters');
    }

    const data = new Uint8Array([3]); // 3 as opcode for advance nonce

    return new TransactionInstruction({
      keys: [
        { pubkey: noncePubkey, isSigner: true, isWritable: true },
        { pubkey: authorizedPubkey, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  /**
   * Helper to encode vinnies into a byte array
   */
  static _encodeVinnies(vinnies) {
    const buffer = new ArrayBuffer(8); // 64-bit unsigned integer
    new DataView(buffer).setBigUint64(0, BigInt(vinnies), true); // Little-endian
    return new Uint8Array(buffer);
  }
}

export { SystemProgram };
