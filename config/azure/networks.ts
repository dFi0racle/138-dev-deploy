export interface NetworkConfig {
  name: string;
  region: string;
  vnetName: string;
  subnetName: string;
  addressPrefix: string;
  subnetPrefix: string;
}

export const NETWORK_CONFIGS: { [key: string]: NetworkConfig } = {
  ethereum: {
    name: 'ethereum',
    region: 'eastus',
    vnetName: 'vnet-ethereum',
    subnetName: 'subnet-ethereum',
    addressPrefix: '10.0.0.0/16',
    subnetPrefix: '10.0.0.0/24'
  },
  polygon: {
    name: 'polygon',
    region: 'westus2',
    vnetName: 'vnet-polygon',
    subnetName: 'subnet-polygon',
    addressPrefix: '10.1.0.0/16',
    subnetPrefix: '10.1.0.0/24'
  },
  arbitrum: {
    name: 'arbitrum',
    region: 'northeurope',
    vnetName: 'vnet-arbitrum',
    subnetName: 'subnet-arbitrum',
    addressPrefix: '10.2.0.0/16',
    subnetPrefix: '10.2.0.0/24'
  },
  optimism: {
    name: 'optimism',
    region: 'westeurope',
    vnetName: 'vnet-optimism',
    subnetName: 'subnet-optimism',
    addressPrefix: '10.3.0.0/16',
    subnetPrefix: '10.3.0.0/24'
  },
  avalanche: {
    name: 'avalanche',
    region: 'southeastasia',
    vnetName: 'vnet-avalanche',
    subnetName: 'subnet-avalanche',
    addressPrefix: '10.4.0.0/16',
    subnetPrefix: '10.4.0.0/24'
  }
};
