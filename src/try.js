import Blockchain from './blockchain.js'; // Import your Blockchain class
import Keypair from './keypair.js'; // Import the Keypair class

(async () => {
  const blockchain = new Blockchain();

  // Generate keypairs for sender and recipient
  const senderKeypair = Keypair.generate();
  const recipientKeypair = Keypair.generate();

  const senderPublicKey = senderKeypair.publicKey.toBase58();
  const recipientPublicKey = recipientKeypair.publicKey.toBase58();

  // Step 1: Initialize balances
  console.log('Initializing balances...');
  await blockchain.updateBalance(senderPublicKey, 1_000_000_000); // 10 VRT (1 VRT = 100,000,000 vinnies)

  console.log(`Sender (${senderPublicKey}) Initial Balance:`, await blockchain.getBalance(senderPublicKey));
  console.log(`Recipient (${recipientPublicKey}) Initial Balance:`, await blockchain.getBalance(recipientPublicKey));

  // Step 2: Process a transaction
  const amountToSend = 500_000_000; // 5 VRT
  console.log(`Processing transaction of ${amountToSend / 100_000_000} VRT...`);

  await blockchain.processTransaction(senderPublicKey, recipientPublicKey, amountToSend);

  // Step 3: Verify updated balances
  console.log(`Sender (${senderPublicKey}) Updated Balance:`, await blockchain.getBalance(senderPublicKey));
  console.log(`Recipient (${recipientPublicKey}) Updated Balance:`, await blockchain.getBalance(recipientPublicKey));
})();
