import Blockchain from './blockchain.js'; // Import your Blockchain class
import Keypair from './keypair.js'; // Import the Keypair class
import { Transaction } from './transaction.js'; // Import the Transaction class
import { TransactionInstruction } from './transactionInstruction.js'; // Import the TransactionInstruction class
import { SystemProgram } from '../src/programs/sp3.js'; // Import the SystemProgram class

(async () => {
  const blockchain = new Blockchain();

  // Generate keypairs for sender and recipient
  const senderKeypair = Keypair.generate();
  const recipientKeypair = Keypair.generate();

  const senderPublicKey = senderKeypair.publicKey;
  const recipientPublicKey = recipientKeypair.publicKey;

  // Initialize balances
  console.log('Initializing balances...');
  await blockchain.updateBalance(senderPublicKey.toBase58(), 1_000_000_000); // 10 VRT
  await blockchain.updateBalance(recipientPublicKey.toBase58(), 0); // 0 VRT

  console.log(`Sender Balance:`, await blockchain.getBalance(senderPublicKey.toBase58()));
  console.log(`Recipient Balance:`, await blockchain.getBalance(recipientPublicKey.toBase58()));

  // Define transfer amount (5 VRT in vinnies)
  const transferAmount = 500_000_000;

  // Create a transaction
  const transaction = new Transaction();
  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: senderPublicKey, isSigner: true, isWritable: true },
        { pubkey: recipientPublicKey, isSigner: false, isWritable: true },
      ],
      programId: SystemProgram.programId,
      data: SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        vinnies: transferAmount,
      }).data,
    })
  );

  transaction.feePayer = senderPublicKey;

  // Process the transaction
  try {
    await blockchain.processTransaction(senderPublicKey.toBase58(), recipientPublicKey.toBase58(), transferAmount);
    console.log('Transaction processed successfully.');
  } catch (error) {
    console.error('Transaction processing failed:', error.message);
    return;
  }

  // Add the transaction to a new block
  await blockchain.addBlock([transaction.toJSON()]);

  // Display the added block
  const latestBlock = blockchain.getLatestBlock();
  console.log('Latest Block:', latestBlock);

  // Verify blockchain integrity
  const isValid = blockchain.validateBlockchain();
  console.log('Blockchain is valid:', isValid);

  // Verify balances
  console.log(`Sender Updated Balance:`, await blockchain.getBalance(senderPublicKey.toBase58()));
  console.log(`Recipient Updated Balance:`, await blockchain.getBalance(recipientPublicKey.toBase58()));

  // Fetch transactions by sender's public key using the new index
  const senderTransactions = await blockchain.getTransactionsByPublicKey(senderPublicKey.toBase58());
  console.log('Sender Transactions:', senderTransactions);

  // Fetch transactions by recipient's public key using the new index
  const recipientTransactions = await blockchain.getTransactionsByPublicKey(recipientPublicKey.toBase58());
  console.log('Recipient Transactions:', recipientTransactions);

  // Optionally, fetch a block by transaction ID
  // (if you have the transaction ID from the processed transaction)
  const transactionId = transaction.id; // Assuming `transaction.id` is available
  const block = await blockchain.getBlockByTransactionId(transactionId);
  console.log('Block containing the transaction:', block);
})();
