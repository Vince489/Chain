import { PublicKey } from './publicKey.js';
import { FeeCalculator } from './feeCalculator.js';

class NonceAccount {
  constructor({ authorizedPubkey, nonce, feeCalculator }) {
    if (!(authorizedPubkey instanceof PublicKey)) {
      throw new TypeError('authorizedPubkey must be an instance of PublicKey');
    }

    if (typeof nonce !== 'string') {
      throw new TypeError('nonce must be a string');
    }

    if (!(feeCalculator instanceof FeeCalculator)) {
      throw new TypeError('feeCalculator must be an instance of FeeCalculator');
    }

    this.authorizedPubkey = authorizedPubkey;
    this.nonce = nonce;
    this.feeCalculator = feeCalculator;
  }

  /**
   * Deserialize a NonceAccount from account data
   * @param {Buffer | Uint8Array | Array<number>} buffer - Serialized account data
   * @returns {NonceAccount} Deserialized NonceAccount
   */
  static fromAccountData(buffer) {
    if (!buffer || buffer.length < 72) {
      throw new Error('Invalid account data');
    }

    const keyLength = 32; // Public key length in bytes
    const pubkey = new PublicKey(buffer.slice(0, keyLength));
    const nonce = new PublicKey(buffer.slice(keyLength, keyLength * 2)).toString();
    const feeCalculator = FeeCalculator.fromAccountData(buffer.slice(keyLength * 2));

    return new NonceAccount({
      authorizedPubkey: pubkey,
      nonce,
      feeCalculator,
    });
  }

  /**
   * Serialize the NonceAccount into a Buffer
   * @returns {Buffer} Serialized account data
   */
  serialize() {
    const pubkeyBytes = this.authorizedPubkey.toBytes();
    const nonceBytes = new PublicKey(this.nonce).toBytes();
    const feeBytes = this.feeCalculator.serialize();

    const buffer = new Uint8Array(pubkeyBytes.length + nonceBytes.length + feeBytes.length);
    buffer.set(pubkeyBytes, 0);
    buffer.set(nonceBytes, pubkeyBytes.length);
    buffer.set(feeBytes, pubkeyBytes.length + nonceBytes.length);

    return Buffer.from(buffer);
  }
}

export { NonceAccount };

const authorizedKey = new PublicKey('4eF3bP7ZWsp5kQxXEtsf8aM7xsJj6ZJrXKJmL7iRtEgv');
const nonceValue = '5DZfb2XErKmDqWj97vYWg8gYaAjH3hr1eEB2siZMWF5z';
const feeCalculator = new FeeCalculator(1000); // 1000 vinnies per signature

// Create a new NonceAccount
const nonceAccount = new NonceAccount({
  authorizedPubkey: authorizedKey,
  nonce: nonceValue,
  feeCalculator,
});

// Serialize the account
const serializedData = nonceAccount.serialize();
console.log('Serialized NonceAccount:', serializedData);

// Deserialize the account
const deserializedNonceAccount = NonceAccount.fromAccountData(serializedData);
console.log('Deserialized NonceAccount:', deserializedNonceAccount);
