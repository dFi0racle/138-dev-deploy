const Web3 = require('web3');
const { setTimeout } = require('timers/promises');

class MirrorService {
    constructor(sourceRPC, targetRPC, config = {}) {
        this.sourceWeb3 = new Web3(sourceRPC);
        this.targetWeb3 = new Web3(targetRPC);
        this.config = {
            confirmations: config.confirmations || 3,
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 5000,
        };
    }

    async start() {
        console.log('Starting mirror service...');
        
        this.sourceWeb3.eth.subscribe('pendingTransactions')
            .on('data', async (txHash) => {
                try {
                    await this.processTx(txHash);
                } catch (error) {
                    console.error(`Error processing tx ${txHash}:`, error);
                }
            })
            .on('error', console.error);
    }

    async processTx(txHash) {
        const tx = await this.sourceWeb3.eth.getTransaction(txHash);
        if (!tx) return;

        // Wait for confirmations
        await this.waitConfirmations(txHash);

        // Mirror transaction
        for (let i = 0; i < this.config.retryAttempts; i++) {
            try {
                const receipt = await this.targetWeb3.eth.sendTransaction({
                    from: tx.from,
                    to: tx.to,
                    value: tx.value,
                    data: tx.data,
                    gas: tx.gas
                });
                console.log(`Mirrored tx: ${receipt.transactionHash}`);
                break;
            } catch (error) {
                if (i === this.config.retryAttempts - 1) throw error;
                await setTimeout(this.config.retryDelay);
            }
        }
    }

    async waitConfirmations(txHash) {
        const receipt = await this.sourceWeb3.eth.getTransactionReceipt(txHash);
        const currentBlock = await this.sourceWeb3.eth.getBlockNumber();
        const confirmations = currentBlock - receipt.blockNumber;
        
        if (confirmations < this.config.confirmations) {
            await setTimeout(this.config.retryDelay);
            await this.waitConfirmations(txHash);
        }
    }
}

// Initialize and start the service
const service = new MirrorService(
    process.env.SOURCE_RPC || 'http://localhost:8545',
    process.env.TARGET_RPC || 'https://polygon-rpc.com'
);

service.start().catch(console.error);
