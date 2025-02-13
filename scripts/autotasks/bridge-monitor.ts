import { AutotaskClient } from 'defender-autotask-client';
import { RelayClient } from 'defender-relay-client';
import { ethers } from 'ethers';
import { ChainConfigs } from '../../config/chains';
import CCIPBridgeABI from '../../artifacts/contracts/bridges/CCIPBridge.sol/CCIPBridge.json';

// Monitoring thresholds
const THRESHOLDS = {
    MAX_PENDING_TRANSFERS: 100,
    MAX_TRANSFER_AGE: 3600, // 1 hour
    MIN_BALANCE_THRESHOLD: ethers.utils.parseEther('1.0')
};

export async function handler(credentials) {
    const autotaskClient = new AutotaskClient(credentials);
    const relayClient = new RelayClient(credentials);

    // Initialize providers for each chain
    const providers = Object.values(ChainConfigs).map(chain => {
        return new ethers.providers.JsonRpcProvider(chain.rpcUrls[0]);
    });

    // Monitor bridge contracts on each chain
    for (const chain of Object.values(ChainConfigs)) {
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
        if (balance.lt(THRESHOLDS.MIN_BALANCE_THRESHOLD)) {
            await relayClient.createAlert({
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
            await relayClient.createAlert({
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
            await relayClient.createAlert({
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
