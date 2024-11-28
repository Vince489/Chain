const ed25519 = require('tweetnacl'); // Ensure this is imported for signing

class SystemProgram {
  constructor() {}

  // Define the program ID (unique identifier for this program)
  static programId = new PublicKey('11111111111111111111111111111111');

  // Function to create a new account
  static createAccount({ fromPubkey, newAccountPubkey, lamports }) {
    // Simplified data encoding (e.g., type + lamports)
    const data = new Uint8Array([1, ...SystemProgram._encodeLamports(lamports)]);

    return new TransactionInstruction({
      keys: [
        { pubkey: fromPubkey, isSigner: true, isWritable: true },
        { pubkey: newAccountPubkey, isSigner: true, isWritable: true },
      ],
      programId: SystemProgram.programId,
      data,
    });
  }

  // Function to transfer tokens between accounts
  static transfer({ fromPubkey, toPubkey, lamports }) {
    const data = new Uint8Array([2, ...SystemProgram._encodeLamports(lamports)]);

    return new TransactionInstruction({
      keys: [
        { pubkey: fromPubkey, isSigner: true, isWritable: true },
        { pubkey: toPubkey, isSigner: false, isWritable: true },
      ],
      programId: SystemProgram.programId,
      data,
    });
  }

  // Helper function to encode lamports as an 8-byte array
  static _encodeLamports(lamports) {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(lamports));
    return buffer;
  }
}

module.exports = SystemProgram;
