// Test the deploying wallet to ensure it's valid and has funds
import { ethers } from 'ethers';

async function checkWalletIssue() {
  try {
    console.log('🔍 Checking wallet and deployment context...');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    
    // The wallet address from the transaction
    const walletAddress = '0x61505ED189E71809dbA2349D0222d511EeFCE6Bd';
    
    console.log('👤 Checking wallet:', walletAddress);
    
    // Check wallet balance
    const balance = await provider.getBalance(walletAddress);
    const balanceInAVAX = ethers.formatEther(balance);
    
    console.log('💰 Wallet balance:', balanceInAVAX, 'AVAX');
    
    if (parseFloat(balanceInAVAX) < 0.01) {
      console.log('⚠️ Low balance! Might cause deployment issues');
    } else {
      console.log('✅ Sufficient balance for deployment');
    }
    
    // Check wallet code (should be empty for EOA)
    const code = await provider.getCode(walletAddress);
    if (code === '0x') {
      console.log('✅ Wallet is an EOA (externally owned account)');
    } else {
      console.log('⚠️ Wallet is a contract, not an EOA');
    }
    
    // Check nonce
    const nonce = await provider.getTransactionCount(walletAddress);
    console.log('📊 Wallet nonce:', nonce);
    
    console.log('\n💡 POSSIBLE CAUSES:');
    console.log('1. 🔥 Gas estimation fails due to contract revert');
    console.log('2. 🪙 Insufficient funds for gas fees');
    console.log('3. 🔧 Contract deployment issues');
    console.log('4. 🎯 Zero address being passed somewhere in the call chain');
    
    console.log('\n🛠️ RECOMMENDED FIXES:');
    console.log('1. ✅ Ensure sufficient AVAX balance (>0.01 AVAX)');
    console.log('2. ✅ Use a fresh transaction with higher gas limit');
    console.log('3. ✅ Test with a simple NFT deployment first');
    console.log('4. ✅ Check if MasterFactory contract has bugs');
    
    // The real issue might be in how the MasterFactory calls NFTFactory
    console.log('\n🎯 ROOT CAUSE ANALYSIS:');
    console.log('   - NFT Factory works fine with valid owner');
    console.log('   - MasterFactory should pass msg.sender as owner');
    console.log('   - But error shows zero address being passed');
    console.log('   - This suggests MasterFactory has a bug in parameter passing');
    
  } catch (error) {
    console.error('❌ Wallet check failed:', error.message);
  }
}

// Run the check
checkWalletIssue()
  .then(() => {
    console.log('\n🔎 WALLET ANALYSIS COMPLETE');
    console.log('💡 The issue is likely in MasterFactory contract logic, not the wallet');
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error.message);
  });
