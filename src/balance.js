import { Level } from 'level';

class Balance {
  constructor(dbPath = 'balances-db') {
    this.db = new Level(dbPath, { valueEncoding: 'json' });
  }

  /**
   * Get the balance for a public key.
   * @param {PublicKey} publicKey - The public key object.
   * @returns {Promise<number>} The balance in vinnies.
   */
  async get(publicKey) {
    try {
      const balance = await this.db.get(publicKey.toString());
      return parseInt(balance, 10); // Return balance as an integer
    } catch (err) {
      if (err.notFound) {
        return 0; // Default to 0 if balance is not found
      }
      throw err; // Re-throw other errors
    }
  }

  /**
   * Update the balance for a public key.
   * @param {PublicKey} publicKey - The public key object.
   * @param {number} amount - The amount to adjust the balance by.
   * @returns {Promise<void>} Resolves when the update is complete.
   */
  async update(publicKey, amount) {
    const currentBalance = await this.get(publicKey);
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance.');
    }

    await this.db.put(publicKey.toString(), newBalance.toString());
  }

  /**
   * Transfer balance between accounts.
   * @param {PublicKey} sender - The sender's public key object.
   * @param {PublicKey} recipient - The recipient's public key object.
   * @param {number} amount - The amount to transfer.
   * @returns {Promise<void>} Resolves when the transfer is complete.
   */
  async transfer(sender, recipient, amount) {
    if (amount <= 0) {
      throw new Error('Transfer amount must be greater than zero.');
    }

    await this.update(sender, -amount); // Deduct from sender
    await this.update(recipient, amount); // Credit to recipient
  }
}

export { Balance };
