# Development Guide

## Prerequisites

- Node.js v16+
- Go 1.19+
- Solidity 0.8.x
- Docker & Docker Compose

## Local Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/138-dev-deploy.git
cd 138-dev-deploy
```

2. Install dependencies
```bash
npm install
```

3. Copy environment file
```bash
cp .env.example .env
```

4. Configure your environment variables

5. Start local network
```bash
npm run network:start
```

## Development Workflow

1. Make changes to contracts in `contracts/` directory
2. Run tests:
```bash
npm run test
```

3. Deploy to testnet:
```bash
npm run deploy:testnet
```

## Code Structure

- `contracts/`: Smart contracts
- `deployment/`: Deployment scripts and configurations
- `network-specs/`: Network specifications
- `tools/`: Development and maintenance tools

## Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests
npm run test
```
