import { ethers } from 'ethers';

async function checkNFTDeployments() {
  try {
    const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    const masterFactoryAddress = '0x5708fBd5178DD97AC90848de5800fF79b947051d';
    const userAddress = '0x61505ED189E71809dbA2349D0222d511EeFCE6Bd';
    
    // MasterFactory ABI with events
    const masterFactoryABI = [
      "function getUserContracts(address user) public view returns (address[] memory tokens, address[] memory nfts)",
      "event NFTCreated(address indexed user, address indexed nftContract, string name, uint256 quantity)"
    ];
    
    const contract = new ethers.Contract(masterFactoryAddress, masterFactoryABI, provider);
    
    console.log('🎨 Checking NFT deployments for:', userAddress);
    
    try {
      // Get user's deployed contracts
      const [tokens, nfts] = await contract.getUserContracts(userAddress);
      
      console.log('📊 Summary:');
      console.log('🪙 Tokens deployed:', tokens.length);
      console.log('🖼️ NFTs deployed:', nfts.length);
      
      if (nfts.length > 0) {
        console.log('\n🎉 NFT Contracts Found:');
        nfts.forEach((nftAddress, index) => {
          console.log(`${index + 1}. NFT Contract: ${nftAddress}`);
          console.log(`   Explorer: https://web3.okx.com/explorer/avalanche/address/${nftAddress}`);
        });
        
        // Get the latest NFT (last in array)
        const latestNFT = nfts[nfts.length - 1];
        console.log(`\n🎯 Your Latest NFT: ${latestNFT}`);
        console.log(`🔗 View on Explorer: https://web3.okx.com/explorer/avalanche/address/${latestNFT}`);
      } else {
        console.log('\n❓ No NFTs found. This could mean:');
        console.log('1. The deployment is still processing');
        console.log('2. The transaction failed');
        console.log('3. There was an issue with the contract call');
      }
      
    } catch (error) {
      console.error('Error getting user contracts:', error.message);
    }
    
  } catch (error) {
    console.error('Error checking NFT deployments:', error);
  }
}

checkNFTDeployments();
