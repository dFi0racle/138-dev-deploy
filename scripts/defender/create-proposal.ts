import { ProposalClient } from '@openzeppelin/defender-sdk-proposal-client';
import { ethers } from 'hardhat';
import { ChainConfigs } from '../../config/chains';

async function main() {
    const credentials = {
        apiKey: process.env.DEFENDER_API_KEY!,
        apiSecret: process.env.DEFENDER_API_SECRET!
    };

    const client = new ProposalClient(credentials);

    // Create deployment proposal for each chain
    for (const chain of Object.values(ChainConfigs)) {
        console.log(`Creating proposal for ${chain.name}...`);

        const proposal = await client.create({
            proposalId: `ccip-bridge-${chain.name.toLowerCase()}`,
            via: process.env.DEFENDER_RELAYER_ADDRESS || '',
            viaType: 'Relayer',
            description: `Deploys and configures CCIPBridge and Reporter contracts on ${chain.name} (Chain ID: ${chain.id})`,
            type: 'upgrade',
            params: [],
            metadata: {
                chain: chain.name,
                chainId: chain.id.toString(),
                router: chain.router
            }
        });

        console.log(`Created proposal ${proposal.proposalId} for ${chain.name}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
