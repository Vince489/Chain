import Blockchain from './blockchain.js';
import Keypair from './keypair.js';

(async () => {
  const blockchain = new Blockchain();

  const senderKeypair = Keypair.generate();
  const recipientKeypair = Keypair.generate();
  const minerKeypair = Keypair.generate();

  const senderPublicKey = senderKeypair.publicKey.toBase58();
  const recipientPublicKey = recipientKeypair.publicKey.toBase58();
  const minerPublicKey = minerKeypair.publicKey.toBase58();

  await blockchain.balanceManager.updateBalance(senderPublicKey, 1_000_000_000);

  blockchain.addTransaction({
    sender: senderPublicKey,
    recipient: recipientPublicKey,
    amount: 500_000_000,
    timestamp: Date.now(),
  });

  console.log('Mining block...');
  await blockchain.mineBlock(minerPublicKey);

  console.log('Final Balances:');
  console.log(`Sender: ${await blockchain.balanceManager.getBalance(senderPublicKey)}`);
  console.log(`Recipient: ${await blockchain.balanceManager.getBalance(recipientPublicKey)}`);
  console.log(`Miner: ${await blockchain.balanceManager.getBalance(minerPublicKey)}`);
})();
