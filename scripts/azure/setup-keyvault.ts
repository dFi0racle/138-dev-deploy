import { DefaultAzureCredential } from '@azure/identity';
import { KeyVaultManagementClient } from '@azure/arm-keyvault';
import { SecretClient } from '@azure/keyvault-secrets';
import { AZURE_CONFIG } from '../../config/azure/config';

async function setupKeyVault() {
  try {
    const credential = new DefaultAzureCredential();
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    
    if (!subscriptionId) {
      throw new Error('AZURE_SUBSCRIPTION_ID environment variable is required');
    }

    const keyVaultClient = new KeyVaultManagementClient(credential, subscriptionId);

    // Create Key Vault for each environment
    const environment = process.env.ENVIRONMENT || 'dev';
    const resourceGroupName = AZURE_CONFIG.resourceNames.resourceGroup('shared');
    const vaultName = `kv-defi-${environment}`;
    const location = AZURE_CONFIG.regions[0];

    console.log(`Creating Key Vault ${vaultName} in ${location}...`);
    await keyVaultClient.vaults.beginCreateOrUpdateAndWait(
      resourceGroupName,
      vaultName,
      {
        location,
        properties: {
          sku: {
            family: 'A',
            name: 'standard',
          },
          tenantId: process.env.AZURE_TENANT_ID || '',
          accessPolicies: [],
          enabledForDeployment: true,
          enabledForDiskEncryption: true,
          enabledForTemplateDeployment: true,
          enableSoftDelete: true,
          softDeleteRetentionInDays: 90,
          enableRbacAuthorization: true,
        },
      }
    );

    if (!process.env.AZURE_TENANT_ID) {
      throw new Error('AZURE_TENANT_ID environment variable is required');
    }

    // Store initial secrets
    const secretsClient = new SecretClient(`https://${vaultName}.vault.azure.net`, credential);
    
    const secrets = {
      DEFENDER_API_KEY: process.env.DEFENDER_API_KEY,
      DEFENDER_API_SECRET: process.env.DEFENDER_API_SECRET,
      DEFENDER_TEAM_API_KEY: process.env.DEFENDER_TEAM_API_KEY,
      DEFENDER_TEAM_SECRET_KEY: process.env.DEFENDER_TEAM_SECRET_KEY,
      ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
      ETHERSCAN_TETHER_API_KEY: process.env.ETHERSCAN_TETHER_API_KEY,
    };

    for (const [key, value] of Object.entries(secrets)) {
      if (value) {
        console.log(`Setting secret ${key}...`);
        await secretsClient.setSecret(key, value);
      }
    }

    console.log('Key Vault setup completed successfully');
  } catch (error) {
    console.error('Error setting up Key Vault:', error);
    throw error;
  }
}

export default setupKeyVault;
