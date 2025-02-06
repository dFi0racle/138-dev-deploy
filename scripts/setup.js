const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Recursion tracking
let operationCount = 0;
const MAX_OPERATIONS = 1000;
const SAFETY_TIMEOUT = 30000; // 30 seconds
const OPERATION_TIMESTAMPS = new Map();
const MIN_OPERATION_INTERVAL = 100; // ms

function checkOperationThrottling(operationName) {
  const now = Date.now();
  const lastRun = OPERATION_TIMESTAMPS.get(operationName);
  
  if (lastRun && (now - lastRun) < MIN_OPERATION_INTERVAL) {
    throw new Error(`Operation ${operationName} called too frequently`);
  }
  
  OPERATION_TIMESTAMPS.set(operationName, now);
  return true;
}

function checkOperationLimit() {
  operationCount++;
  if (operationCount > MAX_OPERATIONS) {
    throw new Error('Operation limit exceeded');
  }
  return true;
}

async function generateDockerCompose() {
  checkOperationLimit();
  checkOperationThrottling('generateDockerCompose');
  const template = {
    version: '3.8',
    services: {
      node: {
        image: 'ethereum/client-go:latest',
        ports: ['8545:8545', '8546:8546'],
        volumes: ['./ethereum:/root/.ethereum'],
        command: '--http --http.addr "0.0.0.0" --http.api "eth,net,web3,personal"'
      }
    }
  };

  fs.writeFileSync(
    path.join(__dirname, '../docker-compose.yml'),
    JSON.stringify(template, null, 2)
  );
}

async function main() {
  const timeoutId = setTimeout(() => {
    console.error('Setup timeout - operation took too long');
    process.exit(1);
  }, SAFETY_TIMEOUT);

  try {
    console.log('Setting up development environment...');
    
    // Generate docker-compose.yml
    await generateDockerCompose();
    
    // Generate .env if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, '../.env'))) {
      fs.writeFileSync(path.join(__dirname, '../.env'),
        'PRIVATE_KEY=\nINFURA_API_KEY=\nETHERSCAN_API_KEY=\nDEFENDER_TEAM_API_KEY=\n'
      );
    }
    
    // Test configuration
    if (process.argv.includes('--test')) {
      console.log('Testing configuration...');
      execSync('docker-compose config', { stdio: 'inherit' });
    }
    
    console.log('Setup complete! Please fill in your .env file.');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    clearTimeout(timeoutId);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
