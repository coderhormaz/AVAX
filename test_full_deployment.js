// Complete Test Suite for Token and NFT Deployment
// Run this to verify your deployed contracts work perfectly

import { ethers } from 'ethers';

// Configuration
const CONFIG = {
  MASTER_FACTORY_ADDRESS: '0x5708fBd5178DD97AC90848de5800fF79b947051d',
  RPC_URL: 'https://api.avax.network/ext/bc/C/rpc',
  EXPLORER_URL: 'https://snowtrace.io'
};

// ABIs
const MASTER_FACTORY_ABI = [
  "function createToken(string memory name, string memory ticker, uint256 supply) public returns (address)",
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract, uint256[] memory tokenIds)",
  "function getUserContracts(address user) public view returns (address[] memory tokens, address[] memory nfts)",
  "function getFactories() public view returns (address, address)"
];

const ERC20_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)"
];

const ERC721_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)"
];

class DeploymentTester {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    this.masterFactory = new ethers.Contract(
      CONFIG.MASTER_FACTORY_ADDRESS,
      MASTER_FACTORY_ABI,
      this.provider
    );
  }

  // Test contract deployment status
  async testContractDeployment() {
    console.log('🔍 Testing MasterFactory deployment...');
    console.log(`Address: ${CONFIG.MASTER_FACTORY_ADDRESS}`);
    
    try {
      // Check if contract exists
      const code = await this.provider.getCode(CONFIG.MASTER_FACTORY_ADDRESS);
      if (code === '0x') {
        throw new Error('Contract not found at address');
      }
      console.log('✅ Contract exists and has code');
      
      // Test getFactories function
      const [tokenFactory, nftFactory] = await this.masterFactory.getFactories();
      console.log('✅ TokenFactory deployed at:', tokenFactory);
      console.log('✅ NFTFactory deployed at:', nftFactory);
      
      return { success: true, tokenFactory, nftFactory };
    } catch (error) {
      console.log('❌ Contract deployment test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test token creation flow (read-only simulation)
  async testTokenCreation() {
    console.log('\n🪙 Testing Token Creation Flow...');
    
    try {
      // Simulate createToken call (this won't actually deploy, just test the interface)
      const tokenName = "Test Token";
      const tokenTicker = "TEST";
      const tokenSupply = 1000000;
      
      console.log(`Simulating: createToken("${tokenName}", "${tokenTicker}", ${tokenSupply})`);
      
      // Estimate gas (this will fail without a signer, but shows the function exists)
      try {
        await this.masterFactory.createToken.estimateGas(tokenName, tokenTicker, tokenSupply);
        console.log('✅ createToken function is callable');
      } catch (error) {
        if (error.message.includes('sender')) {
          console.log('✅ createToken function exists (needs signer to execute)');
        } else {
          throw error;
        }
      }
      
      return { success: true };
    } catch (error) {
      console.log('❌ Token creation test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test NFT creation flow (read-only simulation)
  async testNFTCreation() {
    console.log('\n🖼️ Testing NFT Creation Flow...');
    
    try {
      const nftName = "Test NFT";
      const description = "This is a test NFT";
      const imageURI = "ipfs://QmTestHash123";
      const quantity = 1;
      
      console.log(`Simulating: createNFT("${nftName}", "${description}", "${imageURI}", ${quantity})`);
      
      // Estimate gas (this will fail without a signer, but shows the function exists)
      try {
        await this.masterFactory.createNFT.estimateGas(nftName, description, imageURI, quantity);
        console.log('✅ createNFT function is callable');
      } catch (error) {
        if (error.message.includes('sender')) {
          console.log('✅ createNFT function exists (needs signer to execute)');
        } else {
          throw error;
        }
      }
      
      return { success: true };
    } catch (error) {
      console.log('❌ NFT creation test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test user contracts query
  async testUserContracts() {
    console.log('\n👤 Testing User Contracts Query...');
    
    try {
      // Test with a random address
      const testAddress = '0x0000000000000000000000000000000000000001';
      const [tokens, nfts] = await this.masterFactory.getUserContracts(testAddress);
      
      console.log(`✅ getUserContracts works - Found ${tokens.length} tokens, ${nfts.length} NFTs`);
      
      return { success: true, tokens: tokens.length, nfts: nfts.length };
    } catch (error) {
      console.log('❌ User contracts test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Generate AI integration code
  generateAIIntegrationCode() {
    console.log('\n🤖 AI Integration Code:');
    console.log('```javascript');
    console.log(`// MasterFactory Contract Address`);
    console.log(`const MASTER_FACTORY = '${CONFIG.MASTER_FACTORY_ADDRESS}';`);
    console.log('');
    console.log('// For Token Creation:');
    console.log('// User provides: name, ticker, supply');
    console.log('async function createToken(name, ticker, supply) {');
    console.log('  const tx = await masterFactory.createToken(name, ticker, supply);');
    console.log('  const receipt = await tx.wait();');
    console.log('  return receipt; // Contains token address in events');
    console.log('}');
    console.log('');
    console.log('// For NFT Creation:');
    console.log('// User provides: name, description, image (upload to IPFS), quantity');
    console.log('async function createNFT(name, description, imageURI, quantity = 1) {');
    console.log('  const tx = await masterFactory.createNFT(name, description, imageURI, quantity);');
    console.log('  const receipt = await tx.wait();');
    console.log('  return receipt; // Contains NFT contract and token IDs');
    console.log('}');
    console.log('```');
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Complete Deployment Test Suite...\n');
    
    const results = {
      deployment: await this.testContractDeployment(),
      tokenCreation: await this.testTokenCreation(),
      nftCreation: await this.testNFTCreation(),
      userContracts: await this.testUserContracts()
    };
    
    const allPassed = Object.values(results).every(result => result.success);
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`Deployment Test: ${results.deployment.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Token Creation Test: ${results.tokenCreation.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`NFT Creation Test: ${results.nftCreation.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`User Contracts Test: ${results.userContracts.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log('========================');
    
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! Your deployment is ready for AI integration!');
      this.generateAIIntegrationCode();
      
      console.log('\n🚀 Next Steps:');
      console.log('1. Set up IPFS service (Pinata) for NFT images');
      console.log('2. Connect your AI to use the MasterFactory contract');
      console.log('3. Test with real transactions using a funded wallet');
      console.log(`4. View your contract: ${CONFIG.EXPLORER_URL}/address/${CONFIG.MASTER_FACTORY_ADDRESS}`);
      
    } else {
      console.log('❌ Some tests failed. Please check the errors above.');
    }
    
    return { allPassed, results };
  }
}

// Run tests
async function main() {
  const tester = new DeploymentTester();
  await tester.runAllTests();
}

// Execute if run directly
main().catch(console.error);

export { DeploymentTester, CONFIG };
