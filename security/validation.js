const { ethers } = require("hardhat");

class SecurityValidator {
    static validateAddress(address) {
        if (!ethers.utils.isAddress(address)) {
            throw new Error(`Invalid address: ${address}`);
        }
        if (address === ethers.constants.AddressZero) {
            throw new Error("Zero address not allowed");
        }
        return true;
    }

    static validateAmount(amount, limit) {
        const value = ethers.BigNumber.from(amount);
        if (value.lte(0)) throw new Error("Amount must be positive");
        if (limit && value.gt(limit)) throw new Error("Amount exceeds limit");
        return true;
    }

    static validateSignature(signature) {
        if (!ethers.utils.isHexString(signature, 65)) {
            throw new Error("Invalid signature format");
        }
        return true;
    }

    static async validateContract(address) {
        const code = await ethers.provider.getCode(address);
        if (code === '0x') throw new Error("Not a contract address");
        return true;
    }
}

module.exports = SecurityValidator;
