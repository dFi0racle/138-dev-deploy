const { ethers } = require("hardhat");

class DeploymentVerifier {
    constructor(network) {
        this.network = network;
        this.results = [];
    }

    async verifyContract(address, constructorArgs = []) {
        try {
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: constructorArgs,
            });
            this.results.push({
                address,
                status: 'verified',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            if (!error.message.includes('Already Verified')) {
                throw error;
            }
        }
    }

    async verifyContractCode(address) {
        const code = await ethers.provider.getCode(address);
        if (code === '0x') {
            throw new Error(`No code at address ${address}`);
        }
        return true;
    }

    async verifyProxyImplementation(proxy, implementation) {
        const implAddress = await proxy.implementation();
        if (implAddress.toLowerCase() !== implementation.toLowerCase()) {
            throw new Error('Implementation address mismatch');
        }
        return true;
    }

    getResults() {
        return {
            network: this.network,
            verifications: this.results,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = DeploymentVerifier;
