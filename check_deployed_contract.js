// Check deployed MasterFactory contract functions
import { ethers } from 'ethers';

const MASTER_FACTORY_ADDRESS = '0x5708fBd5178DD97AC90848de5800fF79b947051d';
const RPC_URL = 'https://api.avax.network/ext/bc/C/rpc';

// Create a minimal ABI to test different function signatures
const TEST_ABIS = {
  // Original signature (what we expect)
  createNFT_v1: "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract, uint256[] memory tokenIds)",
  
  // Simplified signature (what might be deployed)
  createNFT_v2: "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract)",
  
  // Even simpler (NFTFactory style)
  createNFT_v3: "function createNFT(string memory name, string memory symbol, string memory baseURI) public returns (address)",
  
  // Other functions to test
  createToken: "function createToken(string memory name, string memory ticker, uint256 supply) public returns (address)",
  getFactories: "function getFactories() public view returns (address, address)",
  getUserContracts: "function getUserContracts(address user) public view returns (address[] memory tokens, address[] memory nfts)"
};

async function checkDeployedContract() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log('🔍 Checking deployed MasterFactory contract...');
  console.log(`Address: ${MASTER_FACTORY_ADDRESS}\n`);
  
  // Check if contract exists
  const code = await provider.getCode(MASTER_FACTORY_ADDRESS);
  if (code === '0x') {
    console.log('❌ Contract not found');
    return;
  }
  console.log('✅ Contract exists\n');
  
  // Test each function signature
  for (const [name, abi] of Object.entries(TEST_ABIS)) {
    console.log(`Testing ${name}...`);
    
    try {
      const contract = new ethers.Contract(MASTER_FACTORY_ADDRESS, [abi], provider);
      const func = contract.getFunction(name.split('_')[0]);
      
      if (name === 'getFactories') {
        // Test read function
        const result = await func();
        console.log(`✅ ${name} works - TokenFactory: ${result[0]}, NFTFactory: ${result[1]}`);
      } else if (name === 'getUserContracts') {
        // Test read function with parameter
        const testAddr = '0x0000000000000000000000000000000000000001';
        const result = await func(testAddr);
        console.log(`✅ ${name} works - Found ${result[0].length} tokens, ${result[1].length} NFTs`);
      } else {
        // Test function signature by estimating gas (will fail but show if function exists)
        if (name.startsWith('createToken')) {
          await func.estimateGas("TestToken", "TEST", 1000000);
        } else if (name.startsWith('createNFT')) {
          if (name === 'createNFT_v3') {
            await func.estimateGas("TestNFT", "TNFT", "ipfs://test");
          } else {
            await func.estimateGas("TestNFT", "Test Description", "ipfs://test", 1);
          }
        }
        console.log(`✅ ${name} signature exists (function is callable)`);
      }
    } catch (error) {
      if (error.message.includes('no matching function')) {
        console.log(`❌ ${name} - Function signature not found`);
      } else if (error.message.includes('sender')) {
        console.log(`✅ ${name} - Function exists (needs signer)`);
      } else {
        console.log(`❓ ${name} - ${error.message.slice(0, 100)}...`);
      }
    }
    console.log('');
  }
}

checkDeployedContract().catch(console.error);
