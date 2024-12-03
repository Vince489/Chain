// blockchain.js
import Block from './block.js'; 
import { Balance } from './balance.js'; 

class Blockchain {
  constructor() {
    this.chain = [];  // Array to store blocks
    this.balanceManager = new Balance();  // Instance of Balance class
    // Create the genesis block (the first block in the blockchain)
    this.addBlock([]);  // Start the chain with an empty block (Genesis block)
  }

  // Method to get balance of a given public key
  async getBalance(publicKey) {
    return await this.balanceManager.get(publicKey);
  }

  // Method to update balance for a public key
  async updateBalance(publicKey, amount) {
    await this.balanceManager.update(publicKey, amount);
  }

  // Method to process a transaction (balance transfer)
  async processTransaction(sender, recipient, amount) {
    // Check sender balance
    const senderBalance = await this.getBalance(sender);
    if (senderBalance < amount) {
      throw new Error('Sender has insufficient funds.');
    }

    // Perform the balance transfer
    await this.balanceManager.transfer(sender, recipient, amount);
    console.log(`Transaction processed: ${amount} transferred from ${sender} to ${recipient}`);
  }

  // Method to add a block to the blockchain
  async addBlock(transactions) {
    const previousBlock = this.getLatestBlock();
    const block = new Block(this.chain.length + 1, transactions, previousBlock ? previousBlock.hash : null);
    this.chain.push(block);
  }

  // Method to get the latest block in the chain
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Method to validate the integrity of the blockchain
  validateBlockchain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if the hash of the current block matches its computed hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Check if the previous block hash matches the current block's previousHash
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

export default Blockchain;
