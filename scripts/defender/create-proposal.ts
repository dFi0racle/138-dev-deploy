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
            contractId: process.env.DEFENDER_RELAYER_ADDRESS || '',
            network: chain.name.toLowerCase(),
            type: 'upgrade',
            via: process.env.DEFENDER_RELAYER_ADDRESS || '',
            viaType: 'Relayer',
            functionSignature: 'upgrade()',
            metadata: {
                chainId: chain.id.toString(),
                router: chain.router,
                network: chain.name.toLowerCase()
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
