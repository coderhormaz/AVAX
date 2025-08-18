import { JsonRpcProvider, Wallet, parseEther, formatEther, isAddress, parseUnits, Contract } from 'ethers';
import type { TransactionReceipt, TransactionRequest } from 'ethers';
import { getCurrentNetwork, getExplorerLink } from '../config';

/**
 * Blockchain transaction utilities
 */

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  explorerLink?: string;
  error?: string;
  receipt?: TransactionReceipt;
}

export interface SendAvaxParams {
  privateKey: string;
  to: string;
  amount: string; // Amount in AVAX
  gasLimit?: number;
  gasPrice?: string; // In gwei
}

export interface DeployTokenParams {
  privateKey: string;
  name: string;
  symbol: string;
  initialSupply: number;
  decimals: number;
}

export interface MintNFTParams {
  privateKey: string;
  contractAddress: string;
  to: string;
  tokenURI: string;
}

/**
 * Send AVAX to another address
 */
export const sendAvax = async (params: SendAvaxParams): Promise<TransactionResult> => {
  try {
    const { privateKey, to, amount, gasLimit, gasPrice } = params;
    
    // Validate inputs
    if (!isAddress(to)) {
      throw new Error('Invalid destination address');
    }
    
    if (parseFloat(amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    // Create wallet and provider
    const network = getCurrentNetwork();
    const provider = new JsonRpcProvider(network.rpcUrl);
    const wallet = new Wallet(privateKey, provider);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const amountWei = parseEther(amount);
    
    if (balance < amountWei) {
      throw new Error('Insufficient balance');
    }
    
    // Prepare transaction
    const tx: TransactionRequest = {
      to,
      value: amountWei,
      gasLimit: gasLimit || 21000,
      gasPrice: gasPrice ? parseUnits(gasPrice, 'gwei') : undefined
    };
    
    // Send transaction
    const txResponse = await wallet.sendTransaction(tx);
    
    // Wait for confirmation
    const receipt = await txResponse.wait();
    
    return {
      success: true,
      txHash: txResponse.hash,
      explorerLink: getExplorerLink(txResponse.hash, 'tx'),
      receipt: receipt || undefined
    };
    
  } catch (error: any) {
    console.error('Send AVAX error:', error);
    return {
      success: false,
      error: error.message || 'Transaction failed'
    };
  }
};

/**
 * Deploy ERC20 Token Contract using MasterFactory
 */
export const deployToken = async (params: DeployTokenParams): Promise<TransactionResult> => {
  try {
    const { privateKey, name, symbol, initialSupply } = params;
    
    // Create wallet and provider
    const network = getCurrentNetwork();
    const provider = new JsonRpcProvider(network.rpcUrl);
    const wallet = new Wallet(privateKey, provider);
    
    // MasterFactory contract address - ONLY for tokens
    const MASTER_FACTORY_ADDRESS = "0x5708FBd5178DD97AC90848de5800FF79b947051d";
    
    // MasterFactory ABI for createToken function
    const masterFactoryABI = [
      "function createToken(string memory name, string memory ticker, uint256 supply) public returns (address)"
    ];
    
    // Create contract instance
    const masterFactory = new Contract(MASTER_FACTORY_ADDRESS, masterFactoryABI, wallet);
    
    // Call createToken function
    const tx = await masterFactory.createToken(name, symbol, initialSupply);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      explorerLink: getExplorerLink(tx.hash, 'tx'),
      receipt: receipt || undefined
    };
    
  } catch (error: any) {
    console.error('Deploy token error:', error);
    return {
      success: false,
      error: error.message || 'Token deployment failed'
    };
  }
};

/**
 * Mint NFT using pre-deployed contract
 */
export const mintNFT = async (params: MintNFTParams): Promise<TransactionResult> => {
  try {
    const { privateKey, contractAddress, to, tokenURI } = params;
    
    // Validate inputs
    if (!isAddress(contractAddress)) {
      throw new Error('Invalid contract address');
    }
    
    if (!isAddress(to)) {
      throw new Error('Invalid recipient address');
    }
    
    // Create wallet and provider
    const network = getCurrentNetwork();
    const provider = new JsonRpcProvider(network.rpcUrl);
    const wallet = new Wallet(privateKey, provider);
    
    // NFT Contract ABI (mint function)
    const nftABI = [
      "function mint(address to, string memory tokenURI) public returns (uint256)"
    ];
    
    // Connect to contract
    const contract = new Contract(contractAddress, nftABI, wallet);
    
    // Call mint function
    const tx = await contract.mint(to, tokenURI);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      explorerLink: getExplorerLink(tx.hash, 'tx'),
      receipt: receipt || undefined
    };
    
  } catch (error: any) {
    console.error('Mint NFT error:', error);
    return {
      success: false,
      error: error.message || 'NFT minting failed'
    };
  }
};

/**
 * Get transaction status
 */
export const getTransactionStatus = async (txHash: string): Promise<{
  status: 'pending' | 'confirmed' | 'failed';
  receipt?: TransactionReceipt;
}> => {
  try {
    const network = getCurrentNetwork();
    const provider = new JsonRpcProvider(network.rpcUrl);
    
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { status: 'pending' };
    }
    
    return {
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      receipt
    };
    
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return { status: 'pending' };
  }
};

/**
 * Calculate transaction fee
 */
export const calculateTransactionFee = async (
  gasLimit: number,
  gasPrice?: string
): Promise<string> => {
  try {
    const currentGasPrice = gasPrice 
      ? parseUnits(gasPrice, 'gwei')
      : parseUnits('25', 'gwei'); // Default Avalanche gas price
    
    const fee = currentGasPrice * BigInt(gasLimit);
    return formatEther(fee);
    
  } catch (error) {
    console.error('Error calculating transaction fee:', error);
    return '0.001'; // Default estimate
  }
};
