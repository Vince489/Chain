// src/Wallet.js
import { Keypair } from './keypair.js';

class Wallet {
  constructor() {
    this.keypairs = []; // Array to store Keypair objects
  }

  // Generate and add a new keypair
  generateKeypair() {
    const keypair = Keypair.generate();
    this.keypairs.push(keypair);
    return keypair;
  }

  // Add an existing keypair to the wallet
  addKeypair(keypair) {
    this.keypairs.push(keypair);
  }

  // Retrieve the public keys for all accounts
  getPublicKeys() {
    return this.keypairs.map(keypair => keypair.publicKey);
  }

  // Sign a transaction with a specific keypair
  signTransaction(transaction, index = 0) {
    if (index >= this.keypairs.length) {
      throw new Error('Invalid keypair index');
    }
    const keypair = this.keypairs[index];
    transaction.sign(keypair);
  }

  // Export a keypair's secret key for backup
  exportSecretKey(index = 0) {
    if (index >= this.keypairs.length) {
      throw new Error('Invalid keypair index');
    }
    return this.keypairs[index].secretKey;
  }
}

export { Wallet };
