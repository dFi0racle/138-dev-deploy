#!/bin/bash

# Load environment variables
source ../.env

# Deploy contracts
npx hardhat run scripts/deploy.js --network polygon

# Verify contracts
npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1" "Constructor argument 2"
