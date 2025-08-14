import { Wallet, JsonRpcProvider, formatEther, parseEther, parseUnits, isAddress } from 'ethers';
import { getCurrentNetwork } from '../config';

/**
 * Wallet utility functions for the Avalanche AI Assistant
 */

export interface WalletInfo {
  address: string;
  balance: string;
  privateKey: string;
}

/**
 * Create or restore wallet from private key
 */
export const createWalletFromPrivateKey = async (privateKey: string): Promise<WalletInfo> => {
  try {
    // Remove '0x' prefix if present
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // Create wallet instance
    const wallet = new Wallet(cleanPrivateKey);
    
    // Get provider for current network
    const network = getCurrentNetwork();
    const provider = new JsonRpcProvider(network.rpcUrl);
    
    // Get balance
    const balance = await provider.getBalance(wallet.address);
    const formattedBalance = formatEther(balance);
    
    return {
      address: wallet.address,
      balance: formattedBalance,
      privateKey: cleanPrivateKey
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error('Invalid private key or network connection failed');
  }
};

/**
 * Generate a new random wallet
 */
export const generateRandomWallet = (): { address: string; privateKey: string } => {
  const wallet = Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    const network = getCurrentNetwork();
    const provider = new JsonRpcProvider(network.rpcUrl);
    
    const balance = await provider.getBalance(address);
    return formatEther(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch wallet balance');
  }
};

/**
 * Validate Ethereum address format
 */
export const isValidAddress = (address: string): boolean => {
  return isAddress(address);
};

/**
 * Validate private key format
 */
export const isValidPrivateKey = (privateKey: string): boolean => {
  try {
    new Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Format address for display (show first 6 and last 4 characters)
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Convert AVAX amount to Wei
 */
export const avaxToWei = (avax: string | number): bigint => {
  return parseEther(avax.toString());
};

/**
 * Convert Wei to AVAX
 */
export const weiToAvax = (wei: bigint): string => {
  return formatEther(wei);
};

/**
 * Get current gas price (default for Avalanche)
 */
export const getCurrentGasPrice = (): bigint => {
  // Return default gas price for Avalanche (25 nAVAX)
  return parseUnits('25', 'gwei');
};

/**
 * Estimate gas for a transaction (simplified)
 */
export const estimateGas = async (): Promise<bigint> => {
  try {
    // For simple transactions, return default gas limit
    // For contract interactions, this would need to be estimated
    return BigInt('21000');
  } catch (error) {
    console.error('Error estimating gas:', error);
    // Return default gas limit
    return BigInt('21000');
  }
};

/**
 * Wait for transaction confirmation
 */
export const waitForTransaction = async (
  txHash: string
): Promise<any> => {
  try {
    const network = getCurrentNetwork();
    const provider = new JsonRpcProvider(network.rpcUrl);
    
    // Wait for transaction receipt
    let receipt = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (!receipt && attempts < maxAttempts) {
      receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }
    
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw new Error('Transaction confirmation failed');
  }
};
