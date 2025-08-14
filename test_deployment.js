// Test script to verify MasterFactory deployment
// Run this to test your deployed contract

const { ethers } = require('ethers');

// Your deployed contract
const MASTER_FACTORY_ADDRESS = '0x5708fBd5178DD97AC90848de5800fF79b947051d';

// Avalanche Mainnet RPC
const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

// MasterFactory ABI (main functions)
const MASTER_FACTORY_ABI = [
  "function createToken(string memory name, string memory ticker, uint256 supply) public returns (address)",
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract, uint256[] memory tokenIds)",
  "function getUserContracts(address user) public view returns (address[] memory tokens, address[] memory nfts)",
  "function getFactories() public view returns (address, address)"
];

async function testDeployment() {
  console.log('🔍 Testing MasterFactory deployment...');
  console.log('Address:', MASTER_FACTORY_ADDRESS);
  
  try {
    // Create contract instance
    const masterFactory = new ethers.Contract(MASTER_FACTORY_ADDRESS, MASTER_FACTORY_ABI, provider);
    
    // Test 1: Check if contract exists
    const code = await provider.getCode(MASTER_FACTORY_ADDRESS);
    if (code === '0x') {
      console.log('❌ Contract not found at address');
      return;
    }
    console.log('✅ Contract exists');
    
    // Test 2: Call getFactories() to verify it works
    const [tokenFactory, nftFactory] = await masterFactory.getFactories();
    console.log('✅ TokenFactory:', tokenFactory);
    console.log('✅ NFTFactory:', nftFactory);
    
    // Test 3: Check user contracts (should return empty arrays for new address)
    const testAddress = '0x0000000000000000000000000000000000000001';
    const [tokens, nfts] = await masterFactory.getUserContracts(testAddress);
    console.log('✅ getUserContracts works - Tokens:', tokens.length, 'NFTs:', nfts.length);
    
    console.log('\n🎉 MasterFactory is deployed and working correctly!');
    console.log('\n📋 Ready for AI Integration:');
    console.log('- Token Creation: masterFactory.createToken(name, ticker, supply)');
    console.log('- NFT Creation: masterFactory.createNFT(name, description, imageURI, quantity)');
    
  } catch (error) {
    console.log('❌ Error testing contract:', error.message);
  }
}

// Run test
testDeployment();

/* 
To run this test:
1. npm install ethers
2. node test_deployment.js

Expected output:
✅ Contract exists
✅ TokenFactory: 0x...
✅ NFTFactory: 0x...
✅ getUserContracts works
🎉 MasterFactory is deployed and working correctly!
*/
