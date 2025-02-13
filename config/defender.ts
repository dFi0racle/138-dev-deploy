import { ActionClient } from '@openzeppelin/defender-sdk-action-client';
import { MonitorClient } from '@openzeppelin/defender-sdk-monitor-client';
import { RelayClient } from '@openzeppelin/defender-sdk-relay-client';

export const defenderConfig = {
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
