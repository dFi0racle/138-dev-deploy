const { ethers } = require("hardhat");

const config = {
    oracle: {
        initialAuthorities: [],
    },
    bridge: {
        requiredValidators: 3,
        initialTransferLimit: ethers.utils.parseEther("1000"),
        initialFee: ethers.utils.parseEther("0.001"),
        supportedTokens: [],
        roles: {
            operators: [],
            validators: []
        }
    },
    deployment: {
        confirmations: 6,
        timeout: 60000,
        gasPrice: ethers.utils.parseUnits("50", "gwei"),
        gasLimit: 6000000
    },
    monitoring: {
        healthCheck: true,
        alertThreshold: 3,
        errorReporting: true
    }
};

function validateConfig(config) {
    const requiredFields = [
        'oracle.initialAuthorities',
        'bridge.requiredValidators',
        'bridge.initialTransferLimit',
        'bridge.initialFee',
        'bridge.roles.operators',
        'bridge.roles.validators'
    ];

    for (const field of requiredFields) {
        const value = field.split('.').reduce((obj, key) => obj[key], config);
        if (!value) throw new Error(`Missing required config: ${field}`);
    }

    if (config.bridge.requiredValidators < 2) {
        throw new Error('Required validators must be at least 2');
    }

    if (config.bridge.roles.validators.length < config.bridge.requiredValidators) {
        throw new Error('Insufficient validators configured');
    }

    return true;
}

module.exports = {
    config,
    validateConfig
};
