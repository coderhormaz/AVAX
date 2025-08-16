// Configuration file for the Avalanche AI Blockchain Assistant

// Helper function to get environment variable
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
};

export const CONFIG = {
  // Network Configuration (Mainnet Only)
  NETWORK: {
    MAINNET: {
      name: 'Avalanche Mainnet',
      chainId: 43114,
      rpcUrl: getEnvVar('VITE_MAINNET_RPC_URL', 'https://api.avax.network/ext/bc/C/rpc'),
      explorerUrl: getEnvVar('VITE_EXPLORER_URL', 'https://web3.okx.com/explorer/avalanche'),
      nftExplorerUrl: getEnvVar('VITE_NFT_EXPLORER_URL', 'https://web3.okx.com/explorer/avalanche/assets'),
      currency: 'AVAX'
    }
  },

  // Always use Mainnet
  CURRENT_NETWORK: 'MAINNET',

  // Wallet Requirements
  WALLET: {
    MIN_AVAX_BALANCE: parseFloat(getEnvVar('VITE_MIN_AVAX_BALANCE', '0.1')),
    STORAGE_KEY: getEnvVar('VITE_WALLET_STORAGE_KEY', 'avax_wallet_key')
  },

  // Contract Addresses (Deployed Contract Information)
  CONTRACTS: {
    // Main Factory Contract - AI Assistant uses this address (deployed on Avalanche Mainnet)
    MASTER_FACTORY: getEnvVar('VITE_MASTER_FACTORY_ADDRESS', '0x5708fBd5178DD97AC90848de5800fF79b947051d')
  },

  // IPFS/Storage Configuration
  STORAGE: {
    LIGHTHOUSE_API_KEY: getEnvVar('VITE_LIGHTHOUSE_API_KEY'),
    PINATA_API_KEY: getEnvVar('VITE_PINATA_API_KEY'),
    PINATA_API_SECRET: getEnvVar('VITE_PINATA_API_SECRET'),
    PINATA_JWT: getEnvVar('VITE_PINATA_JWT')
  }
};

// Helper function to get current network config
export const getCurrentNetwork = () => {
  return CONFIG.NETWORK[CONFIG.CURRENT_NETWORK as keyof typeof CONFIG.NETWORK];
};

// Helper function to get explorer link
export const getExplorerLink = (hash: string, type: 'tx' | 'address' = 'tx') => {
  const network = getCurrentNetwork();
  return `${network.explorerUrl}/${type}/${hash}`;
};

// Helper function to get NFT explorer link
export const getNFTExplorerLink = (contractAddress: string, tokenId?: string | number) => {
  const network = getCurrentNetwork();
  const baseUrl = network.nftExplorerUrl || `${network.explorerUrl}/token`;
  
  if (tokenId !== undefined) {
    return `${baseUrl}/${contractAddress}/${tokenId}`;
  }
  return `${baseUrl}/${contractAddress}`;
};

// Helper function to get contract explorer link
export const getContractExplorerLink = (contractAddress: string) => {
  const network = getCurrentNetwork();
  return `${network.explorerUrl}/address/${contractAddress}`;
};
