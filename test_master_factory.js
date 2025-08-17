import { ethers } from 'ethers';

async function testMasterFactory() {
  try {
    // Connect to Avalanche mainnet
    const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    
    const masterFactoryAddress = '0x5708fBd5178DD97AC90848de5800fF79b947051d';
    
    // Check if contract exists
    const code = await provider.getCode(masterFactoryAddress);
    console.log('Contract code length:', code.length);
    
    if (code === '0x') {
      console.log('❌ MasterFactory contract not deployed at this address!');
      return;
    }
    
    console.log('✅ MasterFactory contract exists');
    
    // Try to call a view function
    const masterFactoryABI = [
      "function tokenFactory() public view returns (address)",
      "function nftFactory() public view returns (address)"
    ];
    
    const contract = new ethers.Contract(masterFactoryAddress, masterFactoryABI, provider);
    
    try {
      const tokenFactory = await contract.tokenFactory();
      console.log('Token Factory:', tokenFactory);
      
      const nftFactory = await contract.nftFactory();
      console.log('NFT Factory:', nftFactory);
      
      console.log('✅ MasterFactory contract is working');
    } catch (error) {
      console.log('❌ Error calling contract functions:', error.message);
    }
    
  } catch (error) {
    console.error('Error testing MasterFactory:', error);
  }
}

testMasterFactory();
