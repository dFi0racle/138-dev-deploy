# Deploying Two-Way Tether Contracts

## Contract Architecture

### Core Components
- Bridge Contract
- Token Vault
- Validator Set
- Event Listeners

## Deployment Process

### 1. Contract Compilation
```bash
npx hardhat compile
```

### 2. Deployment Script
```javascript
const deployBridge = async () => {
  const Bridge = await ethers.getContractFactory("TetherBridge");
  const bridge = await Bridge.deploy(
    VALIDATOR_ADDRESSES,
    MIN_VALIDATORS,
    LOCK_PERIOD
  );
  await bridge.deployed();
  return bridge;
};
```

### 3. Bridge Configuration
```javascript
const configureBridge = async (bridge) => {
  await bridge.setTetherContract(TETHER_ADDRESS);
  await bridge.setValidators(VALIDATOR_SET);
  await bridge.setThreshold(CONSENSUS_THRESHOLD);
};
```

## Verification Steps
1. Verify contract deployment
2. Test locking mechanism
3. Validate unlocking process
4. Check validator consensus
