
import {PublicKey} from '../src/publicKey.js';  // Assuming PublicKey class is in publicKey.js
import bs58 from 'bs58';

describe('PublicKey', () => {
  const validBase58Key = '6nB4ix7U9T9jXQ9VY5nYNkD91K5rftWkugLg45PYusnk'; // Example valid Base58 key
  const validUint8ArrayKey = new Uint8Array(32).fill(1); // Example valid Uint8Array key
  const invalidBase58Key = 'InvalidKey!';
  const invalidUint8ArrayKey = new Uint8Array(10); // Invalid length

  describe('Constructor', () => {
    it('should initialize with a valid Base58 string', () => {
      const publicKey = new PublicKey(validBase58Key);
      expect(publicKey.toBase58()).toBe(validBase58Key);
    });

    it('should initialize with a valid Uint8Array', () => {
      const publicKey = new PublicKey(validUint8ArrayKey);
      expect(publicKey.toBytes()).toEqual(validUint8ArrayKey);
    });

    it('should throw an error for invalid Base58 string', () => {
      expect(() => new PublicKey(invalidBase58Key)).toThrow('Non-base58 character in public key');
    });

    it('should throw an error for invalid Uint8Array length', () => {
      expect(() => new PublicKey(invalidUint8ArrayKey)).toThrow('Invalid public key length');
    });

    it('should throw an error for invalid input type', () => {
      expect(() => new PublicKey(12345)).toThrow('PublicKey must be a Base58 string or Uint8Array');
    });
  });

  describe('Methods', () => {
    let publicKey;

    beforeEach(() => {
      publicKey = new PublicKey(validBase58Key);
    });

    it('toBase58() should return the Base58 string', () => {
      expect(publicKey.toBase58()).toBe(validBase58Key);
    });

    it('toBytes() should return the Uint8Array', () => {
      expect(publicKey.toBytes()).toEqual(bs58.decode(validBase58Key));
    });

    it('toBuffer() should return the Buffer', () => {
      const buffer = publicKey.toBuffer();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer).toEqual(Buffer.from(bs58.decode(validBase58Key)));
    });

    it('toString() should return the Base58 string', () => {
      expect(publicKey.toString()).toBe(validBase58Key);
    });

    it('equals() should return true for identical keys', () => {
      const otherPublicKey = new PublicKey(validBase58Key);
      expect(publicKey.equals(otherPublicKey)).toBe(true);
    });

    it('equals() should return false for different keys', () => {
      const otherPublicKey = new PublicKey(validUint8ArrayKey);
      expect(publicKey.equals(otherPublicKey)).toBe(false);
    });

    it('equals() should throw an error for non-PublicKey arguments', () => {
      expect(() => publicKey.equals('notAPublicKey')).toThrow('Argument must be a PublicKey');
    });
  });
});
