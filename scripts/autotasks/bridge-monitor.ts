import { ActionClient } from '@openzeppelin/defender-sdk-action-client';
import { MonitorClient } from '@openzeppelin/defender-sdk-monitor-client';
import { RelayClient } from '@openzeppelin/defender-sdk-relay-client';
import { ExternalCreateBlockMonitorRequest } from '@openzeppelin/defender-sdk-monitor-client/lib/models/monitor';
import { Result } from '@ethersproject/abi';
import { ethers } from 'ethers';
import { ChainConfigs } from '../../config/chains';
import { defenderConfig, MONITOR_CONFIG } from '../../config/defender';
import CCIPBridgeABI from '../../artifacts/contracts/bridges/CCIPBridge.sol/CCIPBridge.json';

// Use monitoring configuration from defender config
const {
    maxPendingTransfers,
    maxTransferAge,
    minBalanceThreshold,
    healthCheckInterval,
    alertThreshold,
    supportedNetworks
} = MONITOR_CONFIG;

export async function handler(credentials: { apiKey: string; apiSecret: string }) {
    try {
        // Initialize Defender clients
        const defender = {
            monitor: new MonitorClient({ apiKey: credentials.apiKey, apiSecret: credentials.apiSecret }),
            relay: new RelayClient({ apiKey: credentials.apiKey, apiSecret: credentials.apiSecret }),
            action: new ActionClient({ apiKey: credentials.apiKey, apiSecret: credentials.apiSecret })
        };

        // Initialize providers for each supported network
        const providers = supportedNetworks.map(network => {
            const config = ChainConfigs[network];
            if (!config) throw new Error(`Network ${network} not configured`);
            return new ethers.providers.JsonRpcProvider(config.rpcUrls[0]);
        });

        // Monitor bridge contracts on each supported network
        for (const network of supportedNetworks) {
            const chain = ChainConfigs[network];
            if (!chain) continue;
            console.log(`Monitoring bridge on ${chain.name}...`);
            
            const bridgeAddress = process.env[`CCIP_BRIDGE_${chain.name.toUpperCase()}`];
            if (!bridgeAddress) {
                console.error(`Missing bridge address for ${chain.name}`);
                continue;
            }

            const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrls[0]);
            const bridge = new ethers.Contract(bridgeAddress, CCIPBridgeABI.abi, provider);

            // Check bridge balance
            const balance = await provider.getBalance(bridgeAddress);
            if (balance.lt(ethers.BigNumber.from(minBalanceThreshold))) {
                const monitorRequest: ExternalCreateBlockMonitorRequest = {
                    type: 'BLOCK',
                    name: `Bridge Monitor - ${chain.name}`,
                    network: chain.name,
                    addresses: [bridgeAddress],
                    abi: JSON.stringify(CCIPBridgeABI.abi),
                    notificationChannels: ['email'],
                    paused: false,
                    alertThreshold: {
                        amount: alertThreshold,
                        windowSeconds: healthCheckInterval
                    },
                    conditions: [{
                        eventSignature: 'TokensSent(bytes32,uint64,address,uint256)',
                        expression: `balance < ${minBalanceThreshold}`
                    }],
                    riskCategory: 'FINANCIAL'
                };
                await defender.monitor.create(monitorRequest);
                console.log(`Created balance monitor for ${chain.name} bridge at ${bridgeAddress}`);
            }

            // Monitor pending transfers
            const filter = bridge.filters.TokensSent();
            const events = await bridge.queryFilter(filter, -1000);
            const pendingTransfers = events.filter(e => e.args && !e.args.processed);

            if (pendingTransfers.length > maxPendingTransfers) {
                const monitorRequest: ExternalCreateBlockMonitorRequest = {
                    type: 'BLOCK',
                    name: `Bridge Monitor - Pending Transfers - ${chain.name}`,
                    network: chain.name,
                    addresses: [bridgeAddress],
                    abi: JSON.stringify(CCIPBridgeABI.abi),
                    notificationChannels: ['email'],
                    paused: false,
                    conditions: [{
                        eventSignature: 'TokensSent(bytes32,uint64,address,uint256)',
                        expression: null
                    }],
                    riskCategory: 'FINANCIAL'
                };
                await defender.monitor.create(monitorRequest);
                console.log(`Created pending transfers monitor for ${chain.name} bridge at ${bridgeAddress}`);
            }

            // Check for stuck transfers
            const currentTime = Math.floor(Date.now() / 1000);
            const stuckTransfers = pendingTransfers.filter(e => {
                const transferAge = e.args ? currentTime - e.args.timestamp.toNumber() : 0;
                return transferAge > maxTransferAge;
            });

            if (stuckTransfers.length > 0) {
                const monitorRequest: ExternalCreateBlockMonitorRequest = {
                    type: 'BLOCK',
                    name: `Bridge Monitor - Stuck Transfers - ${chain.name}`,
                    network: chain.name,
                    addresses: [bridgeAddress],
                    abi: JSON.stringify(CCIPBridgeABI.abi),
                    notificationChannels: ['email'],
                    paused: false,
                    conditions: [{
                        eventSignature: 'TokensSent(bytes32,uint64,address,uint256)',
                        expression: `block.timestamp - timestamp > ${maxTransferAge}`
                    }],
                    riskCategory: 'FINANCIAL'
                };
                await defender.monitor.create(monitorRequest);
                console.log(`Created stuck transfers monitor for ${chain.name} bridge at ${bridgeAddress}`);
            }
        }
    } catch (error) {
        console.error('Error in bridge monitor:', error);
        throw error;
    }
}
