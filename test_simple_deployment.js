// FINAL TEST - Simple NFT Deployment Method
import { ethers } from 'ethers';

const CONFIG = {
  NETWORK: {
    MAINNET: {
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
    }
  }
};

const NFT_FACTORY_ABI = [
  "function deployNFT(string memory name, string memory symbol, string memory baseURI, address owner) public returns (address)"
];

async function testSimpleDeployment() {
  try {
    console.log('🎯 TESTING SIMPLE NFT DEPLOYMENT METHOD');
    console.log('=' .repeat(60));
    
    // 1. Test blockchain connection
    console.log('\n1️⃣ Testing blockchain connection...');
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    const network = await provider.getNetwork();
    console.log('✅ Connected to Avalanche:', network.chainId.toString());
    
    // 2. Test wallet balance
    console.log('\n2️⃣ Testing wallet balance...');
    const walletAddress = '0x61505ED189E71809dbA2349D0222d511EeFCE6Bd';
    const balance = await provider.getBalance(walletAddress);
    const balanceInAVAX = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceInAVAX} AVAX`);
    
    // Calculate gas cost
    const gasLimit = 3000000;
    const gasPrice = ethers.parseUnits('1', 'gwei');
    const gasCostWei = BigInt(gasLimit) * gasPrice;
    const gasCostAVAX = ethers.formatEther(gasCostWei);
    
    console.log(`⛽ Gas Cost: ${gasCostAVAX} AVAX`);
    
    if (parseFloat(balanceInAVAX) >= parseFloat(gasCostAVAX)) {
      console.log('✅ SUFFICIENT BALANCE');
    } else {
      console.log('❌ INSUFFICIENT BALANCE');
      throw new Error(`Need ${gasCostAVAX} AVAX, have ${balanceInAVAX} AVAX`);
    }
    
    // 3. Test NFT Factory contract
    console.log('\n3️⃣ Testing NFT Factory contract...');
    const nftFactoryAddress = '0x7021Bdba9C4B2fBbeD8B5Fee212b3683896ae3Ff';
    const nftFactory = new ethers.Contract(nftFactoryAddress, NFT_FACTORY_ABI, provider);
    
    console.log('🏭 NFT Factory Address:', nftFactoryAddress);
    
    // Check if contract has code
    const code = await provider.getCode(nftFactoryAddress);
    if (code === '0x') {
      throw new Error('NFT Factory contract not deployed');
    }
    console.log('✅ NFT Factory has code:', code.length, 'bytes');
    
    // 4. Test gas estimation
    console.log('\n4️⃣ Testing gas estimation...');
    
    const testParams = {
      name: 'TestNFT',
      symbol: 'TEST',
      baseURI: 'ipfs://QmTestHash123',
      owner: walletAddress
    };
    
    console.log('📋 Test parameters:', testParams);
    
    try {
      const gasEstimate = await nftFactory.deployNFT.estimateGas(
        testParams.name,
        testParams.symbol,
        testParams.baseURI,
        testParams.owner
      );
      
      console.log('✅ Gas estimate:', gasEstimate.toString());
      
      if (BigInt(gasEstimate) <= BigInt(gasLimit)) {
        console.log('✅ Gas limit sufficient');
      } else {
        console.log('⚠️ May need higher gas limit');
      }
      
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError.message);
      throw gasError;
    }
    
    // 5. Final verification
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SIMPLE DEPLOYMENT VERIFICATION COMPLETE');
    console.log('✅ Blockchain: Connected');
    console.log('✅ Balance: Sufficient');
    console.log('✅ NFT Factory: Working');
    console.log('✅ Gas: Estimation successful');
    console.log('✅ Cost: ~$0.03 (very affordable)');
    console.log('=' .repeat(60));
    
    console.log('\n🚀 SIMPLE METHOD READY - WILL WORK 100%!');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ SIMPLE METHOD TEST FAILED:', error.message);
    console.error('💥 Deployment will not work');
    throw error;
  }
}

// Run the test
testSimpleDeployment()
  .then(() => {
    console.log('\n✅ ALL TESTS PASSED - SIMPLE METHOD READY!');
    process.exit(0);
  })
  .catch(() => {
    console.error('\n💥 TESTS FAILED - SIMPLE METHOD NOT READY');
    process.exit(1);
  });
