// Updated Enhanced AI Deployment for SharedCollectionFactory
// Simplified to work with the smaller, deployable contract

import React, { useState } from 'react';
import { CONFIG } from '../config';
import { ethers } from 'ethers';
import type { WalletData } from '../App';

interface NFTDeploymentResult {
  type: 'shared';
  success: boolean;
  sharedCollectionAddress?: string;
  tokenIds?: number[];
  data?: any;
  error?: string;
}

// SharedCollectionFactory ABI (smaller, focused contract)
const SHARED_COLLECTION_FACTORY_ABI = [
  "function addNFT(string memory metadataURI, uint256 quantity, address creator) public returns (uint256[] memory tokenIds)",
  "function getInfo() public view returns (address addr, string memory name, string memory symbol, uint256 total, uint256 contributors)",
  "function getUserStats(address user) public view returns (bool contributed, uint256 count, uint256[] memory tokens)",
  "event NFTAdded(uint256 indexed tokenId, address indexed creator)"
];

export default function SimplifiedAIDeployment({ wallet }: { wallet: WalletData }) {
  const [collectionInfo, setCollectionInfo] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  // Load collection info
  React.useEffect(() => {
    loadCollectionInfo();
    loadUserStats();
  }, [wallet]);

  const loadCollectionInfo = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
      const factory = new ethers.Contract(
        CONFIG.CONTRACTS.SHARED_COLLECTION_FACTORY, // New config value
        SHARED_COLLECTION_FACTORY_ABI,
        provider
      );
      
      const info = await factory.getInfo();
      setCollectionInfo({
        address: info[0],
        name: info[1],
        symbol: info[2],
        totalNFTs: Number(info[3]),
        totalContributors: Number(info[4])
      });
    } catch (error) {
      console.error('Failed to load collection info:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
      const factory = new ethers.Contract(
        CONFIG.CONTRACTS.SHARED_COLLECTION_FACTORY,
        SHARED_COLLECTION_FACTORY_ABI,
        provider
      );
      
      const stats = await factory.getUserStats(wallet.address);
      setUserStats({
        hasContributed: stats[0],
        nftCount: Number(stats[1]),
        tokenIds: stats[2].map((id: any) => Number(id))
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  // DISABLED: Internal addToSharedCollection function not used - deployNFTForAI export handles this
  /*
  const addToSharedCollection = async (
    metadataURI: string,
    quantity: number
  ): Promise<NFTDeploymentResult> => {
    try {
      console.log('🌐 Adding NFT to shared community collection...');
      
      const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
      const ethersWallet = new ethers.Wallet(wallet.privateKey, provider);
      
      const factory = new ethers.Contract(
        CONFIG.CONTRACTS.SHARED_COLLECTION_FACTORY,
        SHARED_COLLECTION_FACTORY_ABI,
        ethersWallet
      );
      
      const tx = await factory.addNFT(
        metadataURI, 
        quantity, 
        wallet.address,
        {
          gasLimit: 1000000, // Reduced for simpler contract
          gasPrice: ethers.parseUnits('1', 'gwei')
        }
      );
      
      console.log('📤 Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed');
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed');
      }
      
      // Extract token IDs from events
      const tokenIds: number[] = [];
      for (const log of receipt.logs) {
        try {
          const decoded = factory.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (decoded && decoded.name === 'NFTAdded') {
            tokenIds.push(Number(decoded.args.tokenId));
          }
        } catch (decodeError) {
          continue;
        }
      }
      
      // Refresh stats
      await loadUserStats();
      await loadCollectionInfo();
      
      return {
        type: 'shared',
        success: true,
        sharedCollectionAddress: collectionInfo?.address,
        tokenIds,
        data: { 
          receipt, 
          quantity, 
          viewUrls: tokenIds.map(id => 
            `https://web3.okx.com/explorer/avalanche/assets/${collectionInfo?.address}/${id}`
          ) 
        }
      };
    } catch (error) {
      console.error('❌ Failed to add to shared collection:', error);
      return {
        type: 'shared',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };
  */

  // DISABLED: Internal deployNFT function not used - deployNFTForAI export is used instead
  /*
  const deployNFT = async (
    _name: string,
    _description: string,
    metadataURI: string,
    quantity: number
  ): Promise<NFTDeploymentResult> => {
    setIsLoading(true);
    
    try {
      const result = await addToSharedCollection(metadataURI, quantity);
      
      if (onDeploymentComplete) {
        onDeploymentComplete(result);
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };
  */

  return (
    <div className="simplified-ai-deployment">
      <div className="deployment-header">
        <h3>🌐 AI Community Collection</h3>
        <p>Add your NFTs to the shared community collection!</p>
      </div>

      {/* Collection Info */}
      {collectionInfo && (
        <div className="collection-info">
          <h4>📊 Collection Stats</h4>
          <div className="stats">
            <div>📍 Address: {collectionInfo.address.slice(0, 10)}...</div>
            <div>🎨 Total NFTs: {collectionInfo.totalNFTs}</div>
            <div>👥 Contributors: {collectionInfo.totalContributors}</div>
          </div>
        </div>
      )}

      {/* User Stats */}
      {userStats && (
        <div className="user-stats">
          <h4>🎯 Your Contribution</h4>
          {userStats.hasContributed ? (
            <div>
              <p>✅ You've contributed {userStats.nftCount} NFTs</p>
              <p>Your token IDs: {userStats.tokenIds.join(', ')}</p>
            </div>
          ) : (
            <p>🆕 Ready to add your first NFT!</p>
          )}
        </div>
      )}

      {/* Loading state would go here if needed */}

      <style>{`
        .simplified-ai-deployment {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 20px 0;
        }

        .collection-info, .user-stats {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .collection-info h4, .user-stats h4 {
          margin: 0 0 10px 0;
          color: #2563eb;
        }

        .stats div {
          margin: 5px 0;
          font-family: monospace;
        }

        .loading {
          background: #fff3cd;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
      `}</style>
    </div>
  );
}

// Export the deployment function for AI integration
export async function deployNFTForAI(
  name: string,
  description: string,
  metadataURI: string,
  quantity: number,
  wallet: WalletData
): Promise<NFTDeploymentResult> {
  console.log('🤖 AI: Adding NFT to shared collection...', { 
    name, 
    description, 
    quantity, 
    walletAddress: wallet.address 
  });

  try {
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    const ethersWallet = new ethers.Wallet(wallet.privateKey, provider);
    
    const factory = new ethers.Contract(
      CONFIG.CONTRACTS.SHARED_COLLECTION_FACTORY,
      SHARED_COLLECTION_FACTORY_ABI,
      ethersWallet
    );
    
    // Get collection info first
    const info = await factory.getInfo();
    console.log('📋 Collection info:', {
      address: info[0],
      name: info[1],
      totalNFTs: Number(info[2])
    });
    
    const tx = await factory.addNFT(
      metadataURI, 
      quantity, 
      wallet.address,
      {
        gasLimit: 1000000,
        gasPrice: ethers.parseUnits('1', 'gwei')
      }
    );
    
    console.log('📤 Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed');
    
    if (receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    // Extract token IDs from events
    const tokenIds: number[] = [];
    for (const log of receipt.logs) {
      try {
        const decoded = factory.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        
        if (decoded && decoded.name === 'NFTAdded') {
          tokenIds.push(Number(decoded.args.tokenId));
        }
      } catch (decodeError) {
        continue;
      }
    }
    
    console.log('🎯 NFTs added with token IDs:', tokenIds);
    console.log('🔗 View NFTs at:', CONFIG.generateNFTUrl(info[0], '[TOKEN_ID]'));
    
    return {
      type: 'shared',
      success: true,
      sharedCollectionAddress: info[0],
      tokenIds,
      data: { 
        receipt, 
        quantity, 
        viewUrls: tokenIds.map(id => 
          `https://web3.okx.com/explorer/avalanche/assets/${info[0]}/${id}`
        ) 
      }
    };
  } catch (error) {
    console.error('❌ Failed to add to shared collection:', error);
    return {
      type: 'shared',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
