import { TransactionExpiredBlockheightExceededError } from "./TransactionExpiredBlockheightExceededError.js";

class TransactionMessage {
  constructor(transaction, blockHeight) {
    this.transaction = transaction;
    this.blockHeight = blockHeight || 0; // Blockheight is set for transaction expiration logic
  }

  // Check if the transaction has expired based on block height or timeout
  isExpired(currentBlockHeight) {
    if (this.blockHeight && currentBlockHeight > this.blockHeight) {
      throw new TransactionExpiredBlockheightExceededError("Transaction expired due to blockheight limit.");
    }
    return false;
  }
}

export { TransactionMessage };
