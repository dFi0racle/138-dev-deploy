const { ethers } = require("hardhat");
const axios = require("axios");

class HealthMonitor {
    constructor(config) {
        this.config = config;
        this.alerts = [];
    }

    async checkContractHealth(contract, name) {
        try {
            const code = await ethers.provider.getCode(contract.address);
            if (code === '0x') throw new Error(`${name} contract not deployed`);
            
            const health = await contract.checkHealth();
            const version = await contract.getVersion();
            const lastUpdate = await contract.getLastUpdate();
            
            return {
                status: health,
                version,
                lastUpdate: new Date(lastUpdate * 1000).toISOString(),
                address: contract.address
            };
        } catch (error) {
            this.alerts.push({
                severity: 'high',
                message: `Health check failed for ${name}: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            return null;
        }
    }

    async monitorNetwork() {
        const provider = ethers.provider;
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        
        return {
            chainId: network.chainId,
            blockNumber,
            timestamp: new Date().toISOString()
        };
    }

    async reportStatus(endpoint) {
        const status = {
            network: await this.monitorNetwork(),
            alerts: this.alerts,
            timestamp: new Date().toISOString()
        };

        if (endpoint) {
            await axios.post(endpoint, status);
        }

        return status;
    }
}

module.exports = HealthMonitor;
