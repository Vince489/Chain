class Transaction {
  constructor(sender, recipient, amount, timestamp, nonce) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = timestamp || Date.now();
    this.nonce = nonce || this.generateNonce();
    this.instructions = [];
  }

  // Generate a unique nonce for each transaction
  generateNonce() {
    return Math.floor(Math.random() * 1e9); // Simple nonce generator for MVP
  }

  // Add instructions to the transaction (e.g., fund transfer, contract interaction)
  addInstruction(instruction) {
    this.instructions.push(instruction);
  }

  // Validate transaction: Ensure no expiration, check balances, etc.
  validate() {
    // You can add validation logic here (e.g., expiration check, balance check)
    const currentTime = Date.now();
    if (this.timestamp + 3600000 < currentTime) { // Transaction expired after 1 hour
      throw new TransactionExpiredTimeoutError("Transaction expired.");
    }
  }
}

export { Transaction };