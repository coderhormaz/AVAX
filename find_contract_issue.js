// Quick test to identify the exact contract issue
import { ethers } from 'ethers';

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

// Simplified ABI to test the contract
const MASTER_FACTORY_ABI = [
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract)",
  "function tokenFactory() public view returns (address)",
  "function nftFactory() public view returns (address)"
];

const NFT_FACTORY_ABI = [
  "function deployNFT(string memory name, string memory symbol, string memory metadataURI, address owner) public returns (address)"
];

async function findContractIssue() {
  try {
    console.log('🔍 Investigating contract issue...');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    
    // Create read-only contract instance
    const masterFactory = new ethers.Contract(CONFIG.CONTRACTS.MASTER_FACTORY, MASTER_FACTORY_ABI, provider);
    
    // Test 1: Check if factories exist
    console.log('\n📋 Step 1: Checking factory contracts...');
    const tokenFactoryAddr = await masterFactory.tokenFactory();
    const nftFactoryAddr = await masterFactory.nftFactory();
    console.log('✅ Token Factory:', tokenFactoryAddr);
    console.log('✅ NFT Factory:', nftFactoryAddr);
    
    // Test 2: Check if NFT Factory is a valid contract
    console.log('\n📋 Step 2: Checking NFT Factory contract...');
    const nftFactoryCode = await provider.getCode(nftFactoryAddr);
    if (nftFactoryCode === '0x') {
      console.log('❌ NFT Factory has no code - contract not deployed properly!');
      throw new Error('NFT Factory contract is not deployed');
    } else {
      console.log('✅ NFT Factory has code:', nftFactoryCode.length, 'bytes');
    }
    
    // Test 3: Check if MasterFactory has code
    console.log('\n📋 Step 3: Checking MasterFactory contract...');
    const masterFactoryCode = await provider.getCode(CONFIG.CONTRACTS.MASTER_FACTORY);
    console.log('✅ MasterFactory has code:', masterFactoryCode.length, 'bytes');
    
    // Test 4: Try to call NFT Factory directly
    console.log('\n📋 Step 4: Testing NFT Factory direct call...');
    const nftFactory = new ethers.Contract(nftFactoryAddr, NFT_FACTORY_ABI, provider);
    
    // Test parameters
    const testParams = {
      name: 'Test',
      symbol: 'TEST',
      metadataURI: 'ipfs://QmTest',
      owner: '0x61505ED189E71809dbA2349D0222d511EeFCE6Bd' // Your wallet address
    };
    
    console.log('📋 Direct NFT Factory test parameters:', testParams);
    
    // Try gas estimation on NFT Factory
    try {
      const gasEstimate = await nftFactory.deployNFT.estimateGas(
        testParams.name,
        testParams.symbol,
        testParams.metadataURI,
        testParams.owner
      );
      console.log('✅ NFT Factory gas estimate:', gasEstimate.toString());
    } catch (nftError) {
      console.error('❌ NFT Factory direct call failed:', nftError.message);
      console.log('🔍 This indicates the issue is in the NFT Factory contract');
      throw nftError;
    }
    
    // Test 5: Test MasterFactory parameters
    console.log('\n📋 Step 5: Testing MasterFactory parameters...');
    const masterParams = {
      name: 'Test',
      description: 'Test Description',
      imageURI: 'ipfs://QmTestImage',
      quantity: 1
    };
    
    console.log('📋 MasterFactory test parameters:', masterParams);
    
    // Try gas estimation on MasterFactory
    try {
      const gasEstimate = await masterFactory.createNFT.estimateGas(
        masterParams.name,
        masterParams.description,
        masterParams.imageURI,
        masterParams.quantity
      );
      console.log('✅ MasterFactory gas estimate:', gasEstimate.toString());
    } catch (masterError) {
      console.error('❌ MasterFactory call failed:', masterError.message);
      
      if (masterError.data) {
        console.log('🔍 Error data:', masterError.data);
      }
      
      console.log('🔍 This indicates the issue is in the MasterFactory logic');
      throw masterError;
    }
    
    console.log('\n✅ All contract tests passed! The issue might be elsewhere.');
    
  } catch (error) {
    console.error('\n❌ Contract investigation failed:', error.message);
    
    // Provide specific diagnostics
    if (error.message.includes('Factory')) {
      console.log('\n💡 DIAGNOSIS: Factory contract issue');
      console.log('   - NFT Factory or Token Factory not properly deployed');
      console.log('   - MasterFactory pointing to invalid factory addresses');
    } else if (error.message.includes('gas')) {
      console.log('\n💡 DIAGNOSIS: Gas estimation failure');
      console.log('   - Contract would revert during execution');
      console.log('   - Check contract parameters and logic');
    } else {
      console.log('\n💡 DIAGNOSIS: Unknown contract issue');
      console.log('   - Check contract deployment and network');
    }
    
    throw error;
  }
}

// Run the investigation
findContractIssue()
  .then(() => {
    console.log('\n🎉 CONTRACT INVESTIGATION COMPLETE!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 FOUND THE ISSUE! Contract has problems.');
    process.exit(1);
  });
