# AI Assistant Smart Contract Deployment Guide

## Problem Solved
The original `CustomToken.sol` and `CustomNFT.sol` contracts required manual constructor parameter input during deployment. Now we have factory contracts that allow the AI to deploy tokens and NFTs automatically with user-provided information.

## Solution: Factory Contract Architecture

### 1. MasterFactory.sol (Main Contract for AI)
**Deploy this contract first - the AI only needs to interact with this one contract!**

#### For Tokens:
```solidity
// Simple token deployment (18 decimals)
createTokenSimple("My Token", "MTK", 1000000)

// Custom token deployment  
createToken("My Token", "MTK", 1000000, 18)
```

#### For NFTs:
```solidity
// Simple NFT deployment (default IPFS URI)
createNFTSimple("My NFT Collection", "MNC")

// Custom NFT deployment
createNFT("My NFT Collection", "MNC", "https://ipfs.io/ipfs/your-hash/")
```

## How AI Assistant Should Use This:

### Step 1: Deploy MasterFactory
1. Deploy `MasterFactory.sol` contract once
2. Save the deployed address for future use

### Step 2: Create Tokens/NFTs for Users
When a user requests token/NFT creation, call the appropriate function on MasterFactory:

**For ERC20 Tokens:**
- `createTokenSimple(name, symbol, supply)` - Most common use case
- `createToken(name, symbol, supply, decimals)` - For custom decimals

**For NFT Collections:**
- `createNFTSimple(name, symbol)` - Uses default IPFS URI pattern
- `createNFT(name, symbol, baseURI)` - For custom metadata URI

## Example AI Workflows:

### User Says: "Create a token called 'MyToken' with symbol 'MTK' and 1 million supply"
```javascript
// AI calls MasterFactory.createTokenSimple("MyToken", "MTK", 1000000)
// Returns deployed token contract address
```

### User Says: "Create an NFT collection called 'My Art' with symbol 'ART'"
```javascript
// AI calls MasterFactory.createNFTSimple("My Art", "ART")  
// Returns deployed NFT contract address
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
