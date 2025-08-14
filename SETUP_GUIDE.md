# 🚀 Avalanche AI Blockchain Assistant - Setup Guide

## ⚡ Quick Start

1. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your API keys (see instructions below)
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔑 Environment Configuration

After copying `.env.example` to `.env.local`, you need to fill in the following required values:

### Required API Keys

#### 1. Google Gemini AI API Key (Required for AI features)
1. Visit: https://ai.google.dev/
2. Click "Get API Key" 
3. Create a new project or select existing
4. Generate API key
5. Add to `.env.local`:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

#### 2. Lighthouse Storage API Key (Required for NFT uploads)
1. Visit: https://lighthouse.storage/
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Add to `.env.local`:
   ```
   VITE_LIGHTHOUSE_API_KEY=your_actual_lighthouse_key_here
   ```

### Optional Configuration

#### Alternative IPFS Provider (Pinata)
If you prefer Pinata over Lighthouse:
1. Visit: https://pinata.cloud/
2. Get your JWT token
3. Add to `.env.local`:
   ```
   VITE_PINATA_JWT=your_pinata_jwt_here
   ```

#### Network Selection
- For testing (default): `VITE_CURRENT_NETWORK=FUJI`
- For production: `VITE_CURRENT_NETWORK=MAINNET`

## 📝 Smart Contract Deployment

### Deploy via Remix IDE (Recommended)

1. **Open Remix**: Go to https://remix.ethereum.org/

2. **Create Contract Files**
   Copy contracts from the `contracts/` folder:
   - Create `CustomToken.sol` and paste the ERC20 token contract
   - Create `CustomNFT.sol` and paste the ERC721 NFT contract

3. **Compile Contracts**
   - Go to Solidity Compiler tab
   - Select version ^0.8.20
   - Compile both contracts

4. **Deploy to Avalanche**
   - Go to Deploy & Run tab
   - Connect MetaMask to Avalanche Fuji Testnet
   - Deploy `CustomNFT` contract with parameters:
     - `name`: "My NFT Collection"
     - `symbol`: "MNC"
     - `owner`: Your wallet address
     - `baseURI`: "https://gateway.lighthouse.storage/ipfs/"
   - Deploy `CustomToken` contract if needed

5. **Update Environment Variables**
   Add the deployed contract address to `.env.local`:
   ```
   VITE_MASTER_FACTORY_ADDRESS=0x16f048258Ec4B7cf2eDA358E83574D4aA74282Bb
   ```
   
   Note: The MasterFactory contract is already deployed on Avalanche Mainnet and configured in your system.

### MetaMask Network Setup

#### Add Avalanche Fuji Testnet
- **Network Name**: Avalanche Fuji Testnet
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Chain ID**: 43113
- **Currency Symbol**: AVAX
- **Block Explorer**: https://testnet.snowtrace.io

#### Add Avalanche Mainnet  
- **Network Name**: Avalanche Mainnet
- **RPC URL**: https://api.avax.network/ext/bc/C/rpc
- **Chain ID**: 43114
- **Currency Symbol**: AVAX
- **Block Explorer**: https://snowtrace.io

#### Get Test AVAX (Fuji Testnet)
- Visit: https://faucet.avax.network/
- Enter your wallet address
- Request test AVAX for testing

## 💰 Wallet Setup

1. **Open the app**: http://localhost:5174
2. **Connect Wallet**:
   - Option A: Enter your existing private key
   - Option B: Click "Generate New Wallet" for a fresh wallet
3. **Fund Wallet**: Send at least 0.01 AVAX to use AI features

## 🧪 Testing the Features

### 1. Send AVAX
Try these commands in the chat:
- "send 0.1 avax to 0x742d35Cc6634C0532925a3b8D99C4dE1e5c7Db8C"
- "transfer 1 AVAX to my friend 0xabc..."

### 2. Create Token (requires contract deployment)
- "create token called MyToken with symbol MTK"
- "deploy token Kings ticker KNG supply 10000"

### 3. Mint NFT (requires contract deployment)
- "mint nft"
- "create nft called My Art"

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚨 Security Reminders

- ⚠️ **Private keys are stored in your browser only**
- 🔒 **Never commit .env.local to version control**
- 🔑 **Never share your private key or API keys**
- 💾 **Keep secure backups of your keys**
- 🧪 **Use testnet for testing, small amounts on mainnet**

## 📁 File Structure

```
.env.example          # Template with all environment variables
.env.local           # Your actual config (create this, never commit)
src/config.ts        # Configuration loader using environment variables
contracts/           # Smart contracts for deployment
```

## 🆘 Troubleshooting

### Issue: "Environment variable not set" warnings
- **Solution**: Make sure `.env.local` exists and has the required variables

### Issue: "AI assistant not initialized"
- **Solution**: Add your Gemini API key to `.env.local`

### Issue: "NFT contract not configured"
- **Solution**: Deploy the NFT contract and add address to `.env.local`

### Issue: "Insufficient balance"
- **Solution**: Add more AVAX to your wallet

### Issue: Transaction fails
- **Check**: You have enough AVAX for gas fees (~0.001-0.01 AVAX)
- **Check**: Wallet is connected to correct network

## 🎯 Complete Setup Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Gemini API key to `.env.local`
- [ ] Add Lighthouse API key to `.env.local`
- [ ] Deploy smart contracts via Remix
- [ ] Add contract addresses to `.env.local`
- [ ] Fund wallet with test AVAX
- [ ] Test all features

## 🎉 You're All Set!

Your Avalanche AI Blockchain Assistant is ready! The app combines AI with blockchain functionality in a secure, modern interface.

**Happy blockchain building!** 🚀
