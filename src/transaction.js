import { PublicKey } from './publicKey.js';
import { TransactionInstruction } from './transactionInstruction.js';

export class Transaction {
  constructor() {
    this.instructions = [];
    this.recentBlockhash = null;
    this.feePayer = null;
    this.timestamp = new Date().toISOString();
    this.fees = 0; // Added to track fees explicitly
  }

  add(instruction) {
    this.instructions.push(instruction);
  }

  setRecentBlockhash(blockhash) {
    this.recentBlockhash = blockhash;
  }

  setFeePayer(feePayer) {
    if (!(feePayer instanceof PublicKey)) {
      throw new Error('Fee payer must be an instance of PublicKey');
    }
    this.feePayer = feePayer;
  }

  validate() {
    if (!this.recentBlockhash) {
      throw new Error('Recent blockhash is required.');
    }
    if (!this.feePayer) {
      throw new Error('Fee payer is required.');
    }
    if (this.instructions.length === 0) {
      throw new Error('At least one instruction is required.');
    }
  }

  toJSON() {
    return {
      feePayer: this.feePayer.toBase58(),
      recentBlockhash: this.recentBlockhash,
      instructions: this.instructions.map((instr) => instr.toJSON()),
      timestamp: this.timestamp,
      fees: this.fees,
    };
  }

  static fromJSON(data) {
    const transaction = new Transaction();
    transaction.setFeePayer(new PublicKey(data.feePayer));
    transaction.setRecentBlockhash(data.recentBlockhash);
    transaction.timestamp = data.timestamp;
    transaction.fees = data.fees || 0;
    transaction.instructions = data.instructions.map((instr) =>
      TransactionInstruction.fromJSON(instr)
    );
    return transaction;
  }
}


