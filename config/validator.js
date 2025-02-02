const { ethers } = require("hardhat");

class ConfigValidator {
    static validate(config) {
        this.validateNetwork(config.network);
        this.validateDeployment(config.deployment);
        this.validateContracts(config.contracts);
        return true;
    }

    static validateNetwork(network) {
        const required = ['chainId', 'name', 'rpcUrl'];
        required.forEach(field => {
            if (!network[field]) throw new Error(`Missing network.${field}`);
        });
    }

    static validateDeployment(deployment) {
        if (!deployment.confirmations || deployment.confirmations < 1) {
            throw new Error('Invalid confirmations count');
        }
        if (!ethers.utils.isHexString(deployment.gasPrice)) {
            throw new Error('Invalid gas price format');
        }
    }

    static validateContracts(contracts) {
        const required = ['oracle', 'bridge', 'sync'];
        required.forEach(contract => {
            if (!contracts[contract]) {
                throw new Error(`Missing contract config: ${contract}`);
            }
        });
    }
}

module.exports = ConfigValidator;
