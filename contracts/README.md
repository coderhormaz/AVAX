# Smart Contracts for Avalanche AI Assistant

This directory contains the smart contracts used by the AI assistant to deploy tokens and NFTs on the Avalanche network.

## Contracts

### 1. CustomToken.sol
- **Purpose**: ERC20 token contract for creating custom tokens
- **Features**: 
  - Configurable name, symbol, supply, and decimals
  - Mintable by owner
  - Burnable tokens
  - Full ERC20 compliance

### 2. CustomNFT.sol
- **Purpose**: ERC721 NFT contract for minting NFTs
- **Features**:
  - Configurable collection name and symbol
  - Individual and batch minting
  - URI storage for metadata
  - Creator tracking
  - Full ERC721 compliance

## Deployment Instructions

### Using Remix IDE

1. **Open Remix**: Go to https://remix.ethereum.org/

2. **Create Workspace**: 
   - Click "Create" and select "Default"
   - Name your workspace (e.g., "AVAX-Contracts")

3. **Upload Contracts**:
   - Copy the contents of `CustomToken.sol` and `CustomNFT.sol`
   - Create new files in Remix and paste the code

4. **Install Dependencies**:
   - In Remix, the OpenZeppelin contracts will be automatically imported
   - If there are issues, manually install: `@openzeppelin/contracts`

5. **Compile Contracts**:
   - Go to the "Solidity Compiler" tab
   - Select compiler version `0.8.20` or higher
   - Click "Compile"

6. **Deploy to Avalanche**:
   - Go to "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask" as environment
   - Make sure MetaMask is connected to Avalanche network
   - Select the contract you want to deploy
   - Fill in constructor parameters:

#### CustomToken Constructor Parameters:
- `name`: Token name (e.g., "My Token")
- `symbol`: Token symbol (e.g., "MTK")
- `initialSupply`: Initial supply without decimals (e.g., 1000000)
- `decimals_`: Number of decimals (usually 18)
- `owner`: Your wallet address

#### CustomNFT Constructor Parameters:
- `name`: NFT collection name (e.g., "My NFT Collection")
- `symbol`: NFT symbol (e.g., "MNFT")
- `owner`: Your wallet address
- `baseURI`: Base URI for metadata (e.g., "https://gateway.lighthouse.storage/ipfs/")

7. **Get Contract Addresses**:
   - After deployment, copy the contract addresses
   - Update the `CONFIG.CONTRACTS` section in `src/config.ts`

## Network Configuration

### Avalanche Mainnet
- Chain ID: 43114
- RPC URL: https://api.avax.network/ext/bc/C/rpc
- Explorer: https://snowtrace.io

### Avalanche Fuji Testnet
- Chain ID: 43113
- RPC URL: https://api.avax-test.network/ext/bc/C/rpc
- Explorer: https://testnet.snowtrace.io

## Gas Considerations

- Token deployment: ~0.01-0.02 AVAX
- NFT deployment: ~0.02-0.03 AVAX
- Token minting: ~0.001 AVAX
- NFT minting: ~0.002-0.005 AVAX

Make sure you have sufficient AVAX in your wallet for deployment and transactions.
