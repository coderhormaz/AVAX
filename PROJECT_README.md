# Avalanche AI Blockchain Assistant

A fully functional, browser-only React application that combines AI-powered natural language processing with blockchain functionality on the Avalanche network. Users can interact with the blockchain through simple chat commands powered by Google's Gemini 2.0 Flash AI model.

## Features

### 🤖 AI-Powered Blockchain Interactions
- Natural language commands for blockchain operations
- Google Gemini 2.0 Flash integration
- Smart command parsing and parameter validation
- Interactive chat interface with transaction confirmations

### 💰 Wallet Functionality
- Browser-only wallet creation and management
- Private key storage in localStorage (secure, never sent to servers)
- Real-time AVAX balance fetching from blockchain
- QR code generation for easy deposits
- Support for both Avalanche Mainnet and Fuji Testnet

### 🔗 Blockchain Operations

#### Send AVAX
- Natural language: "send 5 avax to 0x123..."
- Real-time balance validation
- Transaction confirmation with gas estimation
- Explorer link integration

#### Create ERC20 Tokens
- Command: "create token called MyToken with symbol MTK"
- Configurable name, symbol, supply, and decimals
- Automatic contract deployment
- Full ERC20 compliance with mint/burn functions

#### Mint NFTs
- Command: "mint nft" or "create nft called My Art"
- Image upload to IPFS (Lighthouse storage)
- Metadata generation and storage
- ERC721 compliance with batch minting support

### 🎨 Modern UI/UX
- Clean, responsive design with Tailwind CSS
- Two-panel layout: Chat history + Active chat
- Real-time message updates with typing indicators
- Mobile-friendly responsive design
- Avalanche brand colors and styling

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React QR Code** for QR generation

### Blockchain
- **ethers.js v6** for blockchain interactions
- **Avalanche C-Chain** (Mainnet/Fuji)
- **Custom ERC20/ERC721 contracts** deployable via Remix

### AI & Storage
- **Google Generative AI** (Gemini 2.0 Flash)
- **Lighthouse Storage** for IPFS uploads
- **Pinata** as alternative IPFS provider

### Development
- **Vite** for fast development and building
- **TypeScript** for type safety
- **PostCSS** for CSS processing

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Edit `src/config.ts` and add your API keys:

```typescript
export const CONFIG = {
  AI: {
    GEMINI_API_KEY: 'your-gemini-api-key-here',
  },
  STORAGE: {
    LIGHTHOUSE_API_KEY: 'your-lighthouse-api-key-here',
    // or
    PINATA_JWT: 'your-pinata-jwt-here'
  }
};
```

### 3. Deploy Smart Contracts

#### Using Remix IDE:
1. Open https://remix.ethereum.org/
2. Copy contracts from `/contracts` folder:
   - `CustomToken.sol` - ERC20 token contract
   - `CustomNFT.sol` - ERC721 NFT contract
3. Compile with Solidity ^0.8.20
4. Deploy to Avalanche network (connect MetaMask)
5. Update contract addresses in `src/config.ts`

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Usage Examples

### AI Commands

#### Send AVAX:
```
"send 5 avax to 0x742d35Cc6634C0532925a3b8D99C4dE1e5c7Db8C"
"transfer 0.1 AVAX to my friend 0xabc..."
```

#### Create Token:
```
"create token called MyToken with symbol MTK"
"deploy token Kings ticker KNG supply 10000 decimals 18"
```

#### Mint NFT:
```
"mint nft"
"create nft called My Artwork"
```

## Security Features

- **Browser-only**: No backend servers, all operations client-side
- **Local storage**: Private keys never leave your browser
- **Network validation**: All transactions verified before execution  
- **Gas estimation**: Real-time fee calculation
- **Error handling**: Comprehensive error messages and recovery

## Network Support

### Avalanche Fuji Testnet (Default)
- Chain ID: 43113
- RPC: https://api.avax-test.network/ext/bc/C/rpc
- Explorer: https://testnet.snowtrace.io
- Faucet: https://faucet.avax.network/

### Avalanche Mainnet
- Chain ID: 43114  
- RPC: https://api.avax.network/ext/bc/C/rpc
- Explorer: https://snowtrace.io

---

**⚠️ Security Notice:** This application stores private keys in browser localStorage. Never share your private keys and always keep secure backups. Use testnet for development and small amounts on mainnet.
