# Forking Ethereum Mainnet

## Setup Process

### 1. Install Dependencies
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

### 2. Configure Hardhat
Create `hardhat.config.js`:
```javascript
require("@nomiclabs/hardhat-ethers");

module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
        blockNumber: 13000000
      }
    }
  },
  solidity: "0.8.17"
};
```

### 3. Launch Fork
```bash
npx hardhat node
```

## Verification
1. Check if the fork is running:
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

2. Test connection using Web3.js:
```javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
web3.eth.getBlockNumber().then(console.log);
