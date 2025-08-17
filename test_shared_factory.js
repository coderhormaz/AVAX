import { ethers } from 'ethers';

// Test the SharedCollectionFactory functions
const CONFIG = {
  CONTRACTS: {
    MASTER_FACTORY: '0x56c4e87Efdfb11266D409c8d47F5E92A5F98Fc10'
  },
  NETWORK: {
    MAINNET: {
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
    }
  }
};

const SHARED_COLLECTION_FACTORY_ABI = [
  "function addNFT(string memory metadataURI, uint256 quantity, address creator) public returns (uint256[] memory tokenIds)",
  "function getInfo() public view returns (address addr, string memory name, string memory symbol, uint256 total, uint256 contributors)",
  "function getUserStats(address user) public view returns (bool contributed, uint256 count, uint256[] memory tokens)",
  "event NFTAdded(uint256 indexed tokenId, address indexed creator)"
];

async function testSharedCollectionFactory() {
  try {
    console.log('🔍 Testing SharedCollectionFactory functions...');
    
    const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
    const contract = new ethers.Contract(
      CONFIG.CONTRACTS.MASTER_FACTORY,
      SHARED_COLLECTION_FACTORY_ABI,
      provider
    );
    
    // Test getInfo function
    console.log('📋 Testing getInfo()...');
    const info = await contract.getInfo();
    console.log('✅ getInfo result:', {
      address: info[0],
      name: info[1],
      symbol: info[2],
      total: Number(info[3]),
      contributors: Number(info[4])
    });
    
    // Test getUserStats function with a test address (proper checksum)
    const testAddress = ethers.getAddress('0x742d35cc6694c96c2d6b69e1f90e5a28c20da1d0');
    console.log('👤 Testing getUserStats()...');
    const userStats = await contract.getUserStats(testAddress);
    console.log('✅ getUserStats result:', {
      contributed: userStats[0],
      count: Number(userStats[1]),
      tokens: userStats[2].map(id => Number(id))
    });
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  }
}

testSharedCollectionFactory();
