import { generateKeypair, sign, verify } from './utils/ed25519.js';
import { NonceAccount } from './nonceAccount.js';
import { PublicKey } from './publicKey.js';
import { FeeCalculator } from './feeCalculator.js';

// Generate a keypair
const { publicKey, secretKey } = generateKeypair();

// Create a NonceAccount
const nonceAccount = new NonceAccount({
  authorizedPubkey: new PublicKey(publicKey),
  nonce: 'sample_nonce',
  feeCalculator: new FeeCalculator(1000), // Custom feeCalculator
});

// Sign a message (e.g., serialized nonceAccount)
const message = nonceAccount.serialize();
const signature = sign(message, secretKey);

// Verify the signature
const isValid = verify(message, signature, publicKey);
console.log('Is the signature valid?', isValid);
