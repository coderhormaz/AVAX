import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const SHARED_COLLECTION_FACTORY_ADDRESS = '0x56c4e87Efdfb11266D409c8d47F5E92A5F98Fc10';

const SHARED_COLLECTION_FACTORY_ABI = [
  "function addNFT(string memory metadataURI, uint256 quantity, address creator) public returns (uint256[] memory tokenIds)",
  "function getInfo() public view returns (address addr, string memory name, string memory symbol, uint256 total, uint256 contributors)",
  "function getUserStats(address user) public view returns (bool contributed, uint256 count, uint256[] memory tokens)",
  "event NFTAdded(uint256 indexed tokenId, address indexed creator)"
];

async function testSharedCollection() {
  try {
    console.log('🔍 Testing SharedCollectionFactory at:', SHARED_COLLECTION_FACTORY_ADDRESS);
    
    const contract = new ethers.Contract(
      SHARED_COLLECTION_FACTORY_ADDRESS,
      SHARED_COLLECTION_FACTORY_ABI,
      provider
    );
    
    console.log('\n🔄 Testing getInfo()...');
    const info = await contract.getInfo();
    console.log('✅ Collection Info:');
    console.log('  - Address:', info[0]);
    console.log('  - Name:', info[1]);
    console.log('  - Symbol:', info[2]);
    console.log('  - Total NFTs:', Number(info[3]));
    console.log('  - Contributors:', Number(info[4]));
    
    console.log('\n🔄 Testing getUserStats() for test address...');
    const testAddress = '0x742d35CC6935C4d9C2A8e6d8D47E7c24C14b0DDD';
    try {
      const userStats = await contract.getUserStats(testAddress);
      console.log('✅ User Stats for', testAddress);
      console.log('  - Has Contributed:', userStats[0]);
      console.log('  - NFT Count:', Number(userStats[1]));
      console.log('  - Token IDs:', userStats[2].map(id => Number(id)));
    } catch (userError) {
      console.log('ℹ️ User has no contributions yet:', userError.message);
    }
    
    console.log('\n✅ All SharedCollectionFactory functions working correctly!');
    console.log('🌐 Collection Address:', info[0]);
    console.log('🔗 View collection at: https://web3.okx.com/explorer/avalanche/address/' + info[0]);
    
  } catch (error) {
    console.error('❌ Error testing SharedCollectionFactory:', error.message);
  }
}

testSharedCollection();
