import crypto from 'crypto';

class Block {
  constructor(index, transactions, previousHash = null) {
    this.index = index; // Block index
    this.transactions = transactions; // Transactions in this block
    this.timestamp = Date.now(); // Timestamp when block is created
    this.previousHash = previousHash; // Previous block's hash
    this.hash = this.calculateHash(); // Block's hash
  }

  // Calculate the hash of the block (combines transactions and previous hash)
  calculateHash() {
    const blockData = `${JSON.stringify(this.transactions)}${this.previousHash}${this.timestamp}`;
    return crypto.createHash('sha256').update(blockData).digest('hex');
  }

  // Serialize block to JSON for storage
  toJSON() {
    return {
      index: this.index,
      transactions: this.transactions,
      timestamp: this.timestamp,
      previousHash: this.previousHash,
      hash: this.hash,
    };
  }

  // Deserialize JSON back to a Block instance
  static fromJSON(data) {
    const block = new Block(data.index, data.transactions, data.previousHash);
    block.timestamp = data.timestamp;
    block.hash = data.hash;
    return block;
  }
}

export default Block;
