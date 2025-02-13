import { 
    DefenderRelayProvider,
    DefenderRelaySigner,
    RelayerParams
} from '@openzeppelin/defender-sdk/lib/relay';
import { 
    AutotaskClient,
    RelayClient 
} from '@openzeppelin/defender-sdk/lib/client';
import { ethers } from 'ethers';
import { ChainConfigs } from '../../config/chains';
import { defenderConfig, MONITOR_CONFIG } from '../../config/defender';
import CCIPBridgeABI from '../../artifacts/contracts/bridges/CCIPBridge.sol/CCIPBridge.json';

// Initialize Defender clients
const autotaskClient = new AutotaskClient(defenderConfig);
const relayClient = new RelayClient(defenderConfig);

// Use monitoring configuration from defender config
const {
    maxPendingTransfers,
    maxTransferAge,
    minBalanceThreshold,
    healthCheckInterval,
    alertThreshold,
    supportedNetworks
} = MONITOR_CONFIG;

export async function handler(credentials) {
    // Initialize Defender clients
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });

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
            await autotaskClient.createAlert({
                title: `Low Bridge Balance on ${chain.name}`,
                description: `Bridge balance is below threshold: ${ethers.utils.formatEther(balance)} ETH`,
                severity: 'HIGH',
                metadata: {
                    chain: chain.name,
                    bridgeAddress,
                    balance: balance.toString()
                }
            });
        }

        // Monitor pending transfers
        const filter = bridge.filters.TokensSent();
        const events = await bridge.queryFilter(filter, -1000);
        const pendingTransfers = events.filter(e => !e.args.processed);

        if (pendingTransfers.length > THRESHOLDS.MAX_PENDING_TRANSFERS) {
            await autotaskClient.createAlert({
                title: `High Pending Transfers on ${chain.name}`,
                description: `Number of pending transfers (${pendingTransfers.length}) exceeds threshold`,
                severity: 'MEDIUM',
                metadata: {
                    chain: chain.name,
                    bridgeAddress,
                    pendingCount: pendingTransfers.length
                }
            });
        }

        // Check for stuck transfers
        const currentTime = Math.floor(Date.now() / 1000);
        const stuckTransfers = pendingTransfers.filter(e => {
            const transferAge = currentTime - e.args.timestamp.toNumber();
            return transferAge > THRESHOLDS.MAX_TRANSFER_AGE;
        });

        if (stuckTransfers.length > 0) {
            await autotaskClient.createAlert({
                title: `Stuck Transfers Detected on ${chain.name}`,
                description: `${stuckTransfers.length} transfers are stuck for more than ${THRESHOLDS.MAX_TRANSFER_AGE} seconds`,
                severity: 'HIGH',
                metadata: {
                    chain: chain.name,
                    bridgeAddress,
                    stuckCount: stuckTransfers.length,
                    transfers: stuckTransfers.map(e => e.args.transferId)
                }
            });
        }
    }
}
