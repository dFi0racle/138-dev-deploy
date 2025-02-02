const { ethers } = require("hardhat");

class TestHelper {
    static async impersonateAccount(address) {
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [address],
        });
        return ethers.provider.getSigner(address);
    }

    static async mineBlocks(count) {
        for (let i = 0; i < count; i++) {
            await network.provider.send("evm_mine");
        }
    }

    static async timeTravel(seconds) {
        await network.provider.send("evm_increaseTime", [seconds]);
        await network.provider.send("evm_mine");
    }

    static async getEventArgs(tx, eventName) {
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === eventName);
        return event ? event.args : null;
    }
}

module.exports = TestHelper;
