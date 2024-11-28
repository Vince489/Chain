import { Transaction} from './transaction.js';
import { TransactionInstruction } from './transactionInstruction.js';
import { TransactionMessage } from './transactionMessage.js';
import { Keypair } from './keypair.js';

  // Generate keypairs for sender and recipient
  const senderKeypair = Keypair.generate();
  const recipientKeypair = Keypair.generate();

  const senderPublicKey = senderKeypair.publicKey.toBase58();
  const recipientPublicKey = recipientKeypair.publicKey.toBase58();

// Create a transaction
const transaction = new Transaction(senderPublicKey, recipientPublicKey, 100, Date.now(), 123456);

// Create and add a transfer instruction
const transferInstruction = new TransactionInstruction('transfer', { sender: senderPublicKey, recipient: recipientPublicKey, amount: 100 });
transaction.addInstruction(transferInstruction);

// Validate the transaction
try {
  transaction.validate(); // Check if the transaction is valid (not expired, correct format, etc.)
} catch (error) {
  console.error(error.message);
}

// Create a transaction message with a blockheight (e.g., block 1000)
const transactionMessage = new TransactionMessage(transaction, 1000);

try {
  const currentBlockHeight = 1000; // Transaction is valid within this block
  if (!transactionMessage.isExpired(currentBlockHeight)) {
    console.log("Transaction is valid.");
  }
} catch (error) {
  console.error(error.message);
}


console.log(transactionMessage);
