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
      explorerUrl: 'https://snowtrace.io',
      currency: 'AVAX'
    }
  },

  // Always use Mainnet
  CURRENT_NETWORK: 'MAINNET',

  // AI Configuration
  AI: {
    GEMINI_API_KEY: getEnvVar('VITE_GEMINI_API_KEY'),
    MODEL: getEnvVar('VITE_AI_MODEL', 'gemini-2.0-flash-exp'),
    MAX_TOKENS: parseInt(getEnvVar('VITE_AI_MAX_TOKENS', '1000')),
    TEMPERATURE: parseFloat(getEnvVar('VITE_AI_TEMPERATURE', '0.3'))
  },

  // Wallet Requirements
  WALLET: {
    MIN_AVAX_BALANCE: parseFloat(getEnvVar('VITE_MIN_AVAX_BALANCE', '0.1')),
    STORAGE_KEY: getEnvVar('VITE_WALLET_STORAGE_KEY', 'avax_wallet_key')
  },

  // Contract Addresses (Set via environment variables after deployment)
  CONTRACTS: {
    NFT_FACTORY: getEnvVar('VITE_NFT_CONTRACT_ADDRESS', ''),
    TOKEN_FACTORY: getEnvVar('VITE_TOKEN_CONTRACT_ADDRESS', '')
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
