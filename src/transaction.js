class Transaction {
  constructor() {
    this.instructions = [];
    this.recentBlockhash = null;
    this.feePayer = null;
    this.timestamp = new Date().toISOString(); // Add timestamp for transaction creation
  }

  add(instruction) {
    this.instructions.push(instruction);
  }

  setRecentBlockhash(blockhash) {
    this.recentBlockhash = blockhash;
  }

  setFeePayer(feePayer) {
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
      instructions: this.instructions.map((instr) => ({
        keys: instr.keys,
        programId: instr.programId.toBase58(),
        data: instr.data.toString('base64'),
      })),
      timestamp: this.timestamp, // Add timestamp to JSON output
    };
  }
}

export { Transaction };
