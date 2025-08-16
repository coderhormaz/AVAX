// AI Integration Component
// This component handles the full token and NFT deployment flow

import React, { useState, useCallback } from 'react';
import { blockchainService } from '../services/blockchain';
import { ethers } from 'ethers';
import { CONFIG } from '../config';
import type { WalletData } from '../App';

interface DeploymentResult {
  type: 'token' | 'nft';
  success: boolean;
  data?: any;
  error?: string;
}

// MasterFactory ABI for direct deployment
const MASTER_FACTORY_ABI = [
  "function createToken(string memory name, string memory ticker, uint256 supply) public returns (address)",
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract)",
  "function getUserContracts(address user) public view returns (address[] memory tokens, address[] memory nfts)",
  "function tokenFactory() public view returns (address)",
  "function nftFactory() public view returns (address)",
  "event TokenFactoryDeployed(address tokenFactory)",
  "event NFTFactoryDeployed(address nftFactory)"
];

// Direct deployment using private key
async function deployWithPrivateKey(wallet: WalletData, contractCall: (contract: ethers.Contract) => Promise<any>) {
  try {
    // Create provider and wallet from private key
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    const ethersWallet = new ethers.Wallet(wallet.privateKey, provider);
    
    console.log('🔗 Connected to provider:', CONFIG.NETWORK.MAINNET.rpcUrl);
    console.log('🔑 Wallet address:', ethersWallet.address);
    console.log('📋 Contract address:', CONFIG.CONTRACTS.MASTER_FACTORY);
    
    // Create contract instance with the wallet as signer
    const masterFactory = new ethers.Contract(
      CONFIG.CONTRACTS.MASTER_FACTORY,
      MASTER_FACTORY_ABI,
      ethersWallet
    );
    
    console.log('📄 Contract instance created');
    
    // Execute the contract call
    return await contractCall(masterFactory);
  } catch (error) {
    console.error('Direct deployment error:', error);
    throw error;
  }
}

// Standalone functions for direct AI integration
export async function deployTokenForAI(name: string, ticker: string, supply: number, wallet: WalletData) {
  try {
    console.log('🤖 AI: Deploying token with existing wallet...', { name, ticker, supply });
    
    if (!wallet) {
      throw new Error('Wallet not provided. Please ensure you are logged in.');
    }

    // Use direct deployment with private key
    const result = await deployWithPrivateKey(wallet, async (masterFactory) => {
      // First test if the contract is accessible
      try {
        console.log('🔍 Testing contract accessibility...');
        const tokenFactoryAddress = await masterFactory.tokenFactory();
        console.log('✅ TokenFactory address:', tokenFactoryAddress);
      } catch (testError) {
        console.error('❌ Contract test failed:', testError);
        throw new Error(`Contract verification failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
      }
      
      console.log('🔑 Using private key for direct deployment...');
      console.log('📊 Parameters:', { name, ticker, supply, supplyType: typeof supply });
      
      // Try with minimal parameters first
      console.log('� Calling createToken...');
      const tx = await masterFactory.createToken(name, ticker, supply);
      
      console.log('✅ Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Since createToken returns address directly, we can get it from the transaction
      // The address should be in the transaction result or we can parse logs from TokenFactory
      const tokenAddress = tx.value || receipt.logs[0]?.address;
      
      return {
        tokenAddress: tokenAddress,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    });
    
    return {
      success: true,
      message: `Token "${name}" (${ticker}) deployed successfully via MasterFactory!`,
      contractAddress: result.tokenAddress,
      transactionHash: result.transactionHash,
      explorerUrl: `https://snowtrace.io/tx/${result.transactionHash}`,
      tokenUrl: `https://snowtrace.io/address/${result.tokenAddress}`
    };
  } catch (error) {
    console.error('Token deployment error:', error);
    return {
      success: false,
      message: `Failed to deploy token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deployNFTForAI(
  name: string,
  description: string = '',
  imageFile: File,
  quantity: number = 1,
  wallet: WalletData
) {
  try {
    console.log('🤖 AI: Deploying NFT with existing wallet...', { name, description, quantity });
    
    if (!wallet) {
      throw new Error('Wallet not provided. Please ensure you are logged in.');
    }
    
    // Upload image and create metadata using IPFS service
    const { uploadImageForNFT } = await import('../services/ipfs');
    const { metadataURI } = await uploadImageForNFT(imageFile, name, description);
    
    // Use direct deployment with private key (bypasses MetaMask)
    const result = await deployWithPrivateKey(wallet, async (masterFactory) => {
      console.log('🔑 Using private key for direct NFT deployment...');
      
      // Create the transaction with gas options as overrides
      const tx = await masterFactory.createNFT(name, description, metadataURI, quantity, {
        gasLimit: 700000, // 700K gas limit for NFT creation
        gasPrice: ethers.parseUnits('25', 'gwei') // 25 nAVAX gas price
      });
      
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Since createNFT returns address directly, we can get it from the transaction
      const nftContract = tx.value || receipt.logs[0]?.address;
      
      return {
        nftContract: nftContract,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    });
    
    return {
      success: true,
      message: `NFT "${name}" deployed successfully via MasterFactory!`,
      contractAddress: result.nftContract,
      transactionHash: result.transactionHash,
      explorerUrl: `https://snowtrace.io/tx/${result.transactionHash}`,
      tokenUrl: `https://web3.okx.com/explorer/avalanche/assets/${result.nftContract}`
    };
  } catch (error) {
    console.error('NFT deployment error:', error);
    return {
      success: false,
      message: `Failed to deploy NFT: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// AI Helper Functions - Export these for AI to use
export const AIHelpers = {
  // Create token function for AI
  createToken: deployTokenForAI,

  // Create NFT function for AI  
  createNFT: deployNFTForAI,

  // Get user contracts for AI
  getUserContracts: async (userAddress: string) => {
    try {
      const contracts = await blockchainService.getUserContracts(userAddress);
      return {
        success: true,
        tokens: contracts.tokens,
        nfts: contracts.nfts
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Simple React Component for UI demonstration (optional - AI uses the exported functions above)
export const AIDeploymentComponent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  // Connect wallet (removed MetaMask popup)
  const connectWallet = useCallback(async () => {
    console.log('Wallet connection handled by private key input - no popup needed');
    setDeploymentResult({
      type: 'token',
      success: false,
      error: 'Please use the private key wallet connection in the main interface'
    });
  }, []);

  return (
    <div className="ai-deployment-component">
      <div className="wallet-section">
        {!isConnected ? (
          <button 
            onClick={connectWallet}
            disabled={loading}
            className="connect-button"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="wallet-info">
            <span>Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
          </div>
        )}
      </div>

      {deploymentResult && (
        <div className={`result ${deploymentResult.success ? 'success' : 'error'}`}>
          {deploymentResult.success ? (
            <div>
              <h3>{deploymentResult.type === 'token' ? 'Token' : 'NFT'} Deployed Successfully! 🎉</h3>
              <p><strong>Contract:</strong> {deploymentResult.data.tokenAddress || deploymentResult.data.nftContract}</p>
              <p><strong>Transaction:</strong> {deploymentResult.data.transactionHash}</p>
              <p><strong>Gas Used:</strong> {deploymentResult.data.gasUsed}</p>
              {deploymentResult.type === 'nft' && (
                <p><strong>Token IDs:</strong> {deploymentResult.data.tokenIds?.join(', ')}</p>
              )}
            </div>
          ) : (
            <div>
              <h3>Deployment Failed ❌</h3>
              <p>{deploymentResult.error}</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Processing... Please wait</p>
        </div>
      )}
    </div>
  );
};
