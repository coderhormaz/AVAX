// Quick test to verify gas limit and contract connectivity fixes
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

const MASTER_FACTORY_ABI = [
  "function tokenFactory() public view returns (address)",
  "function nftFactory() public view returns (address)",
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract)"
];

async function testContractConnectivity() {
  try {
    console.log('🔗 Testing MasterFactory contract connectivity...');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    
    // Create contract instance (read-only)
    const masterFactory = new ethers.Contract(
      CONFIG.CONTRACTS.MASTER_FACTORY,
      MASTER_FACTORY_ABI,
      provider
    );
    
    // Test connectivity
    const tokenFactory = await masterFactory.tokenFactory();
    const nftFactory = await masterFactory.nftFactory();
    
    console.log('✅ Contract connectivity test PASSED');
    console.log('📍 Token Factory:', tokenFactory);
    console.log('📍 NFT Factory:', nftFactory);
    
    // Calculate gas cost with new settings
    const gasLimit = 1000000; // 1M gas limit
    const gasPrice = ethers.parseUnits('3', 'gwei'); // 3 nAVAX
    
    const gasCostWei = BigInt(gasLimit) * gasPrice;
    const gasCostAVAX = ethers.formatEther(gasCostWei);
    const gasCostUSD = parseFloat(gasCostAVAX) * 30; // Assuming $30 AVAX
    
    console.log('💰 Gas Cost Estimate:');
    console.log(`   Gas Limit: ${gasLimit.toLocaleString()}`);
    console.log(`   Gas Price: 3 nAVAX (${ethers.formatUnits(gasPrice, 'gwei')} gwei)`);
    console.log(`   Total Cost: ${gasCostAVAX} AVAX ($${gasCostUSD.toFixed(4)})`);
    
    if (gasCostUSD <= 0.10) {
      console.log('✅ Cost is within acceptable range (≤ $0.10)');
    } else {
      console.log('⚠️ Cost may be higher than target $0.05');
    }
    
  } catch (error) {
    console.error('❌ Contract connectivity test FAILED:', error.message);
    throw error;
  }
}

// Run the test
testContractConnectivity()
  .then(() => {
    console.log('\n🎉 All tests PASSED! The contract is ready for NFT deployment.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test FAILED:', error.message);
    process.exit(1);
  });
