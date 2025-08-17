import { ethers } from 'ethers';

// Connect to Avalanche Mainnet
const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

const MASTER_FACTORY_ADDRESS = '0x56c4e87Efdfb11266D409c8d47F5E92A5F98Fc10';

// Minimal ABI to check if contract exists and has the method
const MINIMAL_ABI = [
  'function getSharedCollectionInfo() view returns (address, uint256)',
  'function sharedCollection() view returns (address)',
  'function totalNFTsInSharedCollection() view returns (uint256)'
];

async function checkContract() {
  try {
    console.log('🔍 Checking contract at:', MASTER_FACTORY_ADDRESS);
    
    // Check if contract exists
    const code = await provider.getCode(MASTER_FACTORY_ADDRESS);
    console.log('📦 Contract code length:', code.length);
    
    if (code === '0x') {
      console.log('❌ No contract found at this address!');
      return;
    }
    
    console.log('✅ Contract exists');
    
    // Try to interact with the contract
    const contract = new ethers.Contract(MASTER_FACTORY_ADDRESS, MINIMAL_ABI, provider);
    
    try {
      console.log('🔄 Trying getSharedCollectionInfo...');
      const info = await contract.getSharedCollectionInfo();
      console.log('✅ getSharedCollectionInfo result:', info);
    } catch (error) {
      console.log('❌ getSharedCollectionInfo failed:', error.message);
    }
    
    try {
      console.log('🔄 Trying sharedCollection...');
      const collection = await contract.sharedCollection();
      console.log('✅ sharedCollection result:', collection);
    } catch (error) {
      console.log('❌ sharedCollection failed:', error.message);
    }
    
    try {
      console.log('🔄 Trying totalNFTsInSharedCollection...');
      const total = await contract.totalNFTsInSharedCollection();
      console.log('✅ totalNFTsInSharedCollection result:', total.toString());
    } catch (error) {
      console.log('❌ totalNFTsInSharedCollection failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking contract:', error.message);
  }
}

checkContract();
