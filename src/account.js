import Keypair from './keypair.js';
import { PublicKey } from './publicKey.js';

/**
 * The Account class manages an individual account in the blockchain system,
 * including its keypair and balance.
 */
export class Account {
  /**
   * Create a new Account instance.
   * Optionally, a mnemonic can be provided to generate the account's keypair.
   *
   * @param {string} [mnemonic] An optional BIP39 mnemonic for deterministic keypair generation.
   */
  constructor(mnemonic) {
    this.keypair = new Keypair(mnemonic); // Generate or recover keypair
    this.balance = 0; // Default balance is 0
  }

  /**
   * Get the public key for the account.
   *
   * @returns {PublicKey} The public key associated with the account.
   */
  getPublicKey() {
    return this.keypair.publicKey;
  }

  /**
   * Update the account's balance.
   *
   * @param {number} amount The amount to update the balance by.
   *                        Can be positive (credit) or negative (debit).
   */
  updateBalance(amount) {
    if (typeof amount !== 'number') {
      throw new TypeError('Amount must be a number');
    }
    this.balance += amount;

    if (this.balance < 0) {
      throw new Error('Balance cannot be negative');
    }
  }

  /**
   * Get the mnemonic used for keypair generation.
   *
   * @returns {string} The mnemonic phrase, or undefined if not generated from one.
   */
  getMnemonic() {
    return this.keypair.getMnemonic();
  }

  /**
   * Recreate the account from its mnemonic.
   *
   * @returns {Account} A new Account instance with the same keypair.
   */
  recoverFromMnemonic() {
    const mnemonic = this.getMnemonic();
    if (!mnemonic) {
      throw new Error('No mnemonic available to recover from');
    }
    return new Account(mnemonic);
  }

  /**
   * Serialize the account into a plain object for storage or transmission.
   *
   * @returns {Object} Serialized account data.
   */
  serialize() {
    return {
      publicKey: this.getPublicKey().toBase58(),
      balance: this.balance,
    };
  }

  /**
   * Deserialize an account from serialized data.
   *
   * @param {Object} data Serialized account data.
   * @returns {Account} A new Account instance.
   */
  static deserialize(data) {
    if (!data || typeof data !== 'object') {
      throw new TypeError('Invalid data for deserialization');
    }
    const account = new Account();
    account.keypair = new Keypair();
    account.keypair._keypair.publicKey = new PublicKey(data.publicKey).toBytes();
    account.balance = data.balance;
    return account;
  }
}

export default Account;
