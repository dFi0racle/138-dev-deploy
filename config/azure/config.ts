import { DefaultAzureCredential } from '@azure/identity';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import { AzureConfig } from './types';

export const AZURE_CONFIG: AzureConfig = {
  // Default regions for deployment
  regions: [
    'eastus',
    'westus2',
    'northeurope',
    'westeurope',
    'southeastasia'
  ],
  
  // Resource naming conventions
  resourceNames: {
    resourceGroup: (name: string) => `rg-${name}-${process.env.ENVIRONMENT || 'dev'}`,
    aks: (name: string) => `aks-${name}-${process.env.ENVIRONMENT || 'dev'}`,
    acr: (name: string) => `acr${name}${process.env.ENVIRONMENT || 'dev'}`
  },

  // Default tags for resources
  defaultTags: {
    environment: process.env.ENVIRONMENT || 'dev',
    managedBy: 'devin-ai',
    project: '138-dev-deploy'
  },

  // AKS configuration defaults
  aksDefaults: {
    kubernetesVersion: '1.27.3',
    vmSize: 'Standard_D4s_v3',
    minCount: 1,
    maxCount: 5,
    enableAutoScaling: true
  }
};

export const getAzureClients = async () => {
  const credential = new DefaultAzureCredential();
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

  if (!subscriptionId) {
    throw new Error('AZURE_SUBSCRIPTION_ID environment variable is required');
  }

  return {
    resourceClient: new ResourceManagementClient(credential, subscriptionId),
    containerClient: new ContainerServiceClient(credential, subscriptionId)
  };
};
