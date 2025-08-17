// SIMPLE AI NFT DEPLOYMENT - WORKING VERSION
// Bypasses broken MasterFactory, uses direct NFTFactory deployment

import { ethers } from 'ethers';
import { CONFIG } from '../config';
import type { WalletData } from '../App';

// Simple NFT Factory ABI (only what we need)
const NFT_FACTORY_ABI = [
  "function deployNFT(string memory name, string memory symbol, string memory baseURI, address owner) public returns (address)",
  "event NFTDeployed(address indexed nftAddress, address indexed owner, string name, string symbol, string baseURI)"
];

// SIMPLE: Deploy NFT using direct NFTFactory call
export async function deployNFTForAI(
  name: string,
  description: string = '',
  imageFile: File,
  quantity: number = 1,
  wallet: WalletData
) {
  try {
    console.log('🎯 SIMPLE NFT DEPLOYMENT - Starting (this should create NFT, not token!)');
    console.log('📋 Parameters:', { name, description, quantity });
    console.log('🏷️ VERIFICATION: This is the SimpleAIDeployment.deployNFTForAI function');
    console.log('⚠️ If you see token creation instead of NFT, there is a routing bug!');
    
    if (!wallet) {
      throw new Error('Wallet not provided');
    }
    
    // 1. Upload image to IPFS (working method)
    console.log('📤 Uploading to IPFS...');
    const { uploadImageForNFTLighthouseOriginal } = await import('../services/ipfs-lighthouse-original');
    const { imageURI, metadataURI } = await uploadImageForNFTLighthouseOriginal(imageFile, name, description);
    console.log('✅ Image uploaded:', imageURI);
    console.log('✅ Metadata uploaded:', metadataURI);
    console.log('🎯 IMPORTANT: Will use metadataURI for minting, imageURI for contract baseURI');
    
    // 2. Setup blockchain connection
    console.log('🔗 Connecting to blockchain...');
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    const ethersWallet = new ethers.Wallet(wallet.privateKey, provider);
    
    // 3. Check balance
    const balance = await provider.getBalance(ethersWallet.address);
    const balanceInAVAX = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceInAVAX} AVAX`);
    
    if (parseFloat(balanceInAVAX) < 0.003) {
      throw new Error(`Insufficient balance: ${balanceInAVAX} AVAX (need 0.003 AVAX)`);
    }
    
    // 4. Connect to NFT Factory (working contract)
    const nftFactoryAddress = '0x7021Bdba9C4B2fBbeD8B5Fee212b3683896ae3Ff';
    const nftFactory = new ethers.Contract(nftFactoryAddress, NFT_FACTORY_ABI, ethersWallet);
    
    // 5. Prepare deployment parameters
    const symbol = name.substring(0, 3).toUpperCase() + 'NFT';
    
    console.log('🚀 Deploying NFT contract...');
    console.log('   Name:', name);
    console.log('   Symbol:', symbol);
    console.log('   Base URI (for contract):', ''); // Empty base URI since we'll set full URIs per token
    console.log('   Owner:', ethersWallet.address);
    console.log('🎯 NOTE: Using empty baseURI, each NFT gets full metadataURI when minted');
    
    // 6. Deploy NFT contract (use empty baseURI since we provide full URIs per token)
    const tx = await nftFactory.deployNFT(
      name,
      symbol, 
      '', // Empty baseURI - we'll provide full metadata URIs when minting
      ethersWallet.address,
      {
        gasLimit: 3000000,  // Generous limit
        gasPrice: ethers.parseUnits('1', 'gwei')  // Low price
      }
    );
    
    console.log('📡 Transaction sent:', tx.hash);
    
    // 7. Wait for confirmation
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed');
    
    if (receipt.status !== 1) {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }
    
    // 8. Extract NFT contract address from events
    let nftContractAddress = null;
    
    for (const log of receipt.logs) {
      try {
        const parsedLog = nftFactory.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'NFTDeployed') {
          nftContractAddress = parsedLog.args[0];
          break;
        }
      } catch {
        // Skip unparseable logs
      }
    }
    
    if (!nftContractAddress) {
      nftContractAddress = 'Contract deployed (check transaction logs)';
    }
    
    console.log('🎉 NFT CONTRACT DEPLOYED SUCCESSFULLY!');
    console.log('   Contract:', nftContractAddress);
    console.log('   Transaction:', tx.hash);
    console.log('   Gas Used:', receipt.gasUsed.toString());
    
    // 9. NOW MINT ACTUAL NFTs IN THE DEPLOYED CONTRACT
    console.log('🎨 Now minting actual NFTs in the deployed contract...');
    
    if (nftContractAddress && nftContractAddress.startsWith('0x')) {
      try {
        // CustomNFT contract ABI for minting
        const customNFTABI = [
          "function mint(address to, string memory uri) public returns (uint256)",
          "function batchMint(address to, string[] memory tokenURIs, uint256 quantity) public",
          "function getCurrentTokenId() public view returns (uint256)"
        ];
        
        // Connect to the deployed NFT contract
        const customNFT = new ethers.Contract(nftContractAddress, customNFTABI, ethersWallet);
        
        console.log('🎯 Minting NFTs...');
        console.log(`   To: ${ethersWallet.address}`);
        console.log(`   Metadata URI: ${metadataURI}`);
        console.log(`   Image URI: ${imageURI}`);
        console.log(`   Quantity: ${quantity}`);
        console.log('🎯 CRITICAL: Using metadataURI for minting (contains image + metadata)');
        
        let mintTx;
        let tokenIds = [];
        
        if (quantity === 1) {
          console.log('🎨 Minting single NFT with metadata...');
          mintTx = await customNFT.mint(ethersWallet.address, metadataURI, {
            gasLimit: 300000,
            gasPrice: ethers.parseUnits('1', 'gwei')
          });
        } else {
          console.log(`🎨 Batch minting ${quantity} NFTs with metadata...`);
          // For batch minting, create array of metadata URIs (same URI for all)
          const tokenURIs = Array(quantity).fill(metadataURI);
          mintTx = await customNFT.batchMint(ethersWallet.address, tokenURIs, quantity, {
            gasLimit: 300000 * quantity,
            gasPrice: ethers.parseUnits('1', 'gwei')
          });
        }
        
        console.log('🎨 Minting transaction sent:', mintTx.hash);
        const mintReceipt = await mintTx.wait();
        
        if (mintReceipt.status !== 1) {
          throw new Error(`Minting failed with status: ${mintReceipt.status}`);
        }
        
        console.log('✅ NFTs MINTED SUCCESSFULLY! Gas used:', mintReceipt.gasUsed.toString());
        
        // Get the token IDs that were minted
        try {
          const currentTokenId = await customNFT.getCurrentTokenId();
          console.log('🎯 Current token ID after minting:', currentTokenId.toString());
          
          // Generate token ID array based on quantity
          for (let i = 0; i < quantity; i++) {
            tokenIds.push((Number(currentTokenId) - quantity + 1 + i).toString());
          }
          console.log('🎯 Minted Token IDs:', tokenIds);
        } catch (error) {
          console.log('Could not determine token IDs, but minting succeeded');
          tokenIds = ['Minted successfully'];
        }
        
        console.log('🎉 COMPLETE SUCCESS: NFT CONTRACT DEPLOYED AND NFTs MINTED!');
        console.log('   NFT Contract:', nftContractAddress);
        console.log('   Deploy Tx:', tx.hash);
        console.log('   Mint Tx:', mintTx.hash);
        console.log('   Token IDs:', tokenIds);
        
        // 10. Return complete success result with minting info
        return {
          success: true,
          message: `NFT contract deployed and ${quantity} NFT${quantity > 1 ? 's' : ''} minted successfully!`,
          contractAddress: nftContractAddress,
          transactionHash: tx.hash,
          mintTransactionHash: mintTx.hash,
          tokenIds: tokenIds,
          explorerUrl: `https://snowtrace.io/address/${nftContractAddress}`,
          tokenUrl: `https://web3.okx.com/explorer/avalanche/assets/${nftContractAddress}`
        };
        
      } catch (mintError) {
        console.error('❌ NFT minting failed:', mintError);
        
        // Return partial success - contract deployed but minting failed
        return {
          success: true,
          message: `NFT contract deployed successfully, but minting failed: ${mintError instanceof Error ? mintError.message : 'Unknown error'}`,
          contractAddress: nftContractAddress,
          transactionHash: tx.hash,
          explorerUrl: `https://snowtrace.io/address/${nftContractAddress}`,
          tokenUrl: `https://web3.okx.com/explorer/avalanche/assets/${nftContractAddress}`,
          warning: 'Contract deployed but no NFTs minted'
        };
      }
    }
    
    // 11. Fallback return for contract deployment without minting
    return {
      success: true,
      message: 'NFT contract deployed (could not mint NFTs)',
      contractAddress: nftContractAddress || 'Contract deployed successfully - check your wallet',
      transactionHash: tx.hash,
      explorerUrl: `https://snowtrace.io/tx/${tx.hash}`,
      tokenUrl: `https://snowtrace.io/tx/${tx.hash}`
    };
    
  } catch (error) {
    console.error('❌ Simple NFT deployment failed:', error);
    return {
      success: false,
      message: 'NFT deployment failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// SIMPLE: Deploy Token (placeholder - not implemented yet)
export async function deployTokenForAI(
  ) {
  try {
    // TODO: Implement simple token deployment if needed
    throw new Error('Token deployment not implemented in simple version');
  } catch (error) {
    return {
      success: false,
      message: 'Token deployment failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// SIMPLE: Component export (if needed)
export const AIHelpers = {
  deployNFTForAI,
  deployTokenForAI
};
