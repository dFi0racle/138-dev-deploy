import { 
    DefenderRelayProvider,
    DefenderRelaySigner,
    DefenderConfig
} from '@openzeppelin/defender-sdk';

export const defenderConfig: DefenderConfig = {
    apiKey: process.env.DEFENDER_TEAM_API_KEY!,
    apiSecret: process.env.DEFENDER_TEAM_SECRET_KEY!
};

export const MONITOR_CONFIG = {
    maxPendingTransfers: 100,
    maxTransferAge: 3600, // 1 hour
    minBalanceThreshold: '1000000000000000000', // 1 ETH
    healthCheckInterval: 300, // 5 minutes
    alertThreshold: 3,
    supportedNetworks: [
        'ethereum',
        'polygon',
        'arbitrum',
        'optimism',
        'avalanche',
        'bsc',
        'base',
        'gnosis',
        'fantom',
        'metis'
    ]
};
