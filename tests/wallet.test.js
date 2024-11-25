import { Keypair } from '../src/keypair.js';
import { Wallet } from '../src/wallet.js';
import { Transaction } from '../src/transaction.js';

describe('Wallet Class', () => {
  test('should create and store a new keypair', () => {
    const wallet = new Wallet();
    const keypair = wallet.generateKeypair();

    // Verify that the wallet has one keypair and the public key matches
    expect(wallet.getPublicKeys()).toHaveLength(1);
    expect(wallet.getPublicKeys()[0]).toEqual(keypair.publicKey);
  });

  test('should add an existing keypair to the wallet', () => {
    const wallet = new Wallet();
    const keypair = Keypair.generate();
    wallet.addKeypair(keypair);

    // Verify that the keypair has been added
    expect(wallet.getPublicKeys()).toHaveLength(1);
    expect(wallet.getPublicKeys()[0]).toEqual(keypair.publicKey);
  });

  test('should sign a transaction with the correct keypair', () => {
    const wallet = new Wallet();
    const keypair = wallet.generateKeypair();

    // Mock transaction setup
    const transaction = new Transaction();
    transaction.addInstruction({
      programId: 'dummyProgram',
      keys: [],
      data: new Uint8Array([1, 2, 3]),
    });

    // Sign the transaction
    wallet.signTransaction(transaction, 0);

    // Verify that the transaction contains the correct signature
    expect(transaction.signatures).toHaveLength(1);
    expect(transaction.signatures[0].publicKey).toEqual(keypair.publicKey);
  });

  test('should throw an error when trying to sign with an invalid index', () => {
    const wallet = new Wallet();
    const transaction = new Transaction();

    // Attempting to sign without keypairs should throw
    expect(() => wallet.signTransaction(transaction, 0)).toThrow('Invalid keypair index');
  });

  test('should export a keypair\'s secret key', () => {
    const wallet = new Wallet();
    const keypair = wallet.generateKeypair();

    const exportedSecretKey = wallet.exportSecretKey(0);

    // Verify that the exported secret key matches the keypair's secret key
    expect(exportedSecretKey).toEqual(keypair.secretKey);
  });

  test('should throw an error when exporting a secret key with an invalid index', () => {
    const wallet = new Wallet();

    // Attempting to export a keypair with no keypairs in the wallet should throw
    expect(() => wallet.exportSecretKey(0)).toThrow('Invalid keypair index');
  });
});
