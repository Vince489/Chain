import { Transaction} from './transaction.js';
import { TransactionInstruction } from './transactionInstruction.js';
import { TransactionMessage } from './transactionMessage.js';

// Create a transaction
const transaction = new Transaction('sender-public-key', 'recipient-public-key', 100, Date.now(), 123456);

// Create and add a transfer instruction
const transferInstruction = new TransactionInstruction('transfer', { sender: 'sender-public-key', recipient: 'recipient-public-key', amount: 100 });
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

