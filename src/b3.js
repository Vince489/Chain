import Block from './block.js';
import { Level } from 'level';

class Blockchain {
  constructor() {
    this.chain = [];
    this.blockchainDB = new Level('blockchain-db', { valueEncoding: 'json' }); // Blockchain storage
    this.indexDB = new Level('index-db', { valueEncoding: 'json' }); // Index storage
  }

  // Initialize the blockchain (load from DB or create genesis block)
  async initialize() {
    try {
      for await (const [key, value] of this.blockchainDB.iterator()) {
        this.chain.push(value); // Load blocks from the database
      }
      console.log('Blockchain loaded successfully.');
    } catch (error) {
      console.log('No blockchain found. Creating genesis block...');
      await this.addBlock([]); // Create genesis block
    }
  }

  // Add a block to the chain
  async addBlock(transactions) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(this.chain.length, transactions, previousBlock?.hash || null);

    this.chain.push(newBlock);
    await this.blockchainDB.put(newBlock.index.toString(), newBlock); // Persist the block
    await this.indexBlock(newBlock); // Index the block
  }

  // Index transactions in a block
  async indexBlock(block) {
    const blockHeight = block.index;

    for (let i = 0; i < block.transactions.length; i++) {
      const transaction = block.transactions[i];
      const transactionHash = transaction.hash;

      // Index by transaction hash
      await this.indexDB.put(`transaction:${transactionHash}`, {
        blockHeight,
        position: i,
      });

      // Index by addresses
      const { sender, recipient } = transaction;
      if (sender) {
        await this.indexDB.put(`address:${sender}:${transactionHash}`, blockHeight);
      }
      if (recipient) {
        await this.indexDB.put(`address:${recipient}:${transactionHash}`, blockHeight);
      }

      // Add transaction to block index
      const transactionsInBlock = (await this.indexDB.get(`block:${blockHeight}`).catch(() => [])) || [];
      transactionsInBlock.push(transactionHash);
      await this.indexDB.put(`block:${blockHeight}`, transactionsInBlock);
    }
  }

  // Query Methods

  // Find a transaction by hash
  async findTransactionByHash(hash) {
    try {
      const { blockHeight, position } = await this.indexDB.get(`transaction:${hash}`);
      const block = await this.blockchainDB.get(blockHeight.toString());
      return block.transactions[position];
    } catch {
      return null; // Transaction not found
    }
  }

  // Find transactions by account address
  async findTransactionsByAddress(address) {
    const transactions = [];
    for await (const [key, value] of this.indexDB.iterator({ gte: `address:${address}:`, lt: `address:${address}~` })) {
      const { blockHeight, position } = value;
      const block = await this.blockchainDB.get(blockHeight.toString());
      transactions.push(block.transactions[position]);
    }
    return transactions;
  }

  // Find all transactions in a block
  async findTransactionsInBlock(blockHeight) {
    try {
      const transactionHashes = await this.indexDB.get(`block:${blockHeight}`);
      const block = await this.blockchainDB.get(blockHeight.toString());
      return transactionHashes.map((_, i) => block.transactions[i]);
    } catch {
      return [];
    }
  }

  // Rebuild the index (e.g., if corrupted or missing)
  async rebuildIndex() {
    console.log('Rebuilding index...');
    for await (const [key, value] of this.blockchainDB.iterator()) {
      const block = value; // Deserialize block from stored data
      await this.indexBlock(block);
    }
    console.log('Index rebuilt successfully.');
  }

  // Get the latest block
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Validate the blockchain
  validateBlockchain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if (currentBlock.hash !== currentBlock.calculateHash() || currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

export default Blockchain;
