const { ethers } = require("hardhat");
const HealthMonitor = require("./health");

class ContractMonitor {
    constructor(contracts, config = {}) {
        this.contracts = contracts;
        this.healthMonitor = new HealthMonitor(config);
        this.metrics = new Map();
    }

    async monitorGasUsage(txHash) {
        const receipt = await ethers.provider.getTransactionReceipt(txHash);
        this.metrics.set('gasUsed', (this.metrics.get('gasUsed') || 0) + receipt.gasUsed.toNumber());
        return receipt.gasUsed;
    }

    async monitorEvents(contract, eventName) {
        const filter = contract.filters[eventName]();
        contract.on(filter, (...args) => {
            const event = args[args.length - 1];
            this.metrics.set(`${eventName}_count`, (this.metrics.get(`${eventName}_count`) || 0) + 1);
            console.log(`Event ${eventName} detected in tx ${event.transactionHash}`);
        });
    }

    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
}

module.exports = ContractMonitor;
