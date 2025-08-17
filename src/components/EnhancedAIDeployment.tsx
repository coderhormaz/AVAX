// Enhanced AI NFT Deployment with Shared Collection Support
// Users can choose between creating their own collection or adding to the shared community collection

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONFIG } from '../config';
import type { WalletData } from '../App';

interface NFTDeploymentResult {
  type: 'individual' | 'shared';
  success: boolean;
  contractAddress?: string;
  tokenIds?: number[];
  sharedCollectionAddress?: string;
  data?: any;
  error?: string;
}

// SharedCollectionFactory ABI
const SHARED_COLLECTION_FACTORY_ABI = [
  "function addNFT(string memory metadataURI, uint256 quantity, address creator) public returns (uint256[] memory tokenIds)",
  "function getInfo() public view returns (address addr, string memory name, string memory symbol, uint256 total, uint256 contributors)",
  "function getUserStats(address user) public view returns (bool contributed, uint256 count, uint256[] memory tokens)",
  "event NFTAdded(uint256 indexed tokenId, address indexed creator)"
];

export default function EnhancedAIDeployment({ wallet }: { wallet: WalletData }) {
  const [deploymentMode] = useState<'individual' | 'shared'>('shared');
  const [sharedCollectionInfo, setSharedCollectionInfo] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading] = useState(false);

  // Load shared collection info on component mount
  React.useEffect(() => {
    loadSharedCollectionInfo();
    loadUserStats();
  }, [wallet]);

  const loadSharedCollectionInfo = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
      const sharedFactory = new ethers.Contract(
        CONFIG.CONTRACTS.MASTER_FACTORY,
        SHARED_COLLECTION_FACTORY_ABI,
        provider
      );
      
      const info = await sharedFactory.getInfo();
      setSharedCollectionInfo({
        address: info[0],
        name: info[1],
        symbol: info[2],
        totalNFTs: Number(info[3]),
        totalContributors: Number(info[4])
      });
    } catch (error) {
      console.error('Failed to load shared collection info:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
      const sharedFactory = new ethers.Contract(
        CONFIG.CONTRACTS.MASTER_FACTORY,
        SHARED_COLLECTION_FACTORY_ABI,
        provider
      );
      
      const stats = await sharedFactory.getUserStats(ethers.getAddress(wallet.address));
      setUserStats({
        hasContributed: stats[0],
        nftCount: Number(stats[1]),
        tokenIds: stats[2].map((id: any) => Number(id))
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  // DISABLED: Individual NFT deployment not supported with SharedCollectionFactory
  /*
  const deployIndividualNFT = async (
    _name: string,
    _description: string,
    _metadataURI: string,
    _quantity: number
  ): Promise<NFTDeploymentResult> => {
    try {
      console.log('🎨 Deploying individual NFT collection...');
      
      const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
      const ethersWallet = new ethers.Wallet(wallet.privateKey, provider);
      
      // Individual NFT deployment not supported with SharedCollectionFactory
      throw new Error('Individual NFT deployment not supported. Use shared collection instead.');
      
    } catch (error) {
      return {
        type: 'individual',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };
  */

  // DISABLED: This function is unused, using addToSharedCollectionStandalone instead
  /*
  const addToSharedCollection = async (
    _name: string,
    _description: string,
    metadataURI: string,
    quantity: number
  ): Promise<NFTDeploymentResult> => {
    try {
      console.log('🌐 Adding NFT to shared community collection...');
      
      const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
      const ethersWallet = new ethers.Wallet(wallet.privateKey, provider);
      
      const sharedFactory = new ethers.Contract(
        CONFIG.CONTRACTS.MASTER_FACTORY,
        SHARED_COLLECTION_FACTORY_ABI,
        ethersWallet
      );
      
      console.log('🔍 Debug parameters:', {
        metadataURI: typeof metadataURI,
        metadataURIValue: metadataURI,
        quantity: typeof quantity,
        quantityValue: quantity,
        creatorAddress: typeof ethers.getAddress(wallet.address),
        creatorAddressValue: ethers.getAddress(wallet.address)
      });
      
      const tx = await sharedFactory.addNFT(
        metadataURI, 
        quantity, 
        ethers.getAddress(wallet.address),
        {
          gasLimit: 1500000,
          gasPrice: ethers.parseUnits('1', 'gwei')
        }
      );
      
      const receipt = await tx.wait();
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed');
      }
      
      // Extract token IDs from events
      const tokenIds: number[] = [];
      for (const log of receipt.logs) {
        try {
          const decoded = sharedFactory.interface.parseLog({
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
      
      // Refresh user stats
      await loadUserStats();
      await loadSharedCollectionInfo();
      
      return {
        type: 'shared',
        success: true,
        sharedCollectionAddress: sharedCollectionInfo?.address,
        tokenIds,
        data: { receipt, quantity }
      };
    } catch (error) {
      return {
        type: 'shared',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };
  */

  // Main deployment function that AI will call
  /* DISABLED - Individual NFT deployment not supported with SharedCollectionFactory
  const deployNFT = async (
    name: string,
    description: string,
    metadataURI: string,
    quantity: number,
    useSharedCollection: boolean = true
  ): Promise<NFTDeploymentResult> => {
    setIsLoading(true);
    
    try {
      const result = useSharedCollection
        ? await addToSharedCollection(name, description, metadataURI, quantity)
        : await deployIndividualNFT(name, description, metadataURI, quantity);
      
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
    <div className="enhanced-ai-deployment">
      <div className="deployment-header">
        <h3>🎨 AI NFT Creation</h3>
        <p>Choose how to create your NFT:</p>
      </div>

      {/* Shared Collection Info */}
      {sharedCollectionInfo && (
        <div className="shared-collection-info">
          <h4>🌐 Community Collection: "{sharedCollectionInfo.name}"</h4>
          <div className="collection-stats">
            <div className="stat">
              <span className="label">Total NFTs:</span>
              <span className="value">{sharedCollectionInfo.totalNFTs}</span>
            </div>
            <div className="stat">
              <span className="label">Contributors:</span>
              <span className="value">{sharedCollectionInfo.totalContributors}</span>
            </div>
            <div className="stat">
              <span className="label">Contract:</span>
              <span className="value">{sharedCollectionInfo.address.slice(0, 10)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* User Stats */}
      {userStats && (
        <div className="user-stats">
          <h4>📊 Your Contribution</h4>
          {userStats.hasContributed ? (
            <div>
              <p>✅ You have contributed {userStats.nftCount} NFTs to the community collection</p>
              <p>Your NFT IDs: {userStats.tokenIds.join(', ')}</p>
              <p>View them at: {CONFIG.generateNFTUrl(sharedCollectionInfo?.address || '', '[ID]')}</p>
            </div>
          ) : (
            <p>🆕 You haven't contributed to the community collection yet</p>
          )}
        </div>
      )}

      {/* Deployment Mode Selection */}
      <div className="deployment-modes">
        <div className="mode-option">
          <input
            type="radio"
            id="shared"
            name="deploymentMode"
            value="shared"
            checked={deploymentMode === 'shared'}
            onChange={() => {}} // Read-only, always shared
          />
          <label htmlFor="shared">
            <strong>🌐 Add to Community Collection</strong>
            <p>Add your NFT to the shared collection where everyone can contribute</p>
            <p>✅ One collection address for all NFTs</p>
            <p>✅ Sequential token IDs (1, 2, 3...)</p>
            <p>✅ Community-driven</p>
          </label>
        </div>

        <div className="mode-option">
          <input
            type="radio"
            id="individual"
            name="deploymentMode"
            value="individual"
            checked={deploymentMode === 'individual'}
            onChange={() => {}} // Read-only, always shared
          />
          <label htmlFor="individual">
            <strong>🎨 Create Your Own Collection</strong>
            <p>Deploy your own NFT collection contract</p>
            <p>✅ Your own contract address</p>
            <p>✅ Full control over the collection</p>
            <p>✅ Higher gas fees</p>
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="deployment-status">
          <p>🚀 Deploying NFT...</p>
          {deploymentMode === 'shared' && <p>Adding to community collection...</p>}
          {deploymentMode === 'individual' && <p>Creating your own collection...</p>}
        </div>
      )}

      <style>{`
        .enhanced-ai-deployment {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 20px 0;
        }

        .deployment-header h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .shared-collection-info {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .shared-collection-info h4 {
          margin: 0 0 10px 0;
          color: #2563eb;
        }

        .collection-stats {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat .label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .stat .value {
          font-weight: bold;
          color: #333;
        }

        .user-stats {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .user-stats h4 {
          margin: 0 0 10px 0;
          color: #059669;
        }

        .deployment-modes {
          margin: 20px 0;
        }

        .mode-option {
          margin: 15px 0;
          padding: 15px;
          border: 2px solid #e5e5e5;
          border-radius: 8px;
          cursor: pointer;
        }

        .mode-option:has(input:checked) {
          border-color: #2563eb;
          background: #f0f8ff;
        }

        .mode-option input[type="radio"] {
          margin-right: 10px;
        }

        .mode-option label {
          cursor: pointer;
          display: block;
        }

        .mode-option label strong {
          display: block;
          margin-bottom: 8px;
          color: #333;
        }

        .mode-option label p {
          margin: 4px 0;
          font-size: 14px;
          color: #666;
        }

        .deployment-status {
          background: #fff3cd;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .deployment-status p {
          margin: 5px 0;
          color: #856404;
        }
      `}</style>
    </div>
  );
}

// Export the deployment functions for AI integration
export { EnhancedAIDeployment };

// Main AI deployment function
export async function deployNFTForAI(
  name: string,
  description: string,
  metadataURI: string,
  quantity: number,
  wallet: WalletData,
  useSharedCollection: boolean = true
): Promise<NFTDeploymentResult> {
  console.log('🤖 AI: Deploying NFT...', { 
    name, 
    description, 
    quantity, 
    useSharedCollection,
    walletAddress: wallet.address 
  });

  const component = new (class {
    deployNFT = async (
      name: string,
      description: string,
      metadataURI: string,
      quantity: number,
      useSharedCollection: boolean
    ) => {
      if (useSharedCollection) {
        return await addToSharedCollectionStandalone(name, description, metadataURI, quantity, wallet);
      } else {
        return await deployIndividualNFTStandalone(name, description, metadataURI, quantity, wallet);
      }
    };
  })();

  return await component.deployNFT(name, description, metadataURI, quantity, useSharedCollection);
}

// Standalone functions for AI integration
async function addToSharedCollectionStandalone(
  _name: string,
  _description: string,
  metadataURI: string,
  quantity: number,
  wallet: WalletData
): Promise<NFTDeploymentResult> {
  try {
    console.log('🌐 AI: Adding NFT to shared community collection...');
    
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    const ethersWallet = new ethers.Wallet(wallet.privateKey, provider);
    
    const sharedFactory = new ethers.Contract(
      CONFIG.CONTRACTS.MASTER_FACTORY,
      SHARED_COLLECTION_FACTORY_ABI,
      ethersWallet
    );
    
    // Get shared collection info first
    const info = await sharedFactory.getInfo();
    console.log('📋 Shared collection info:', {
      address: info[0],
      name: info[1],
      totalNFTs: Number(info[3]),
      totalContributors: Number(info[4])
    });
    
    console.log('🔍 Debug contract parameters:', {
      metadataURI: typeof metadataURI,
      metadataURIValue: metadataURI,
      quantity: typeof quantity,
      quantityValue: quantity,
      creatorAddress: typeof ethers.getAddress(wallet.address),
      creatorAddressValue: ethers.getAddress(wallet.address)
    });
    
    const tx = await sharedFactory.addNFT(
      metadataURI, 
      quantity, 
      ethers.getAddress(wallet.address),
      {
        gasLimit: 1500000,
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
        const decoded = sharedFactory.interface.parseLog({
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
    
    console.log('🎯 NFTs added to collection with token IDs:', tokenIds);
    console.log('🔗 View NFTs at:', CONFIG.generateNFTUrl(info[0], '[TOKEN_ID]'));
    
    return {
      type: 'shared',
      success: true,
      sharedCollectionAddress: info[0],
      tokenIds,
      data: { receipt, quantity, viewUrls: tokenIds.map(id => CONFIG.generateNFTUrl(info[0], id)) }
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

async function deployIndividualNFTStandalone(
  _name: string,
  _description: string,
  _metadataURI: string,
  _quantity: number,
  _wallet: WalletData
): Promise<NFTDeploymentResult> {
  try {
    console.log('🎨 AI: Deploying individual NFT collection...');
    
    // NOTE: Individual NFT deployment not supported with SharedCollectionFactory
    console.log('❌ Individual NFT deployment not supported with SharedCollectionFactory');
    return {
      type: 'individual',
      success: false,
      error: 'Individual NFT deployment not supported with SharedCollectionFactory. Please use shared collection instead.'
    };
  } catch (error) {
    console.error('❌ Failed to deploy individual collection:', error);
    return {
      type: 'individual',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
