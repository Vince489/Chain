import { Level } from 'level';
import BalanceManager from './balanceManager.js';
import TransactionManager from './transactionManager.js';
import Block from './block.js';

class Blockchain {
  constructor() {
    this.db = new Level('./blockchain-db'); // Initialize LevelDB for chain storage
    this.balanceManager = new BalanceManager('./balances-db'); // BalanceManager with unique path
    this.transactionManager = new TransactionManager('./transactions-db'); // TransactionManager with unique path
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    return new Block(0, '0', [], Date.now());
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!this.transactionManager.validateTransaction(transaction)) {
      throw new Error('Invalid transaction');
    }
    this.pendingTransactions.push(transaction);
  }

  async mineBlock(minerPublicKey) {
    const rewardTransaction = {
      sender: 'system',
      recipient: minerPublicKey,
      amount: 50_000_000, // 0.5 VRT as mining reward
    };

    this.pendingTransactions.push(rewardTransaction);

    for (const tx of this.pendingTransactions) {
      await this.balanceManager.updateBalances(tx);
      await this.transactionManager.storeTransaction(tx);
    }

    const newBlock = new Block(
      this.chain.length,
      this.getLatestBlock().hash,
      [...this.pendingTransactions]
    );

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    await this.db.put(newBlock.hash, JSON.stringify(newBlock));
    console.log('Block mined and added to the chain:', newBlock);

    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

export default Blockchain;


