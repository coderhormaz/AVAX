// Calculate new gas cost with reduced settings
import { ethers } from 'ethers';

async function calculateNewGasCost() {
  console.log('💰 Calculating new gas cost with reduced settings...');
  
  // New settings
  const gasLimit = 1000000; // 1M gas limit
  const gasPrice = ethers.parseUnits('1', 'gwei'); // 1 nAVAX (reduced from 3)
  
  const gasCostWei = BigInt(gasLimit) * gasPrice;
  const gasCostAVAX = ethers.formatEther(gasCostWei);
  const gasCostUSD = parseFloat(gasCostAVAX) * 30; // Assuming $30 AVAX
  
  console.log('📊 NEW Gas Cost Calculation:');
  console.log(`   Gas Limit: ${gasLimit.toLocaleString()}`);
  console.log(`   Gas Price: 1 nAVAX (${ethers.formatUnits(gasPrice, 'gwei')} gwei)`);
  console.log(`   Total Cost: ${gasCostAVAX} AVAX ($${gasCostUSD.toFixed(4)})`);
  
  // Compare with wallet balance
  const walletBalance = 0.009330686015107833; // From previous check
  const remainingBalance = walletBalance - parseFloat(gasCostAVAX);
  
  console.log('\n💰 Wallet Balance Analysis:');
  console.log(`   Current Balance: ${walletBalance} AVAX`);
  console.log(`   Gas Cost: ${gasCostAVAX} AVAX`);
  console.log(`   Remaining After TX: ${remainingBalance.toFixed(6)} AVAX`);
  
  if (remainingBalance > 0) {
    console.log('✅ Transaction should succeed with new gas settings!');
  } else {
    console.log('❌ Still insufficient funds even with reduced gas');
  }
  
  console.log('\n🎯 FIXES APPLIED:');
  console.log('1. ✅ Reduced gas price from 3 to 1 nAVAX (66% cost reduction)');
  console.log('2. ✅ Added balance check before deployment');
  console.log('3. ✅ Fixed imageURI vs metadataURI issue');
  console.log('4. ✅ Clear error message if insufficient funds');
}

calculateNewGasCost();
