import { ethers } from 'ethers';

async function checkRecentTransactions() {
  try {
    // Connect to Avalanche mainnet
    const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    
    // Your wallet address (replace with actual address if different)
    const walletAddress = '0x61505ED189E71809dbA2349D0222d511EeFCE6Bd';
    
    console.log('🔍 Checking recent transactions for:', walletAddress);
    
    // Get current balance
    const balance = await provider.getBalance(walletAddress);
    console.log('💰 Current AVAX balance:', ethers.formatEther(balance), 'AVAX');
    
    // Get recent block number
    const currentBlock = await provider.getBlockNumber();
    console.log('📦 Current block:', currentBlock);
    
    // Check last few blocks for transactions from this address
    for (let i = 0; i < 10; i++) {
      const blockNumber = currentBlock - i;
      try {
        const block = await provider.getBlock(blockNumber, true);
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (tx.from?.toLowerCase() === walletAddress.toLowerCase()) {
              console.log(`\n✅ Found transaction in block ${blockNumber}:`);
              console.log('📧 Hash:', tx.hash);
              console.log('💸 Value:', ethers.formatEther(tx.value || 0), 'AVAX');
              console.log('⛽ Gas Used:', tx.gasLimit?.toString());
              console.log('🎯 To:', tx.to);
              
              // Get transaction receipt for more details
              try {
                const receipt = await provider.getTransactionReceipt(tx.hash);
                if (receipt) {
                  console.log('📜 Status:', receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED');
                  console.log('⛽ Gas Used:', receipt.gasUsed.toString());
                  
                  if (receipt.logs && receipt.logs.length > 0) {
                    console.log('📝 Events/Logs:', receipt.logs.length);
                    // If this was an NFT deployment, there should be contract creation or events
                    if (receipt.contractAddress) {
                      console.log('🏭 Contract Created:', receipt.contractAddress);
                    }
                  }
                }
              } catch (e) {
                console.log('Could not get receipt for', tx.hash);
              }
            }
          }
        }
      } catch (e) {
        // Skip blocks that can't be fetched
      }
    }
    
  } catch (error) {
    console.error('Error checking transactions:', error);
  }
}

checkRecentTransactions();
