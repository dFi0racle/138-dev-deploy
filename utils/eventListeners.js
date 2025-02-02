
const Web3 = require('web3');
const ethWeb3 = new Web3('http://localhost:8545'); // Ethereum fork RPC

function setupEventListeners() {
  ethWeb3.eth.subscribe('pendingTransactions', (error, txHash) => {
    if (!error) {
      ethWeb3.eth.getTransaction(txHash).then((tx) => {
        console.log(tx);
      });
    }
  });
}

module.exports = { setupEventListeners };