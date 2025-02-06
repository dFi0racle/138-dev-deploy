const { ethers } = require('hardhat');
const { DefenderRelaySigner, DefenderRelayProvider } = require('@openzeppelin/defender-sdk');

async function main() {
  console.log('Deploying contracts with Defender...');

  // Setup Defender provider and signer
  const credentials = {
    apiKey: process.env.DEFENDER_TEAM_API_KEY,
    apiSecret: process.env.DEFENDER_TEAM_API_SECRET
  };

  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });

  // Deploy your contracts here
  console.log('Deploying contracts...');
  // Add your contract deployment code here using the signer

  console.log('Deployment complete!');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
