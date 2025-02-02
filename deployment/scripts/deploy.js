const { ethers } = require("hardhat");
const { setTimeout } = require('timers/promises');

// Add configuration validation
function validateConfig(config) {
    const required = ['requiredValidators', 'initialTransferLimit', 'initialFee'];
    for (const field of required) {
        if (!config[field]) throw new Error(`Missing required config: ${field}`);
    }
}

async function validateDeployment(contract, name, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const code = await ethers.provider.getCode(contract.address);
            if (code === '0x') {
                if (i === retries - 1) throw new Error(`${name} deployment failed`);
                await setTimeout(5000); // Wait 5 seconds before retry
                continue;
            }
            console.log(`${name} deployed successfully at ${contract.address}`);
            return true;
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Retry ${i + 1}/${retries} for ${name} deployment validation`);
        }
    }
}

async function deployContract(contractName, ...args) {
    const Contract = await ethers.getContractFactory(contractName);
    
    // Estimate gas before deployment
    const deploymentGas = await Contract.signer.estimateGas(
        Contract.getDeployTransaction(...args)
    );
    console.log(`Estimated gas for ${contractName} deployment: ${deploymentGas.toString()}`);

    const contract = await Contract.deploy(...args);
    console.log(`${contractName} deployment transaction submitted: ${contract.deployTransaction.hash}`);
    
    await contract.deployed();
    await validateDeployment(contract, contractName);
    return contract;
}

async function verifyDeployment(bridge, oracle) {
    console.log("Verifying deployment configuration...");
    
    const bridgeOracle = await bridge.oracle();
    if (bridgeOracle !== oracle.address) {
        throw new Error("Bridge oracle address mismatch");
    }

    const required = await bridge.required();
    console.log(`Required validators: ${required}`);
    
    const transferLimit = await bridge.transferLimit();
    console.log(`Transfer limit: ${ethers.utils.formatEther(transferLimit)} ETH`);
    
    const paused = await bridge.paused();
    console.log(`Bridge paused: ${paused}`);

    return true;
}

async function configureTokens(bridge, tokens) {
    console.log("Configuring supported tokens...");
    for (const token of tokens) {
        await bridge.addSupportedToken(token);
        console.log(`Added supported token: ${token}`);
    }
}

async function configureFees(bridge) {
    console.log("Configuring bridge fees...");
    const initialFee = ethers.utils.parseEther("0.001");
    await bridge.setFee(initialFee);
    console.log(`Set initial fee to: ${ethers.utils.formatEther(initialFee)} ETH`);
}

async function configureRoles(bridge, operators, validators) {
    const operatorRole = await bridge.OPERATOR_ROLE();
    const validatorRole = await bridge.VALIDATOR_ROLE();

    console.log("Configuring roles...");
    
    for (const operator of operators) {
        await bridge.grantRole(operatorRole, operator);
        console.log(`Granted operator role to: ${operator}`);
    }
    
    for (const validator of validators) {
        await bridge.grantRole(validatorRole, validator);
        console.log(`Granted validator role to: ${validator}`);
    }
}

async function main() {
    const config = {
        requiredValidators: 3,
        initialTransferLimit: ethers.utils.parseEther("1000"),
        initialFee: ethers.utils.parseEther("0.001")
    };

    // Validate configuration before deployment
    validateConfig(config);

    const [deployer, addr1, addr2] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

    try {
        const oracle = await deployContract("Oracle");
        const bridge = await deployContract("Bridge", oracle.address, config.requiredValidators);
        const sync = await deployContract("CrossRegionSync");

        await bridge.setTransferLimit(config.initialTransferLimit);

        // Deploy mock tokens for testing
        const mockToken = await deployContract("MockERC20", "Mock", "MCK");
        
        // Configure supported tokens
        await configureTokens(bridge, [mockToken.address]);

        await configureFees(bridge);

        // Configure roles
        const operators = [deployer.address];
        const validators = [deployer.address, addr1.address, addr2.address];
        await configureRoles(bridge, operators, validators);

        // Store deployment addresses
        const fs = require("fs");
        const deployments = {
            oracle: oracle.address,
            bridge: bridge.address,
            sync: sync.address,
            timestamp: new Date().toISOString(),
            network: network.name,
            config: {
                requiredValidators: config.requiredValidators,
                admin: deployer.address,
                initialTransferLimit: ethers.utils.formatEther(config.initialTransferLimit),
                initialFee: ethers.utils.formatEther(await bridge.fee()),
                roles: {
                    operators,
                    validators
                }
            },
            tokens: {
                mock: mockToken.address
            }
        };

        fs.writeFileSync(
            `./deployment/deployments.${network.name}.json`,
            JSON.stringify(deployments, null, 2)
        );

        // Add post-deployment verification
        await verifyDeployment(bridge, oracle);

        // Add deployment event logging
        console.log("Deployment Summary:");
        console.log("==================");
        console.log(`Network: ${network.name}`);
        console.log(`Oracle: ${oracle.address}`);
        console.log(`Bridge: ${bridge.address}`);
        console.log(`Sync: ${sync.address}`);
        console.log(`Required Validators: ${config.requiredValidators}`);
        console.log(`Transfer Limit: ${ethers.utils.formatEther(config.initialTransferLimit)} ETH`);
        console.log(`Initial Fee: ${ethers.utils.formatEther(config.initialFee)} ETH`);
    } catch (error) {
        console.error("Deployment failed:");
        console.error(error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
