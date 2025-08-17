// Test to verify the exact error and fix it
import { ethers } from 'ethers';

async function testSimpleDeployment() {
  try {
    console.log('🔍 Testing simple NFT deployment to identify the exact issue...');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    
    // Test with a valid owner address (not zero)
    const validOwner = '0x61505ED189E71809dbA2349D0222d511EeFCE6Bd'; // Your wallet
    
    // NFT Factory ABI
    const NFT_FACTORY_ABI = [
      "function deployNFT(string memory name, string memory symbol, string memory baseURI, address owner) public returns (address)"
    ];
    
    const nftFactoryAddress = '0x7021Bdba9C4B2fBbeD8B5Fee212b3683896ae3Ff';
    const nftFactory = new ethers.Contract(nftFactoryAddress, NFT_FACTORY_ABI, provider);
    
    console.log('📋 Testing NFT Factory with valid parameters...');
    
    // Test 1: Valid parameters
    const testParams1 = {
      name: 'TestNFT',
      symbol: 'TEST',
      baseURI: 'ipfs://QmValidHash',
      owner: validOwner  // Valid owner address
    };
    
    console.log('🧪 Test 1 - Valid owner:', testParams1.owner);
    
    try {
      const gasEstimate1 = await nftFactory.deployNFT.estimateGas(
        testParams1.name,
        testParams1.symbol,
        testParams1.baseURI,
        testParams1.owner
      );
      console.log('✅ Test 1 passed - Gas estimate:', gasEstimate1.toString());
    } catch (error1) {
      console.error('❌ Test 1 failed:', error1.message);
    }
    
    // Test 2: Zero address owner
    const testParams2 = {
      name: 'TestNFT',
      symbol: 'TEST', 
      baseURI: 'ipfs://QmValidHash',
      owner: '0x0000000000000000000000000000000000000000'  // Zero address
    };
    
    console.log('🧪 Test 2 - Zero address owner:', testParams2.owner);
    
    try {
      const gasEstimate2 = await nftFactory.deployNFT.estimateGas(
        testParams2.name,
        testParams2.symbol,
        testParams2.baseURI,
        testParams2.owner
      );
      console.log('✅ Test 2 passed - Gas estimate:', gasEstimate2.toString());
    } catch (error2) {
      console.error('❌ Test 2 failed (expected):', error2.message);
      if (error2.data) {
        console.log('🔍 Error signature:', error2.data);
        if (error2.data === '0x64a0ae92' || error2.data.includes('64a0ae92')) {
          console.log('🎯 CONFIRMED: Error 0x64a0ae92 is from zero address owner!');
        }
      }
    }
    
    console.log('\n💡 DIAGNOSIS:');
    console.log('   - Error 0x64a0ae92 is likely OwnableInvalidOwner(address(0))');
    console.log('   - OpenZeppelin Ownable contract rejects zero address as owner');
    console.log('   - MasterFactory must ensure valid owner is passed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSimpleDeployment()
  .then(() => {
    console.log('\n🎉 ERROR DIAGNOSIS COMPLETE!');
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
  });
