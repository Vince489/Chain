import {PublicKey} from './src/publicKey.js';

// From Base58 string
const publicKey1 = new PublicKey('6nB4ix7U9T9jXQ9VY5nYNkD91K5rftWkugLg45PYusnk');

// From Uint8Array
const publicKey2 = new PublicKey(new Uint8Array(32).fill(1));

console.log(publicKey1.toBase58());  // Base58 string representation
console.log(publicKey1.toBytes());   // Uint8Array
console.log(publicKey1.toBuffer());  // Node.js Buffer
console.log(publicKey1.toString());  // Same as toBase58()

const publicKey3 = new PublicKey('6nB4ix7U9T9jXQ9VY5nYNkD91K5rftWkugLg45PYusnk');
console.log(publicKey1.equals(publicKey3));  // true
console.log(publicKey1.equals(publicKey2));  // false
