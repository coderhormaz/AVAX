// AI ASSISTANT INTERFACE SUMMARY
// ================================

// DEPLOY ONCE: MasterFactory.sol
// No constructor parameters needed!

// FOR TOKEN CREATION:
// User Input: Name, Ticker, Supply
// AI Calls: createToken(name, ticker, supply)
// Example: createToken("GameCoin", "GAME", 1000000)

// FOR NFT CREATION:
// User Input: Name, Description (optional), Image Upload, Quantity (default: 1)
// AI Process: 
//   1. Upload image to IPFS
//   2. Call: createNFT(name, description, ipfsHash, quantity)
// Example: createNFT("My Art", "Cool artwork", "ipfs://QmHash123", 1)

// RETURNS:
// Token: contract address
// NFT: {contract address, array of token IDs}

contract MasterFactoryInterface {
    // Create Token - User gives: name, ticker, supply
    function createToken(string name, string ticker, uint256 supply) 
        returns (address tokenContract);
    
    // Create NFT(s) - User gives: name, description, uploads image, quantity
    function createNFT(string name, string description, string imageURI, uint256 quantity)
        returns (address nftContract, uint256[] tokenIds);
    
    // Get user's contracts
    function getUserContracts(address user) 
        returns (address[] tokens, address[] nfts);
}
