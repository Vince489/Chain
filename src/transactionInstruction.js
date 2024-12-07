import { PublicKey } from './publicKey.js';

export class TransactionInstruction {
  constructor({ keys, programId, data }) {
    if (!(programId instanceof PublicKey)) {
      programId = new PublicKey(programId); // Convert to PublicKey if it's not already
    }
    this.programId = programId;
    this.keys = keys;
    this.data = data || Buffer.alloc(0);
  }

  validate() {
    if (!(this.programId instanceof PublicKey)) {
      throw new Error('Invalid programId: must be an instance of PublicKey');
    }
    if (!Array.isArray(this.keys) || this.keys.length === 0) {
      throw new Error('Keys must be a non-empty array');
    }
    this.keys.forEach(({ pubkey, isSigner, isWritable }, index) => {
      if (!(pubkey instanceof PublicKey)) {
        throw new Error(`Invalid pubkey at index ${index}: must be an instance of PublicKey`);
      }
      if (typeof isSigner !== 'boolean') {
        throw new Error(`Invalid isSigner flag at index ${index}`);
      }
      if (typeof isWritable !== 'boolean') {
        throw new Error(`Invalid isWritable flag at index ${index}`);
      }
    });
    if (!(Buffer.isBuffer(this.data) || this.data instanceof Uint8Array)) {
      throw new Error('Data must be a Buffer or Uint8Array');
    }
  }

  toJSON() {
    return {
      keys: this.keys.map(({ pubkey, isSigner, isWritable }) => ({
        pubkey: pubkey.toBase58(),
        isSigner,
        isWritable,
      })),
      programId: this.programId.toBase58(),
      data: Array.from(this.data),
    };
  }

  static fromJSON(data) {
    const programId = new PublicKey(data.programId);
    const keys = data.keys.map(({ pubkey, isSigner, isWritable }) => ({
      pubkey: new PublicKey(pubkey),
      isSigner,
      isWritable,
    }));
    const instructionData = Buffer.from(data.data);
    return new TransactionInstruction({ programId, keys, data: instructionData });
  }
}
