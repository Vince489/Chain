import { Wallet, Transaction } from "./src/index.js";

const wallet = new Wallet();

// Generate a new keypair and add it to the wallet
const keypair = wallet.generateKeypair();

// Create a new transaction
const transaction = new Transaction();

// Add an instruction to the transaction
transaction.addInstruction({
  programId: "Program123",
  keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }],
  data: "Example data" // Add any custom data for the instruction
});

// Sign the transaction with the keypair
wallet.signTransaction(transaction, 0);

// Output the signed transaction
console.log("Transaction:", transaction);
console.log("Signatures:", transaction.signatures);
