
const Web3 = require('web3');
const ethWeb3 = new Web3('http://localhost:8545'); // Ethereum fork RPC
const polyWeb3 = new Web3('https://polygon-rpc.com'); // Polygon PoS RPC

function relayTransaction(tx) {
  polyWeb3.eth.sendTransaction(tx)
    .on('receipt', console.log)
    .on('error', console.error);
}

module.exports = { relayTransaction };