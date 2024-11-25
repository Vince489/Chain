import { Transaction } from '../src/transaction.js';
import { Account } from '../src/account.js';
import { PublicKey } from '../src/publicKey.js'; // Adjust the path as necessary


test('Transaction signing and verification', () => {
  const sender = new Account();
  const recipient = new Account();

  const transaction = new Transaction(
    new PublicKey(sender.getPublicKey()),
    new PublicKey(recipient.getPublicKey()),
    100
  );
  transaction.signTransaction(sender.keypair.secretKey);

  expect(transaction.verifyTransaction()).toBe(true);
});

test('Account public key validation', () => {
  const account = new Account();
  expect(account.isPublicKeyValid()).toBe(true);
});

test('Account balance updates', () => {
  const account = new Account();
  account.updateBalance(100);
  expect(account.balance).toBe(100);

  account.updateBalance(-50);
  expect(account.balance).toBe(50);

  expect(() => account.updateBalance(-100)).toThrow('Insufficient balance');
});
