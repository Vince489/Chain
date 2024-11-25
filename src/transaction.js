import { PublicKey } from './publicKey.js';
import { sign, verify } from './utils/ed25519.js'; 

export class Transaction {
  constructor(sender, recipient, amount) {
    if (!(sender instanceof PublicKey) || !(recipient instanceof PublicKey)) {
      throw new TypeError('Sender and recipient must be instances of PublicKey');
    }
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = Date.now();
    this.signature = null;
  }

  /**
   * Sign the transaction with the sender's private key
   * @param {Uint8Array} privateKey The private key of the sender
   */
  signTransaction(privateKey) {
    const message = this._serializeForSigning();
    this.signature = sign(message, privateKey);
  }

  /**
   * Verify the transaction's signature
   * @returns {boolean} True if the signature is valid, false otherwise
   */
  verifyTransaction() {
    if (!this.signature) {
      throw new Error('Transaction is not signed');
    }

    const message = this._serializeForSigning();
    return verify(message, this.signature, this.sender._key);
  }

  /**
   * Serialize the transaction for signing (binary format)
   * @returns {Uint8Array}
   */
  _serializeForSigning() {
    const data = JSON.stringify({
      sender: this.sender.toBase58(),
      recipient: this.recipient.toBase58(),
      amount: this.amount,
      timestamp: this.timestamp,
    });
    return new TextEncoder().encode(data);
  }

  /**
   * Serialize the transaction to JSON format
   * @returns {string} JSON string representation of the transaction
   */
  serialize() {
    return JSON.stringify({
      sender: this.sender.toBase58(),
      recipient: this.recipient.toBase58(),
      amount: this.amount,
      timestamp: this.timestamp,
      signature: this.signature ? Buffer.from(this.signature).toString('base64') : null,
    });
  }

  /**
   * Deserialize a transaction from JSON format
   * @param {string} json JSON string representation of a transaction
   * @returns {Transaction}
   */
  static deserialize(json) {
    const data = JSON.parse(json);
    const transaction = new Transaction(
      new PublicKey(data.sender),
      new PublicKey(data.recipient),
      data.amount
    );
    transaction.timestamp = data.timestamp;
    if (data.signature) {
      transaction.signature = Buffer.from(data.signature, 'base64');
    }
    return transaction;
  }
}
