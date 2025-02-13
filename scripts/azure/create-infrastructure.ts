import { DefaultAzureCredential } from '@azure/identity';
import { ResourceManagementClient } from '@azure/arm-resources';
import { NetworkManagementClient } from '@azure/arm-network';
import { ContainerServiceClient } from '@azure/arm-containerservice';
import { AZURE_CONFIG } from '../../config/azure/config';
import { NETWORK_CONFIGS } from '../../config/azure/networks';

async function createInfrastructure() {
  try {
    const credential = new DefaultAzureCredential();
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    
    if (!subscriptionId) {
      throw new Error('AZURE_SUBSCRIPTION_ID environment variable is required');
    }

    const resourceClient = new ResourceManagementClient(credential, subscriptionId);
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    const containerClient = new ContainerServiceClient(credential, subscriptionId);

    // Create resource groups and networks for each chain
    for (const [chainName, config] of Object.entries(NETWORK_CONFIGS)) {
      const resourceGroupName = AZURE_CONFIG.resourceNames.resourceGroup(chainName);
      const location = config.region;

      // Create resource group
      console.log(`Creating resource group ${resourceGroupName} in ${location}...`);
      await resourceClient.resourceGroups.createOrUpdate(resourceGroupName, { location });

      // Create virtual network
      console.log(`Creating virtual network ${config.vnetName}...`);
      await networkClient.virtualNetworks.beginCreateOrUpdateAndWait(
        resourceGroupName,
        config.vnetName,
        {
          location,
          addressSpace: {
            addressPrefixes: [config.addressPrefix],
          },
          subnets: [
            {
              name: config.subnetName,
              addressPrefix: config.subnetPrefix,
            },
          ],
        }
      );

      // Create AKS cluster
      const clusterName = AZURE_CONFIG.resourceNames.aks(chainName);
      console.log(`Creating AKS cluster ${clusterName}...`);
      await containerClient.managedClusters.beginCreateOrUpdateAndWait(
        resourceGroupName,
        clusterName,
        {
          location,
          dnsPrefix: `${clusterName}-dns`,
          agentPoolProfiles: [
            {
              name: 'nodepool1',
              count: AZURE_CONFIG.aksDefaults.minCount,
              vmSize: AZURE_CONFIG.aksDefaults.vmSize,
              mode: 'System',
              enableAutoScaling: AZURE_CONFIG.aksDefaults.enableAutoScaling,
              minCount: AZURE_CONFIG.aksDefaults.minCount,
              maxCount: AZURE_CONFIG.aksDefaults.maxCount,
            },
          ],
          kubernetesVersion: AZURE_CONFIG.aksDefaults.kubernetesVersion,
          identity: {
            type: 'SystemAssigned',
          },
          networkProfile: {
            networkPlugin: 'azure',
            networkPolicy: 'azure',
          },
        }
      );

      console.log(`Infrastructure created for ${chainName}`);
    }

    console.log('All infrastructure created successfully');
  } catch (error) {
    console.error('Error creating infrastructure:', error);
    throw error;
  }
}

export default createInfrastructure;
