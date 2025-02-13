require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("solidity-coverage");
require("dotenv").config();
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("@typechain/hardhat");

const { resolve } = require("path");
const nodeModulesPath = resolve(__dirname, "node_modules");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  coverage: {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90,
    excludeContracts: [],
    reporter: ['html', 'lcov', 'text'],
    revertStrings: ['mstore', 'require', 'message']
  },
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 0
      }
    },
    polygon: {
      url: "https://polygon-mainnet.g.alchemy.com/v2/demo",
      accounts: []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  mocha: {
    timeout: 40000
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6"
  }
};
