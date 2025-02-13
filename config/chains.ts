/**
 * @title Chain Configuration
 * @notice Configuration for supported EVM chains in the DeFi Oracle Meta Mainnet
 */

export const ChainSelectors = {
    ETHEREUM: '16015286601757825753',
    POLYGON: '12532609583862916517',
    ARBITRUM: '6101244977088475029',
    OPTIMISM: '2664363617261496610',
    AVALANCHE: '14767482510784806043',
    BSC: '13264668187771770619',
    BASE: '15971525489660198786',
    GNOSIS: '10200630248557923475',
    FANTOM: '4002',
    METIS: '1088'
} as const;

export const ChainIds = {
    ETHEREUM: 1,
    POLYGON: 137,
    ARBITRUM: 42161,
    OPTIMISM: 10,
    AVALANCHE: 43114,
    BSC: 56,
    BASE: 8453,
    GNOSIS: 100,
    FANTOM: 250,
    METIS: 1088
} as const;

export const RouterAddresses = {
    ETHEREUM: '0xE561d5E02207fb5eB32cca20a699E0d8919a1476',
    POLYGON: '0x3C3D92629A02a8D95D5CB9650fe49C3544f69B43',
    ARBITRUM: '0x141fa059441E0ca23ce184B6A78B8453Fc5c8A5A',
    OPTIMISM: '0x261c05167db67B2B619f9d312e0753f3721ad6E8',
    AVALANCHE: '0x27F39D0af3303703750D4001fCc1844c6491563c',
    BSC: '0x536d7E53D0aDeB1F20E7c81fea45d02eC9dBD698',
    BASE: '0x673AA85efd75080031d44fcA061575d1dA427A28',
    GNOSIS: '0xE9ba4A41c116B32D4352665dF7Fef50c2A6bE4D5',
    FANTOM: '0x21744C9A65608645E1b39a4596C39848078C2865',
    METIS: '0xD4B80C3D7240325D18E645B49e6535A3Bf95cc58'
} as const;

export interface ChainConfig {
    name: string;
    id: number;
    selector: string;
    router: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
}

export const ChainConfigs: Record<keyof typeof ChainIds, ChainConfig> = {
    ETHEREUM: {
        name: 'Ethereum',
        id: ChainIds.ETHEREUM,
        selector: ChainSelectors.ETHEREUM,
        router: RouterAddresses.ETHEREUM,
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://eth.llamarpc.com'],
        blockExplorerUrls: ['https://etherscan.io']
    },
    POLYGON: {
        name: 'Polygon',
        id: ChainIds.POLYGON,
        selector: ChainSelectors.POLYGON,
        router: RouterAddresses.POLYGON,
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com']
    },
    ARBITRUM: {
        name: 'Arbitrum One',
        id: ChainIds.ARBITRUM,
        selector: ChainSelectors.ARBITRUM,
        router: RouterAddresses.ARBITRUM,
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io']
    },
    OPTIMISM: {
        name: 'Optimism',
        id: ChainIds.OPTIMISM,
        selector: ChainSelectors.OPTIMISM,
        router: RouterAddresses.OPTIMISM,
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io']
    },
    AVALANCHE: {
        name: 'Avalanche',
        id: ChainIds.AVALANCHE,
        selector: ChainSelectors.AVALANCHE,
        router: RouterAddresses.AVALANCHE,
        nativeCurrency: {
            name: 'AVAX',
            symbol: 'AVAX',
            decimals: 18
        },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io']
    },
    BSC: {
        name: 'BNB Smart Chain',
        id: ChainIds.BSC,
        selector: ChainSelectors.BSC,
        router: RouterAddresses.BSC,
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com']
    },
    BASE: {
        name: 'Base',
        id: ChainIds.BASE,
        selector: ChainSelectors.BASE,
        router: RouterAddresses.BASE,
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org']
    },
    GNOSIS: {
        name: 'Gnosis Chain',
        id: ChainIds.GNOSIS,
        selector: ChainSelectors.GNOSIS,
        router: RouterAddresses.GNOSIS,
        nativeCurrency: {
            name: 'xDAI',
            symbol: 'xDAI',
            decimals: 18
        },
        rpcUrls: ['https://rpc.gnosischain.com'],
        blockExplorerUrls: ['https://gnosisscan.io']
    },
    FANTOM: {
        name: 'Fantom',
        id: ChainIds.FANTOM,
        selector: ChainSelectors.FANTOM,
        router: RouterAddresses.FANTOM,
        nativeCurrency: {
            name: 'FTM',
            symbol: 'FTM',
            decimals: 18
        },
        rpcUrls: ['https://rpc.ftm.tools'],
        blockExplorerUrls: ['https://ftmscan.com']
    },
    METIS: {
        name: 'Metis',
        id: ChainIds.METIS,
        selector: ChainSelectors.METIS,
        router: RouterAddresses.METIS,
        nativeCurrency: {
            name: 'METIS',
            symbol: 'METIS',
            decimals: 18
        },
        rpcUrls: ['https://andromeda.metis.io/?owner=1088'],
        blockExplorerUrls: ['https://andromeda-explorer.metis.io']
    }
} as const;

export function getChainConfig(chainId: number): ChainConfig {
    const chain = Object.values(ChainConfigs).find(c => c.id === chainId);
    if (!chain) throw new Error(`Unsupported chain ID: ${chainId}`);
    return chain;
}

export function getChainConfigBySelector(selector: string): ChainConfig {
    const chain = Object.values(ChainConfigs).find(c => c.selector === selector);
    if (!chain) throw new Error(`Unsupported chain selector: ${selector}`);
    return chain;
}
