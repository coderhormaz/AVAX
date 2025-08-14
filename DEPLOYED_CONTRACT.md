# DEPLOYED CONTRACT INFORMATION

## MasterFactory Contract
**Address:** `0x5708fBd5178DD97AC90848de5800fF79b947051d`
**Network:** Avalanche (C-Chain)
**Deployment Date:** August 14, 2025

## AI Assistant Integration

### Contract Interface
```javascript
// MasterFactory ABI - Main functions for AI
const MASTER_FACTORY_ABI = [
  "function createToken(string memory name, string memory ticker, uint256 supply) public returns (address)",
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract, uint256[] memory tokenIds)",
  "function getUserContracts(address user) public view returns (address[] memory tokens, address[] memory nfts)"
];

const MASTER_FACTORY_ADDRESS = "0x5708fBd5178DD97AC90848de5800fF79b947051d";
```

### AI Usage Examples

#### Token Creation
```javascript
// User: "Create GameCoin token with ticker GAME and 1M supply"
const tx = await masterFactory.createToken("GameCoin", "GAME", 1000000);
const receipt = await tx.wait();
// Parse events to get deployed token address
```

#### NFT Creation
```javascript
// User uploads image, provides name "My Art" and description "Cool artwork"
// AI first uploads image to IPFS, gets hash: "QmAbc123..."
const tx = await masterFactory.createNFT("My Art", "Cool artwork", "ipfs://QmAbc123...", 1);
const receipt = await tx.wait();
// Parse events to get NFT contract and token IDs
```

### Integration Steps
1. ✅ **Contract Deployed:** 0x5708fBd5178DD97AC90848de5800fF79b947051d
2. ✅ **Update Frontend Config:** Add contract address to your app
3. ✅ **Test Functions:** Try creating a test token/NFT
4. ✅ **IPFS Integration:** Set up image upload for NFTs
5. ✅ **Production Ready:** AI can now deploy tokens and NFTs automatically

## Network Details
- **Chain ID:** 43114 (Avalanche Mainnet)
- **RPC URL:** https://api.avax.network/ext/bc/C/rpc
- **Explorer:** https://snowtrace.io/address/0x5708fBd5178DD97AC90848de5800fF79b947051d

## Gas Estimates
- Token Creation: ~0.01-0.02 AVAX
- NFT Creation: ~0.02-0.05 AVAX (depending on quantity)

Your AI assistant is now ready to deploy unlimited tokens and NFTs! 🚀
