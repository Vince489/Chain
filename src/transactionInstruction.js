import { PublicKey } from './publicKey.js'; // Make sure the PublicKey class is imported

class TransactionInstruction {
  constructor(opts) {
    this.programId = opts.programId;
    this.keys = opts.keys;
    this.data = opts.data || Buffer.alloc(0);
  }

  validate() {
    // Validate programId as a PublicKey instance
    if (!(this.programId instanceof PublicKey)) {
      throw new Error('Invalid programId: must be an instance of PublicKey');
    }
  
    // Validate keys array
    if (!Array.isArray(this.keys) || this.keys.length === 0) {
      throw new Error('Keys must be a non-empty array');
    }
  
    // Validate individual key properties
    this.keys.forEach((key, index) => {
      if (!(key.pubkey instanceof PublicKey)) {
        throw new Error(`Invalid pubkey at index ${index}: must be an instance of PublicKey`);
      }
      if (typeof key.isSigner !== 'boolean') {
        throw new Error(`Invalid isSigner flag at index ${index}`);
      }
      if (typeof key.isWritable !== 'boolean') {
        throw new Error(`Invalid isWritable flag at index ${index}`);
      }
    });
  
    // Validate data as a Buffer or Uint8Array
    if (!(Buffer.isBuffer(this.data) || this.data instanceof Uint8Array)) {
      throw new Error('Data must be a Buffer or Uint8Array');
    }
  }
  

  toJSON() {
    return {
      keys: this.keys.map(({ pubkey, isSigner, isWritable }) => ({
        pubkey,
        isSigner,
        isWritable,
      })),
      programId: this.programId,
      data: Array.from(this.data),
    };
  }
}

export { TransactionInstruction };
