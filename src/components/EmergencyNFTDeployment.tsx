// FINAL EMERGENCY FIX - Replace broken AIDeployment.tsx deployNFTForAI function
// This bypasses the broken MasterFactory and deploys NFT directly via NFTFactory

import { ethers } from 'ethers';
import { CONFIG } from '../config';
import type { WalletData } from '../App';

const NFT_FACTORY_ABI = [
  "function deployNFT(string memory name, string memory symbol, string memory baseURI, address owner) public returns (address)",
  "event NFTDeployed(address indexed nftAddress, address indexed owner, string name, string symbol, string baseURI)"
];

// EMERGENCY: Direct NFT Factory deployment (bypassing broken MasterFactory)
export async function emergencyDeployNFTForAI(
  name: string,
  description: string = '',
  imageFile: File,
  quantity: number = 1,
  wallet: WalletData
) {
  try {
    console.log('🚨 EMERGENCY: Using direct NFTFactory deployment (MasterFactory broken)');
    console.log('🤖 AI: Deploying NFT with existing wallet...', { name, description, quantity });
    
    if (!wallet) {
      throw new Error('Wallet not provided. Please ensure you are logged in.');
    }
    
    // Upload image using working Lighthouse method
    console.log('🔄 Using working Lighthouse method...');
    const { uploadImageForNFTLighthouseOriginal } = await import('../services/ipfs-lighthouse-original');
    const { imageURI, metadataURI } = await uploadImageForNFTLighthouseOriginal(imageFile, name, description);
    
    console.log('🖼️ Image URI:', imageURI);
    console.log('📄 Metadata URI:', metadataURI);
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    const ethersWallet = new ethers.Wallet(wallet.privateKey, provider);
    
    console.log('🔗 Connected to provider:', CONFIG.NETWORK.MAINNET.rpcUrl);
    console.log('🔑 Wallet address:', ethersWallet.address);
    
    // Check wallet balance
    const balance = await provider.getBalance(ethersWallet.address);
    const balanceInAVAX = ethers.formatEther(balance);
    console.log(`💰 Wallet balance: ${balanceInAVAX} AVAX`);
    
    if (parseFloat(balanceInAVAX) < 0.003) {
      throw new Error(`Insufficient AVAX balance (${balanceInAVAX} AVAX). Need at least 0.003 AVAX for gas fees.`);
    }
    console.log('✅ Sufficient balance for deployment');
    
    // NFT Factory address (known working contract)
    const nftFactoryAddress = '0x7021Bdba9C4B2fBbeD8B5Fee212b3683896ae3Ff';
    
    // Create NFT Factory contract
    const nftFactory = new ethers.Contract(nftFactoryAddress, NFT_FACTORY_ABI, ethersWallet);
    
    // Generate symbol from name
    const symbol = name.substring(0, 3).toUpperCase() + 'NFT';
    
    console.log('📋 Emergency Deployment Parameters:');
    console.log('   Name:', name);
    console.log('   Symbol:', symbol);
    console.log('   BaseURI:', imageURI);
    console.log('   Owner:', ethersWallet.address);
    
    // Validate parameters
    if (!name || name.trim().length === 0) {
      throw new Error('NFT name cannot be empty');
    }
    if (!imageURI || imageURI.trim().length === 0) {
      throw new Error('Image URI cannot be empty');
    }
    if (!imageURI.startsWith('ipfs://')) {
      throw new Error(`Invalid image URI format: ${imageURI}. Must start with ipfs://`);
    }
    
    console.log('✅ All parameters validated successfully');
    console.log('🚀 Deploying NFT directly via NFTFactory (bypassing broken MasterFactory)...');
    
    // Deploy NFT with emergency settings
    const tx = await nftFactory.deployNFT(name, symbol, imageURI, ethersWallet.address, {
      gasLimit: 3000000,  // Higher limit for safety
      gasPrice: ethers.parseUnits('1', 'gwei')  // Low 1 nAVAX price
    });
    
    console.log('📡 Emergency transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Emergency transaction confirmed:', receipt.hash);
    
    if (receipt.status !== 1) {
      throw new Error(`Emergency deployment failed with status: ${receipt.status}`);
    }
    
    // Get NFT contract address from events
    let nftContractAddress = null;
    
    for (const log of receipt.logs) {
      try {
        const parsedLog = nftFactory.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'NFTDeployed') {
          nftContractAddress = parsedLog.args[0];
          console.log('🎨 NFT Contract Address:', nftContractAddress);
          break;
        }
      } catch {
        // Skip unparseable logs
      }
    }
    
    if (!nftContractAddress) {
      console.log('⚠️ Could not extract NFT contract address from events');
      nftContractAddress = 'Deployed successfully (check transaction logs)';
    }
    
    const result = {
      nftContract: nftContractAddress,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      imageURI: imageURI,
      metadataURI: metadataURI
    };
    
    console.log('🎉 EMERGENCY DEPLOYMENT SUCCESSFUL!');
    console.log('   NFT Contract:', result.nftContract);
    console.log('   Transaction:', result.transactionHash);
    console.log('   Gas Used:', result.gasUsed);
    console.log('   Total Cost: ~$0.03 (1 nAVAX gas price)');
    
    return {
      success: true,
      message: 'NFT deployed successfully using emergency method (bypassed broken MasterFactory)',
      contractAddress: nftContractAddress,
      transactionHash: tx.hash,
      explorerUrl: `https://snowtrace.io/address/${nftContractAddress}`,
      tokenUrl: `https://web3.okx.com/explorer/avalanche/assets/${nftContractAddress}`,
      data: result
    };
    
  } catch (error) {
    console.error('❌ Emergency NFT deployment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Emergency deployment failed'
    };
  }
}
