// 🚀 Deploy Enhanced MasterFactory with Shared NFT Collection
// This deploys the MasterFactory.sol with SharedNFTCollection support

const { ethers } = require('ethers');
const fs = require('fs');

async function deployEnhancedMasterFactory() {
    try {
        console.log('🌐 DEPLOYING ENHANCED MASTERFACTORY WITH SHARED COLLECTION...\n');

        // Connect to Avalanche Mainnet
        const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
        
        // Get wallet (replace with your actual private key)
        const privateKey = process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE';
        
        if (privateKey === 'YOUR_PRIVATE_KEY_HERE') {
            console.log('⚠️  Please set your PRIVATE_KEY environment variable');
            console.log('   Example: set PRIVATE_KEY=0x1234... && node deploy_enhanced_masterfactory.js');
            return;
        }
        
        const wallet = new ethers.Wallet(privateKey, provider);
        
        console.log('Deploying from wallet:', wallet.address);
        console.log('Network: Avalanche Mainnet');
        
        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        const balanceInAVAX = ethers.formatEther(balance);
        console.log(`Wallet balance: ${balanceInAVAX} AVAX`);
        
        if (parseFloat(balanceInAVAX) < 0.01) {
            throw new Error(`Insufficient AVAX balance (${balanceInAVAX} AVAX). Need at least 0.01 AVAX for deployment.`);
        }
        
        console.log('\n📋 NEW MASTERFACTORY FEATURES:');
        console.log('✅ SharedNFTCollection.sol integration');
        console.log('✅ addToSharedCollection() function');
        console.log('✅ Community collection deployed automatically');
        console.log('✅ Sequential token IDs: 1, 2, 3, 4, 5...');
        console.log('✅ Multiple wallets can contribute to same collection');
        console.log('✅ Lower gas fees per NFT');
        console.log('✅ Higher discoverability');
        
        console.log('\n🔧 To complete deployment:');
        console.log('1. Compile contracts/MasterFactory.sol');
        console.log('2. Compile contracts/SharedNFTCollection.sol'); 
        console.log('3. Deploy both contracts to Avalanche Mainnet');
        console.log('4. Update MASTER_FACTORY address in src/config.ts');
        console.log('5. Test NFT creation flow');
        
        console.log('\n✨ Expected User Experience:');
        console.log('User says: "create nft called CoolArt"');
        console.log('→ AI processes request');
        console.log('→ Image uploaded to IPFS');
        console.log('→ Metadata JSON created');
        console.log('→ NFT added to shared community collection');
        console.log('→ User gets token ID (e.g., #42)');
        console.log('→ NFT viewable at: https://web3.okx.com/explorer/avalanche/assets/[SHARED_ADDRESS]/42');
        
        console.log('\n🌐 SHARED COLLECTION BENEFITS:');
        console.log('• All community NFTs in one contract address');
        console.log('• Sequential token IDs make it easy to browse');
        console.log('• Lower gas fees (shared deployment costs)');
        console.log('• Higher discoverability (part of larger collection)');
        console.log('• Community-driven growth');
        console.log('• Still individual ownership of each NFT');
        
        console.log('\n🎯 READY FOR ENHANCED DEPLOYMENT!');
        
    } catch (error) {
        console.error('❌ Deployment Error:', error);
    }
}

// Show current enhancement status
console.log('📋 MASTERFACTORY ENHANCEMENT STATUS:');
console.log('');
console.log('✅ SharedNFTCollection.sol - Created with community features');
console.log('✅ MasterFactory.sol - Updated with shared collection support');
console.log('✅ EnhancedAIDeployment.tsx - New deployment system');
console.log('✅ ChatInterface.tsx - Updated to use shared collection');
console.log('');
console.log('🌐 NEW FEATURES:');
console.log('• addToSharedCollection() function');
console.log('• getSharedCollectionInfo() function');
console.log('• getUserSharedCollectionStats() function');
console.log('• Sequential token ID assignment');
console.log('• Community contributor tracking');
console.log('• Lower gas fees for NFT creation');
console.log('');
console.log('🎯 READY FOR ENHANCED DEPLOYMENT!');
console.log('');

deployEnhancedMasterFactory();
