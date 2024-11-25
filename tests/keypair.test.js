import * as bip39 from 'bip39';
import { Keypair } from '../src/keypair.js';
import { PublicKey } from '../src/publicKey.js';

describe('Keypair Class', () => {
  test('should generate a valid Ed25519 keypair', () => {
    const keypair = Keypair.generate();

    expect(keypair.publicKey).toBeInstanceOf(PublicKey);
    expect(keypair.secretKey).toBeInstanceOf(Uint8Array);
    expect(keypair.secretKey).toHaveLength(64);
  });

  test('should generate a mnemonic and derive a keypair from it', () => {
    const keypair = new Keypair();

    // Ensure mnemonic is generated
    const mnemonic = keypair.getMnemonic();
    expect(mnemonic).toBeDefined();
    expect(bip39.validateMnemonic(mnemonic)).toBe(true);

    // Recover from the mnemonic and ensure the keys match
    const recoveredKeypair = keypair.recoverFromMnemonic();
    expect(recoveredKeypair.publicKey.equals(keypair.publicKey)).toBe(true);
    expect(recoveredKeypair.secretKey).toEqual(keypair.secretKey);
  });

  test('should derive a keypair from a provided mnemonic', () => {
    const mnemonic = bip39.generateMnemonic();
    const keypair = new Keypair(mnemonic);

    expect(keypair.getMnemonic()).toBe(mnemonic);
    expect(keypair.publicKey).toBeInstanceOf(PublicKey);
    expect(keypair.secretKey).toBeInstanceOf(Uint8Array);
  });

  test('should throw an error for an invalid mnemonic', () => {
    const invalidMnemonic = 'this is not a valid mnemonic';
    expect(() => new Keypair(invalidMnemonic)).toThrow('Invalid mnemonic');
  });

  test('should validate the public key correctly', () => {
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey;

    expect(publicKey).toBeInstanceOf(PublicKey);
    expect(() => new PublicKey(publicKey.toBytes())).not.toThrow();
    expect(() => new PublicKey(publicKey.toBase58())).not.toThrow();
  });

  test('should detect invalid public key length', () => {
    const invalidKey = new Uint8Array(31); // 31 bytes, not 32
    expect(() => new PublicKey(invalidKey)).toThrow('Invalid public key length');
  });

  test('should correctly encode and decode public keys to/from Base58', () => {
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey;

    const encoded = publicKey.toBase58();
    const decoded = new PublicKey(encoded);

    expect(decoded.toBytes()).toEqual(publicKey.toBytes());
  });

  test('should compare public keys for equality', () => {
    const keypair1 = Keypair.generate();
    const keypair2 = Keypair.generate();

    expect(keypair1.publicKey.equals(keypair2.publicKey)).toBe(false);
    expect(keypair1.publicKey.equals(keypair1.publicKey)).toBe(true);
  });
});
