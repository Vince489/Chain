import { Level } from 'level';
import crypto from 'crypto';

class Blockchain {
  constructor() {
    this.db = new Level('blockchain-db', { valueEncoding: 'json' });
    this.chain = []; // Holds the blocks
  }

  /**
   * Get the balance for a public key.
   * @param {string} publicKey - The public key (Base58 encoded).
   * @returns {Promise<number>} The balance in vinnies.
   */
  async getBalance(publicKey) {
    try {
      const balance = await this.db.get(publicKey);
      return parseInt(balance, 10); // Convert to integer
    } catch (err) {
      if (err.notFound) {
        return 0; // If no balance exists, return 0
      }
      throw err; // Re-throw other errors
    }
  }

  /**
   * Update the balance for a public key.
   * @param {string} publicKey - The public key (Base58 encoded).
   * @param {number} amount - Amount to adjust the balance by.
   * @returns {Promise<void>} Resolves when the update is complete.
   */
  async updateBalance(publicKey, amount) {
    const currentBalance = await this.getBalance(publicKey);
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance.');
    }

    await this.db.put(publicKey, newBalance.toString()); // Store balance as a string
  }

  /**
   * Add a new block to the chain.
   * @param {Array} transactions - The list of transactions to be included in the block.
   */
  async addBlock(transactions) {
    const block = {
      index: this.chain.length + 1,
      previousHash: this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : null,
      timestamp: Date.now(),
      transactions,
      hash: this.calculateHash(transactions),
    };

    // Store block in the database
    await this.db.put(`block_${block.index}`, JSON.stringify(block));

    // Add block to chain
    this.chain.push(block);
  }

  /**
   * Calculate the hash of a block based on its transactions.
   * @param {Array} transactions - The list of transactions to be hashed.
   * @returns {string} The hash of the block.
   */
  calculateHash(transactions) {
    const blockData = JSON.stringify(transactions) + Date.now();
    return crypto.createHash('sha256').update(blockData).digest('hex');
  }

  /**
   * Process a transaction.
   * @param {string} sender - Sender's public key (Base58 encoded).
   * @param {string} recipient - Recipient's public key (Base58 encoded).
   * @param {number} amount - Amount to transfer in vinnies.
   * @returns {Promise<void>} Resolves when the transaction is complete.
   */
  async processTransaction(sender, recipient, amount) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero.');
    }

    const timestamp = Date.now(); // Add a timestamp to each transaction

    // Deduct from sender
    await this.updateBalance(sender, -amount);

    // Add to recipient
    await this.updateBalance(recipient, amount);

    // Log the transaction in a transaction table
    const transaction = {
      sender,
      recipient,
      amount,
      timestamp,
    };

    await this.db.put(`tx_${timestamp}_${sender}_${recipient}`, JSON.stringify(transaction)); // Store transaction with a unique key
  }

  /**
   * Get latest block in the chain.
   * @returns {Object} The latest block.
   */
  async getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Validate the blockchain to ensure integrity.
   * @returns {boolean} True if the blockchain is valid, false otherwise.
   */
  validateBlockchain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if the hash of the current block matches the previous block's hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log('Blockchain is invalid: Hash mismatch.');
        return false;
      }

      // Check if the current block's hash matches the calculated hash
      if (currentBlock.hash !== this.calculateHash(currentBlock.transactions)) {
        console.log('Blockchain is invalid: Hash mismatch.');
        return false;
      }
    }

    return true;
  }
}

export default Blockchain;
