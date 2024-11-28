// block.js
import crypto from 'crypto';

class Block {
  constructor(index, transactions, previousHash = null) {
    this.index = index;  // Block index
    this.transactions = transactions;  // Transactions in this block
    this.timestamp = Date.now();  // Timestamp when block is created
    this.previousHash = previousHash;  // Previous block's hash
    this.hash = this.calculateHash();  // Block's hash
  }

  // Calculate the hash of the block (combines transactions and previous hash)
  calculateHash() {
    const blockData = `${JSON.stringify(this.transactions)}${this.previousHash}${this.timestamp}`;
    return crypto.createHash('sha256').update(blockData).digest('hex');
  }
}

export default Block;
