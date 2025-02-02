const { ethers } = require("hardhat");

class SecurityChecker {
    static async checkContractBalance(address) {
        const balance = await ethers.provider.getBalance(address);
        if (balance.gt(ethers.utils.parseEther("100"))) {
            console.warn(`High balance warning: ${ethers.utils.formatEther(balance)} ETH in ${address}`);
        }
        return balance;
    }

    static async checkPendingTransactions(address) {
        const nonce = await ethers.provider.getTransactionCount(address, "latest");
        const pendingNonce = await ethers.provider.getTransactionCount(address, "pending");
        return pendingNonce - nonce;
    }

    static async validateRoles(contract, address, roles) {
        const results = await Promise.all(
            roles.map(async role => ({
                role,
                hasRole: await contract.hasRole(role, address)
            }))
        );
        return results;
    }
}

module.exports = SecurityChecker;
