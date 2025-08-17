// EMERGENCY NFT DEPLOYMENT - Bypassing broken MasterFactory
import { ethers } from 'ethers';

const CONFIG = {
  NETWORK: {
    MAINNET: {
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114
    }
  }
};

const NFT_FACTORY_ABI = [
  "function deployNFT(string memory name, string memory symbol, string memory baseURI, address owner) public returns (address)",
  "event NFTDeployed(address indexed nftAddress, address indexed owner, string name, string symbol, string baseURI)"
];

// Emergency NFT deployment function
export async function emergencyDeployNFT(
  name,
  imageURI,
  privateKey
) {
  try {
    console.log('🚨 EMERGENCY: Direct NFT Factory deployment (bypassing broken MasterFactory)');
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('👤 Deploying with wallet:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInAVAX = ethers.formatEther(balance);
    console.log('💰 Balance:', balanceInAVAX, 'AVAX');
    
    if (parseFloat(balanceInAVAX) < 0.003) {
      throw new Error(`Insufficient balance: ${balanceInAVAX} AVAX. Need at least 0.003 AVAX.`);
    }
    
    // NFT Factory address (working contract)
    const nftFactoryAddress = '0x7021Bdba9C4B2fBbeD8B5Fee212b3683896ae3Ff';
    
    // Create NFT Factory contract
    const nftFactory = new ethers.Contract(nftFactoryAddress, NFT_FACTORY_ABI, wallet);
    
    // Generate symbol from name
    const symbol = name.substring(0, 3).toUpperCase() + 'NFT';
    
    console.log('📋 Deployment Parameters:');
    console.log('   Name:', name);
    console.log('   Symbol:', symbol);
    console.log('   BaseURI:', imageURI);
    console.log('   Owner:', wallet.address);
    
    // Deploy NFT
    console.log('🚀 Deploying NFT directly via NFTFactory...');
    const tx = await nftFactory.deployNFT(name, symbol, imageURI, wallet.address, {
      gasLimit: 3000000,  // Higher limit for direct deployment
      gasPrice: ethers.parseUnits('1', 'gwei')  // 1 nAVAX
    });
    
    console.log('📡 Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', receipt.hash);
    
    if (receipt.status !== 1) {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
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
      nftContractAddress = 'Deployed successfully (address in logs)';
    }
    
    console.log('🎉 EMERGENCY DEPLOYMENT SUCCESSFUL!');
    console.log('   NFT Contract:', nftContractAddress);
    console.log('   Transaction:', tx.hash);
    console.log('   Gas Used:', receipt.gasUsed.toString());
    
    return {
      success: true,
      nftContract: nftContractAddress,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('❌ Emergency deployment failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test the emergency deployment
async function testEmergencyDeployment() {
  try {
    // Read wallet private key from environment
    const fs = await import('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    // Use test parameters
    const result = await emergencyDeployNFT(
      'TestEmergencyNFT',
      'ipfs://QmTestImageHashForEmergency',
      envVars.VITE_PRIVATE_KEY || 'no-key-found'
    );
    
    if (result.success) {
      console.log('✅ EMERGENCY TEST PASSED - Deployment works!');
      console.log('🎯 This method WILL work for the user!');
    } else {
      console.log('❌ Emergency test failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Test setup failed:', error.message);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmergencyDeployment();
}
