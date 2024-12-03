class Blockchain {
  constructor() {
    this.chain = [];
    this.blockchainDB = new Level('blockchain-db', { valueEncoding: 'json' }); // Blockchain storage
    this.indexDB = new Level('index-db', { valueEncoding: 'json' }); // Index storage
    this.balancesDB = new Level('balances-db', { valueEncoding: 'json' }); // Balances storage
  }

  // Initialize the blockchain
  async initialize() {
    try {
      for await (const [key, value] of this.blockchainDB.iterator()) {
        this.chain.push(value);
      }
      console.log('Blockchain loaded successfully.');
    } catch (error) {
      console.log('No blockchain found. Creating genesis block...');
      await this.addBlock([]); // Create genesis block
    }
  }

  // Add a block and update indexes
  async addBlock(transactions) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(this.chain.length, transactions, previousBlock?.hash || null);

    // Persist block to blockchainDB
    this.chain.push(newBlock);
    await this.blockchainDB.put(newBlock.index.toString(), newBlock);

    // Update indexes
    await this.updateIndexes(newBlock);
  }

  // Update indexes for a block
  async updateIndexes(block) {
    for (const transaction of block.transactions) {
      // Index transaction ID -> block index
      const transactionId = transaction.id; // Assuming transaction has a unique `id` field
      await this.indexDB.put(`transaction:${transactionId}`, block.index);

      // Index public keys -> transaction IDs
      for (const key of transaction.keys) {
        const publicKey = key.pubkey;
        const existingTransactions = (await this.indexDB.get(`publicKey:${publicKey}`).catch(() => [])) || [];
        existingTransactions.push(transactionId);
        await this.indexDB.put(`publicKey:${publicKey}`, existingTransactions);
      }
    }
  }

  // Retrieve block by transaction ID
  async getBlockByTransactionId(transactionId) {
    try {
      const blockIndex = await this.indexDB.get(`transaction:${transactionId}`);
      return await this.blockchainDB.get(blockIndex.toString());
    } catch (error) {
      console.error(`Error retrieving block for transaction ID ${transactionId}:`, error.message);
      return null;
    }
  }

  // Retrieve transactions for a public key
  async getTransactionsByPublicKey(publicKey) {
    try {
      const transactionIds = (await this.indexDB.get(`publicKey:${publicKey}`).catch(() => [])) || [];
      const transactions = [];
      for (const transactionId of transactionIds) {
        const blockIndex = await this.indexDB.get(`transaction:${transactionId}`);
        const block = await this.blockchainDB.get(blockIndex.toString());
        transactions.push(...block.transactions.filter(tx => tx.id === transactionId));
      }
      return transactions;
    } catch (error) {
      console.error(`Error retrieving transactions for public key ${publicKey}:`, error.message);
      return [];
    }
  }

  // Get the latest block
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Update the balance of a specific public key (in vinnies)
  async updateBalance(publicKey, amount) {
    const balanceKey = `balance:${publicKey}`;
    let currentBalance = await this.balancesDB.get(balanceKey).catch(() => 0);
    currentBalance += amount; // Update balance by adding the given amount
    await this.balancesDB.put(balanceKey, currentBalance);
    console.log(`Balance updated for ${publicKey}: ${currentBalance}`);
  }

  // Get the current balance of a specific public key
  async getBalance(publicKey) {
    const balanceKey = `balance:${publicKey}`;
    const balance = await this.balancesDB.get(balanceKey).catch(() => 0);
    return balance;
  }
}

export default Blockchain;
