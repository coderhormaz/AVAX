# AI Assistant Smart Contract Deployment Guide

## Problem Solved
The original `CustomToken.sol` and `CustomNFT.sol` contracts required manual constructor parameter input during deployment. Now we have factory contracts that allow the AI to deploy tokens and NFTs automatically with user-provided information.

## Solution: Factory Contract Architecture

### 1. MasterFactory.sol (Main Contract for AI)
**Deploy this contract first - the AI only needs to interact with this one contract!**

#### For Token Creation:
User provides: **Name, Ticker, Supply**
```solidity
// Example: User says "Create token MyToken with ticker MTK and 1M supply"
createToken("MyToken", "MTK", 1000000)
```

#### For NFT Creation:
User provides: **Name, Description (optional), Image Upload, Quantity (default: 1)**
```solidity
// Example: User uploads image, provides name and description
createNFT("My Cool Art", "This is my awesome artwork", "ipfs://QmHash...", 1)
```

## How AI Assistant Should Use This:

### Step 1: Deploy MasterFactory
1. Deploy `MasterFactory.sol` contract once
2. Save the deployed address for future use

### Step 2: Handle User Inputs

**For Token Creation:**
- User Input: Name, Ticker, Supply
- AI Action: `masterFactory.createToken(name, ticker, supply)`
- Returns: Token contract address

**For NFT Creation:**
- User Input: Name, Description (optional), Image file, Quantity (optional, default 1)
- AI Process:
  1. Upload image to IPFS
  2. Get IPFS hash
  3. Call `masterFactory.createNFT(name, description, ipfsHash, quantity)`
- Returns: NFT contract address and array of minted token IDs

## Example AI Workflows:

### User Says: "Create a token called 'GameCoin' with ticker 'GAME' and 500,000 supply"
```javascript
// AI calls:
masterFactory.createToken("GameCoin", "GAME", 500000)
// Returns: deployed token contract address
```

### User Uploads Image and Says: "Create NFT called 'My Art' with description 'Beautiful sunset'"
```javascript
// AI process:
// 1. Upload image to IPFS -> gets hash "QmAbc123..."
// 2. Call contract:
masterFactory.createNFT("My Art", "Beautiful sunset", "ipfs://QmAbc123...", 1)
// Returns: {nftContract: "0x...", tokenIds: [1]}
```

### User Says: "Create 5 NFTs called 'Collection Item'" (uploads image)
```javascript
// AI process:
// 1. Upload image to IPFS -> gets hash "QmXyz789..."
// 2. Call contract:
masterFactory.createNFT("Collection Item", "", "ipfs://QmXyz789...", 5)
// Returns: {nftContract: "0x...", tokenIds: [1,2,3,4,5]}
```

## Benefits:
- ✅ **No Manual Input Required**: AI can fill all parameters programmatically
- ✅ **User-Friendly**: Simple function calls with intuitive parameters
- ✅ **Automatic Ownership**: User becomes owner of deployed contracts
- ✅ **Tracking**: All deployed contracts are tracked by owner
- ✅ **Gas Efficient**: Optimized deployment process
- ✅ **Flexible**: Supports both simple and advanced use cases

## Contract Addresses After Deployment:
1. **MasterFactory**: `[DEPLOYED_ADDRESS]` - Main contract for AI
2. **TokenFactory**: Auto-deployed by MasterFactory
3. **NFTFactory**: Auto-deployed by MasterFactory

## User's Contracts:
- Each user becomes the owner of their deployed tokens/NFTs
- Users can mint, burn, and manage their contracts normally
- AI can query `getUserContracts(userAddress)` to see all user's contracts
