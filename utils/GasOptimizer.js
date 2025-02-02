const { ethers } = require("hardhat");

class GasOptimizer {
    static async estimateWithBuffer(tx, buffer = 1.1) {
        const gasEstimate = await tx.estimateGas();
        return gasEstimate.mul(ethers.BigNumber.from(Math.ceil(buffer * 100))).div(100);
    }

    static async getOptimalGasPrice(provider, priority = "medium") {
        const feeData = await provider.getFeeData();
        const priorities = {
            low: 0.9,
            medium: 1.0,
            high: 1.2
        };
        return feeData.gasPrice.mul(ethers.BigNumber.from(Math.ceil(priorities[priority] * 100))).div(100);
    }

    static async optimizeCalldata(data) {
        // Remove redundant padding
        return data.replace(/0{24}(?=[0-9a-f]{40})/g, '');
    }
}

module.exports = GasOptimizer;
