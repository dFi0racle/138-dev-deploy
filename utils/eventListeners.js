const Web3 = require('web3');
const ethWeb3 = new Web3('http://localhost:8545');

// Track active listeners to prevent memory leaks
const activeListeners = new Set();
const MAX_LISTENERS = 10;

function setupEventListeners() {
  if (activeListeners.size >= MAX_LISTENERS) {
    throw new Error('Maximum listener limit reached');
  }

  const subscription = ethWeb3.eth.subscribe('pendingTransactions', (error, txHash) => {
    if (!error) {
      ethWeb3.eth.getTransaction(txHash).then((tx) => {
        console.log(tx);
      });
    }
  });

  activeListeners.add(subscription);
  return subscription;
}

function cleanupEventListeners() {
  for (const listener of activeListeners) {
    listener.unsubscribe();
  }
  activeListeners.clear();
}

process.on('SIGINT', cleanupEventListeners);
process.on('SIGTERM', cleanupEventListeners);

module.exports = { setupEventListeners, cleanupEventListeners };