import { ethers } from "hardhat";
import { ChainConfigs, RouterAddresses } from "../config/chains";
import { DefenderRelayProvider, DefenderRelaySigner } from "@openzeppelin/defender-sdk";

async function main() {
    console.log("Deploying CCIP Bridge with Defender...");

    // Get the network configuration
    const network = await ethers.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    // Get the chain config
    const chainConfig = Object.values(ChainConfigs).find(c => c.id === chainId);
    if (!chainConfig) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    console.log(`Deploying to ${chainConfig.name} (Chain ID: ${chainId})`);
    
    // Get the router address for this chain
    const routerAddress = RouterAddresses[chainConfig.name.toUpperCase() as keyof typeof RouterAddresses];
    if (!routerAddress) {
        throw new Error(`No router address found for chain: ${chainConfig.name}`);
    }
    
    // Initialize Defender provider and signer
    const credentials = {
        apiKey: process.env.DEFENDER_API_KEY!,
        apiSecret: process.env.DEFENDER_API_SECRET!
    };
    
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
    
    // Deploy CCIPBridge
    const CCIPBridge = await ethers.getContractFactory("CCIPBridge");
    const supportedChains = Object.values(ChainConfigs)
        .filter(c => c.id !== chainId) // Exclude current chain
        .map(c => BigInt(c.selector));
    
    console.log("Deploying with parameters:");
    console.log("Router:", routerAddress);
    console.log("Supported Chains:", supportedChains);
    
    const ccipBridge = await CCIPBridge.connect(signer).deploy(
        routerAddress,
        supportedChains,
        { gasLimit: 8000000 }
    );
    
    await ccipBridge.deployed();
    console.log("CCIPBridge deployed to:", ccipBridge.address);
    
    // Deploy Reporter
    const Reporter = await ethers.getContractFactory("Reporter");
    const reporter = await Reporter.connect(signer).deploy();
    
    await reporter.deployed();
    console.log("Reporter deployed to:", reporter.address);
    
    // Set up roles
    const REPORTER_ROLE = await reporter.REPORTER_ROLE();
    await reporter.grantRole(REPORTER_ROLE, ccipBridge.address);
    console.log("Granted REPORTER_ROLE to CCIPBridge");
    
    return {
        ccipBridge: ccipBridge.address,
        reporter: reporter.address,
        chainId,
        chainName: chainConfig.name
    };
}

main()
    .then((deployments) => {
        console.log("Deployments completed:", deployments);
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
