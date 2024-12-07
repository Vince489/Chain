import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import { PublicKey } from './publicKey.js';
import { generateKeypair, getPublicKey } from './utils/ed25519.js';  // Importing the generateKeypair function

/**
 * A Keypair class for managing public and private keys.
 */
export class Keypair {
  /**
   * Internal storage of the Ed25519 keypair
   * @private
   */
  _keypair;
  _mnemonic;  // To store the mnemonic used for generation

  /**
   * Create a new keypair instance.
   * If no mnemonic is provided, generate a random mnemonic and keypair.
   * If mnemonic is provided, generate a keypair from it.
   *
   * @param {string} [mnemonic] An optional mnemonic to generate the keypair.
   */
  constructor(mnemonic) {
    if (mnemonic) {
      // If mnemonic is provided, generate keypair from it
      this._keypair = Keypair.fromMnemonic(mnemonic);
      this._mnemonic = mnemonic;
    } else {
      // Otherwise, generate a random mnemonic and keypair
      this._mnemonic = bip39.generateMnemonic();
      this._keypair = Keypair.fromMnemonic(this._mnemonic);
    }
  }

  /**
   * Generate a new random keypair.
   *
   * @returns {Keypair} A new Keypair instance with generated public and secret keys.
   */
  static generate() {
    const { publicKey, secretKey } = generateKeypair(); // Generate the keypair using the utility function
    const keypair = {
      publicKey,
      secretKey,
    };
    return new KeypairFromGenerated(keypair);
  }

  /**
   * Generate a keypair from a BIP39 mnemonic.
   *
   * @param {string} mnemonic The BIP39 mnemonic phrase.
   * @returns {Object} The keypair generated from the mnemonic (publicKey, secretKey).
   */
  static fromMnemonic(mnemonic) {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }

    // Convert mnemonic to seed (32 bytes)
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    // Use the first 32 bytes of the seed for Ed25519 key generation
    const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));

    return keypair;
  }

  /**
   * Get the public key associated with this keypair.
   *
   * @returns {PublicKey} The public key.
   */
  get publicKey() {
    return new PublicKey(this._keypair.publicKey);
  }

  /**
   * Get the secret key associated with this keypair.
   *
   * @returns {Uint8Array} The secret key as a Uint8Array.
   */
  get secretKey() {
    return new Uint8Array(this._keypair.secretKey);
  }

  /**
   * Get the mnemonic used to generate this keypair (if available).
   *
   * @returns {string} The mnemonic (if generated from one), or undefined.
   */
  getMnemonic() {
    return this._mnemonic;
  }

  /**
   * Recreate the keypair from the stored mnemonic.
   *
   * @returns {Keypair} A new Keypair instance recovered from the mnemonic.
   */
  recoverFromMnemonic() {
    if (!this._mnemonic) {
      throw new Error('No mnemonic available to recover from');
    }
    return new Keypair(this._mnemonic);
  }

  /**
   * Generate a keypair from a secret key (64-byte).
   *
   * @param {Uint8Array} secretKey The 64-byte secret key.
   * @param {Object} [options] Options for validation.
   * @returns {Keypair} The keypair generated from the secret key.
   */
  static fromSecretKey(secretKey, options) {
    if (secretKey.byteLength !== 64) {
      throw new Error('bad secret key size');
    }

    const publicKey = secretKey.slice(32, 64);

    if (!options || !options.skipValidation) {
      const privateKey = secretKey.slice(0, 32);

      // Use getPublicKey to derive the public key from the private key
      const computedPublicKey = getPublicKey(privateKey);

      for (let ii = 0; ii < 32; ii++) {
        if (publicKey[ii] !== computedPublicKey[ii]) {
          throw new Error('provided secretKey is invalid');
        }
      }
    }

    return new Keypair({ publicKey, secretKey });
  }
}

/**
 * A helper class for generating and managing keypairs from generated keys.
 */
class KeypairFromGenerated extends Keypair {
  constructor(keypair) {
    super();
    this._keypair = keypair;
  }
}

// Export the Keypair class
export default Keypair;
