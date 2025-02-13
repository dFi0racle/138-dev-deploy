import { ManagedClusterAgentPoolProfile } from '@azure/arm-containerservice';

export interface AzureConfig {
  regions: string[];
  resourceNames: {
    resourceGroup: (name: string) => string;
    aks: (name: string) => string;
    acr: (name: string) => string;
  };
  defaultTags: {
    [key: string]: string;
  };
  aksDefaults: {
    kubernetesVersion: string;
    vmSize: string;
    minCount: number;
    maxCount: number;
    enableAutoScaling: boolean;
  };
}

export interface NetworkConfig {
  name: string;
  region: string;
  vnetName: string;
  subnetName: string;
  addressPrefix: string;
  subnetPrefix: string;
}

export interface AKSClusterConfig {
  location: string;
  dnsPrefix: string;
  agentPoolProfiles: ManagedClusterAgentPoolProfile[];
  kubernetesVersion: string;
  identity: {
    type: string;
  };
  networkProfile: {
    networkPlugin: string;
    networkPolicy: string;
  };
}
