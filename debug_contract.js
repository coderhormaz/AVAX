// Direct test of MasterFactory.createNFT to debug the revert
import { ethers } from 'ethers';
import fs from 'fs';

// Read environment variables manually
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const CONFIG = {
  NETWORK: {
    MAINNET: {
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114
    }
  },
  CONTRACTS: {
    MASTER_FACTORY: '0x5708fBd5178DD97AC90848de5800fF79b947051d'
  }
};

const MASTER_FACTORY_ABI = [
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract)",
  "function tokenFactory() public view returns (address)",
  "function nftFactory() public view returns (address)"
];

const NFT_FACTORY_ABI = [
  "function deployNFT(string memory name, string memory symbol, string memory metadataURI, address owner) public returns (address)",
  "function owner() public view returns (address)"
];

async function debugContractCall() {
  try {
    console.log('🔍 Debugging MasterFactory.createNFT revert...');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    
    // Get private key from environment
    const privateKey = envVars.VITE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('VITE_PRIVATE_KEY not found in environment');
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('👤 Wallet address:', wallet.address);
    
    // Create contract instances
    const masterFactory = new ethers.Contract(CONFIG.CONTRACTS.MASTER_FACTORY, MASTER_FACTORY_ABI, wallet);
    
    // Test 1: Check if factories are deployed
    console.log('\n📋 Step 1: Checking factory contracts...');
    const tokenFactoryAddr = await masterFactory.tokenFactory();
    const nftFactoryAddr = await masterFactory.nftFactory();
    console.log('✅ Token Factory:', tokenFactoryAddr);
    console.log('✅ NFT Factory:', nftFactoryAddr);
    
    // Test 2: Check NFT Factory contract
    console.log('\n📋 Step 2: Checking NFT Factory...');
    const nftFactory = new ethers.Contract(nftFactoryAddr, NFT_FACTORY_ABI, provider);
    try {
      const nftFactoryOwner = await nftFactory.owner();
      console.log('✅ NFT Factory Owner:', nftFactoryOwner);
    } catch (error) {
      console.log('⚠️ NFT Factory owner check failed:', error.message);
    }
    
    // Test 3: Simple parameters
    console.log('\n📋 Step 3: Testing with simple parameters...');
    const testParams = {
      name: 'Test',
      description: 'Test',
      imageURI: 'ipfs://QmTest',
      quantity: 1
    };
    
    console.log('📋 Test parameters:', testParams);
    
    // Test 4: Estimate gas first
    console.log('\n📋 Step 4: Estimating gas...');
    try {
      const gasEstimate = await masterFactory.createNFT.estimateGas(
        testParams.name,
        testParams.description, 
        testParams.imageURI,
        testParams.quantity
      );
      console.log('⛽ Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError.message);
      
      // Try to get more details about the revert
      if (gasError.data) {
        console.log('🔍 Error data:', gasError.data);
      }
      if (gasError.reason) {
        console.log('🔍 Error reason:', gasError.reason);
      }
      
      // The gas estimation failure tells us why the transaction would revert
      console.log('\n💡 Gas estimation failure indicates contract revert reason');
      throw gasError;
    }
    
    console.log('\n✅ All checks passed! Contract should work.');
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error.message);
    
    if (error.code === 'CALL_EXCEPTION') {
      console.log('\n🔍 Call exception details:');
      console.log('   - This means the contract call reverted');
      console.log('   - The contract rejected the parameters or has internal issues');
      console.log('   - Check if NFT Factory deployment is correct');
      console.log('   - Check if contract has required permissions');
    }
    
    throw error;
  }
}

// Run the debug test
debugContractCall()
  .then(() => {
    console.log('\n🎉 DEBUG TEST PASSED!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 DEBUG TEST FAILED - This shows why NFT creation is reverting');
    process.exit(1);
  });
