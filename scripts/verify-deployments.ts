import { ethers, run } from "hardhat";
import { ChainConfigs } from "../config/chains";
import { RelayClient } from "@openzeppelin/defender-sdk-relay-client";
import { HardhatRuntimeEnvironment } from "hardhat/types";

declare const hre: HardhatRuntimeEnvironment;

async function main() {
    console.log("Verifying contract deployments across networks...");

    const credentials = {
        apiKey: process.env.DEFENDER_API_KEY!,
        apiSecret: process.env.DEFENDER_API_SECRET!
    };

    // Verify each network
    for (const chain of Object.values(ChainConfigs)) {
        console.log(`\nVerifying ${chain.name}...`);
        
        const relay = new RelayClient(credentials);
        
        try {
            // Get contract addresses from environment
            const bridgeAddress = process.env[`CCIP_BRIDGE_${chain.name.toUpperCase()}`];
            const reporterAddress = process.env[`REPORTER_${chain.name.toUpperCase()}`];
            
            if (!bridgeAddress || !reporterAddress) {
                console.error(`Missing contract addresses for ${chain.name}`);
                continue;
            }

            // Verify contract code
            await run("verify:verify", {
                address: bridgeAddress,
                constructorArguments: [
                    chain.router,
                    Object.values(ChainConfigs)
                        .filter(c => c.id !== chain.id)
                        .map(c => BigInt(c.selector))
                ]
            });

            await run("verify:verify", {
                address: reporterAddress,
                constructorArguments: []
            });

            console.log(`✓ Verified contracts on ${chain.name}`);
        } catch (error) {
            console.error(`Error verifying contracts on ${chain.name}:`, error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
