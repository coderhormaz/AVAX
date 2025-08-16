// MasterFactory Contract Call Guide
// Address: 0x5708fBd5178DD97AC90848de5800fF79b947051d (Avalanche Mainnet)

/**
 * TOKEN CREATION
 * Function: createToken(string name, string ticker, uint256 supply)
 * Returns: address (new token contract address)
 */

// Example Call:
const tokenAddress = await masterFactory.createToken(
  "My Awesome Token",  // Token name
  "MAT",              // Token symbol/ticker  
  1000000             // Total supply (no decimals needed - contract handles 18 decimals)
);

/**
 * NFT CREATION
 * Function: createNFT(string nftName, string description, string imageURI, uint256 quantity)
 * Returns: address (new NFT contract address)
 */

// Example Call:
const nftAddress = await masterFactory.createNFT(
  "My Cool NFT",                           // NFT collection name
  "A description of my awesome NFT",       // Description
  "ipfs://QmYourImageHashHere",            // IPFS image URI
  1                                        // Quantity (currently supports 1)
);

/**
 * GET USER CONTRACTS
 * Function: getUserContracts(address user)
 * Returns: (address[] tokens, address[] nfts)
 */

// Example Call:
const [userTokens, userNFTs] = await masterFactory.getUserContracts(userAddress);

/**
 * GAS SETTINGS FOR AVALANCHE
 * Recommended settings for your calls:
 */
const gasOptions = {
  gasLimit: 500000,                           // 500K for tokens
  gasPrice: ethers.parseUnits('25', 'gwei')   // 25 nAVAX
};

// For NFTs use higher gas:
const nftGasOptions = {
  gasLimit: 700000,                           // 700K for NFTs
  gasPrice: ethers.parseUnits('25', 'gwei')   // 25 nAVAX
};
