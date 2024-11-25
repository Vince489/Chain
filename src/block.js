import crypto from 'crypto';

class Block {
  /**
   * @param {number} index - The block's position in the chain.
   * @param {string} previousHash - The hash of the previous block.
   * @param {Array} transactions - List of transactions included in the block.
   * @param {number} timestamp - Block creation timestamp.
   */
  constructor(index, previousHash, transactions, timestamp = Date.now()) {
    this.index = index;
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.timestamp = timestamp;
    this.hash = this.calculateHash();
  }

  /**
   * Calculate the hash for the block.
   * @returns {string} The SHA-256 hash of the block's contents.
   */
  calculateHash() {
    const data = `${this.index}${this.previousHash}${JSON.stringify(this.transactions)}${this.timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export default Block;
