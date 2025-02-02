# 138-Chain Deployment

This project sets up a development environment for deploying a 138-chain ecosystem. The deployment includes forking the Ethereum Mainnet, integrating two-way Tether contracts, mirroring transactions to Polygon PoS, and bootstrapping a full suite of on-chain contracts.

## Prerequisites

- Linux (x86_64), macOS (Intel processor), or Windows (64-bit with WSL2)
- Docker and Docker Compose
- Node.js (v12 or higher)
- Git
- cURL

## Setup

1. Install dependencies:
```sh
npm install
```

2. Configure Hardhat:
```sh
npx hardhat node
```

3. Deploy contracts:
```sh
npx hardhat run scripts/deploy.js
```

## Testing

```sh
npx hardhat test
```

## Directory Structure

- `contracts/`: Solidity contract files
- `scripts/`: Deployment scripts
- `test/`: Test files
- `docker/`: Docker configuration