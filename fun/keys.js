import nacl from 'tweetnacl';
import bs58 from 'bs58'; // For encoding keys in a user-friendly format

function generateKeypair() {
  // Generate a new keypair
  const keypair = nacl.sign.keyPair();

  // Convert keys to Base58 for readability and storage
  const publicKey = bs58.encode(keypair.publicKey);
  const privateKey = bs58.encode(keypair.secretKey);

  return { publicKey, privateKey };
}

// Usage
const keypair = generateKeypair();
console.log('Public Key:', keypair.publicKey);
console.log('Private Key:', keypair.privateKey);
