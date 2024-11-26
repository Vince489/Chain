import { Level } from 'level';


class Blockchain {
  constructor() {
    this.db = new Level('./blockchain-db'); // Initialize LevelDB for storing blockchain state
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
        // If no balance exists, return 0
        return 0;
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

    // Deduct from sender
    await this.updateBalance(sender, -amount);

    // Add to recipient
    await this.updateBalance(recipient, amount);
  }
}

export default Blockchain;
