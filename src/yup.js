import Blockchain from './blockchain.js'; // Import your Blockchain class
import Keypair from './keypair.js'; // Import the Keypair class
import { Transaction } from './transaction.js'; // Import the Transaction class
import { TransactionInstruction } from './transactionInstruction.js'; // Import the TransactionInstruction class
import { PublicKey } from './publicKey.js'; // Import PublicKey class

(async () => {
  const blockchain = new Blockchain();

  // Generate keypairs for sender and recipient
  const senderKeypair = Keypair.generate();
  const recipientKeypair = Keypair.generate();

  const senderPublicKey = senderKeypair.publicKey.toBase58();
  const recipientPublicKey = recipientKeypair.publicKey.toBase58();

  // Convert string public keys to PublicKey objects
  const senderPubkey = new PublicKey(senderPublicKey);
  const recipientPubkey = new PublicKey(recipientPublicKey);

  // Step 1: Initialize balances
  console.log('Initializing balances...');
  await blockchain.updateBalance(senderPublicKey, 1_000_000_000); // 10 VRT (1 VRT = 100,000,000 vinnies)
  await blockchain.updateBalance(recipientPublicKey, 0); // Initialize recipient's balance

  console.log(`Sender (${senderPublicKey}) Initial Balance:`, await blockchain.getBalance(senderPublicKey));
  console.log(`Recipient (${recipientPublicKey}) Initial Balance:`, await blockchain.getBalance(recipientPublicKey));

  // Step 2: Create a transaction with an instruction
  console.log('Creating transaction with transfer instruction...');
  const transaction = new Transaction(senderPublicKey, recipientPublicKey, 500_000_000); // 5 VRT

  // Create a transfer instruction
  const transferInstruction = new TransactionInstruction({
    programId: 'transfer', // Instruction type
    keys: [
      { pubkey: senderPubkey, isSigner: true, isWritable: true },
      { pubkey: recipientPubkey, isSigner: false, isWritable: true },
    ],
    data: Buffer.from(JSON.stringify({ amount: 500_000_000 })), // Transfer amount in VRT
  });

  // Validate the instruction
  try {
    transferInstruction.validate();
  } catch (error) {
    console.error('Instruction validation failed:', error.message);
    return;
  }

  // Add the instruction to the transaction
  transaction.addInstruction(transferInstruction);

  // Validate the transaction
  try {
    transaction.validate();
  } catch (error) {
    console.error('Transaction validation failed:', error.message);
    return;
  }

  // Process the transaction
  console.log('Processing transaction...');
  await blockchain.processTransaction(senderPublicKey, recipientPublicKey, 500_000_000);

  // Step 3: Verify updated balances
  console.log(`Sender (${senderPublicKey}) Updated Balance:`, await blockchain.getBalance(senderPublicKey));
  console.log(`Recipient (${recipientPublicKey}) Updated Balance:`, await blockchain.getBalance(recipientPublicKey));

  // Step 4: Add a block with the transaction
  const transactions = [transaction]; // Add the transaction object directly to the block
  await blockchain.addBlock(transactions);

  // Step 5: Display the added block
  const latestBlock = blockchain.getLatestBlock();
  console.log('Latest Block:', latestBlock);

  // Step 6: Verify blockchain integrity
  const isValid = blockchain.validateBlockchain();
  console.log('Blockchain is valid:', isValid);
})();
