import { Level } from 'level';

class TransactionManager {
  constructor(dbLocation = './transactions-db') {
    this.db = new Level(dbLocation); // Initialize LevelDB for transaction storage
  }

  async validateTransaction(transaction) {
    const { sender, recipient, amount } = transaction;
    if (!sender || !recipient || typeof amount !== 'number' || amount <= 0) {
      return false;
    }
    return true;
  }

  async storeTransaction(transaction) {
    const id = `${transaction.sender}-${transaction.timestamp}`;
    await this.db.put(id, JSON.stringify(transaction));
  }
}

export default TransactionManager;
