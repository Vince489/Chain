// Usage: import { generatePrivateKey, generateKeypair, getPublicKey, isOnCurve, sign, verify } from './utils/ed25519.js';

import nacl from 'tweetnacl';

/**
 * Generates a random 32-byte private key.
 * @returns {Uint8Array} A private scalar.
 */
function generatePrivateKey() {
  return nacl.randomBytes(32);
}

/**
 * Generates an Ed25519 keypair.
 * @returns {{ publicKey: Uint8Array, secretKey: Uint8Array }} The generated keypair.
 */
function generateKeypair() {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: keypair.publicKey,
    secretKey: keypair.secretKey,
  };
}

/**
 * Derives the public key from a given private key.
 * @param {Uint8Array} privateKey - The 32-byte private scalar.
 * @returns {Uint8Array} The public key.
 */
function getPublicKey(privateKey) {
  return nacl.sign.keyPair.fromSecretKey(privateKey).publicKey;
}

/**
 * Checks if a given public key is valid and lies on the Ed25519 curve.
 * @param {Uint8Array} publicKey - The public key to check.
 * @returns {boolean} True if valid, false otherwise.
 */
function isOnCurve(publicKey) {
  try {
    nacl.sign.keyPair.fromSecretKey(new Uint8Array([...new Array(32).fill(0), ...publicKey]));
    return true;
  } catch {
    return false;
  }
}

/**
 * Signs a message using the secret key.
 * @param {Uint8Array | Buffer} message - The message to sign.
 * @param {Uint8Array} secretKey - The 64-byte secret key.
 * @returns {Uint8Array} The signature.
 */
function sign(message, secretKey) {
  // Use the entire 64-byte secret key
  return nacl.sign.detached(message, secretKey);
}

/**
 * Verifies a signature against a message and public key.
 * @param {Uint8Array | Buffer} message - The original message.
 * @param {Uint8Array} signature - The signature to verify.
 * @param {Uint8Array} publicKey - The public key.
 * @returns {boolean} True if valid, false otherwise.
 */
function verify(message, signature, publicKey) {
  return nacl.sign.detached.verify(message, signature, publicKey);
}

export { 
  generatePrivateKey, 
  generateKeypair, 
  getPublicKey, 
  isOnCurve, 
  sign, 
  verify 
};

