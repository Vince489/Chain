import { Level } from 'level';

class BalanceManager {
  constructor(dbLocation = './balances-db') {
    this.db = new Level(dbLocation); // Initialize LevelDB for balance storage
  }

  async getBalance(publicKey) {
    try {
      const balance = await this.db.get(publicKey);
      return parseInt(balance, 10);
    } catch (err) {
      if (err.notFound) return 0; // Return 0 if no balance exists
      throw err;
    }
  }

  async updateBalance(publicKey, amount) {
    const currentBalance = await this.getBalance(publicKey);
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance.');
    }

    await this.db.put(publicKey, newBalance.toString());
  }

  async updateBalances(transaction) {
    const { sender, recipient, amount } = transaction;

    if (sender !== 'system') {
      await this.updateBalance(sender, -amount);
    }
    await this.updateBalance(recipient, amount);
  }
}

export default BalanceManager;
