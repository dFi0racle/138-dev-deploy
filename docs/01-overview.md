# Overview

This multi-faceted deployment is designed to simulate a production-level environment with the following components:

## Components

### Ethereum Mainnet Fork
A local or containerized fork of Ethereum Mainnet serves as the backbone for on-chain operations. This allows you to work with a current state of Ethereum without impacting the live network.

### Two-Way Tether Contracts
Enable asset transfers between the forked environment and the Ethereum Mainnet. These contracts are bi-directional and ensure that tethered assets can be both locked and released as needed.

### Transaction Mirroring to Polygon PoS
All transactions that occur on the forked Ethereum network will be mirrored to a Polygon PoS network instance. This facilitates cross-chain data consistency and testing of multi-chain interactions.

### Genesis Contract Deployment
The genesis block will be preloaded with a suite of contracts such as:
- Oracle
- AMB (Arbitrary Message Bridge)
- Multicall3
- Additional blockchain contracts

These contracts support your network's functionality from day one.
