# 🌟 Avalanche AI Blockchain Assistant

A powerful, browser-based React application that combines artificial intelligence with blockchain functionality on the Avalanche network. Chat with an AI assistant to send AVAX, create tokens, mint NFTs, and more!

## ✨ Features

- 🤖 **AI-Powered Chat Interface** - Natural language blockchain commands
- 💰 **AVAX Transactions** - Send and receive AVAX with simple commands
- 🪙 **Token Creation** - Deploy custom ERC20 tokens via chat
- 🖼️ **NFT Minting** - Create and mint NFTs with IPFS storage
- 🔐 **Secure Wallet Management** - Browser-only private key storage
- 🌐 **Multi-Network Support** - Avalanche Mainnet and Fuji Testnet
- 📱 **Responsive Design** - Modern UI with TailwindCSS

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd AVAX
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit with your API keys
   nano .env.local
   ```

3. **Configure Required API Keys**
   - **Gemini AI**: Get API key from https://ai.google.dev/
   - **Lighthouse IPFS**: Get API key from https://lighthouse.storage/
   
   Add to `.env.local`:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:5174
   - Connect or create a wallet
   - Start chatting with the AI!

## 📋 Environment Variables

All configuration is handled through environment variables. Copy `.env.example` to `.env.local` and configure:

### Required Variables
```env
# AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Storage Configuration (for NFTs)
VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
```

### Optional Variables
```env
# Network Selection (FUJI or MAINNET)
VITE_CURRENT_NETWORK=FUJI

# Contract Addresses (set after deployment)
VITE_MASTER_FACTORY_ADDRESS=0x16f048258Ec4B7cf2eDA358E83574D4aA74282Bb

# Alternative IPFS Provider
VITE_PINATA_JWT=your_pinata_jwt

# Custom RPC URLs
VITE_MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc
VITE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Wallet Configuration
VITE_MIN_AVAX_BALANCE=0.01
VITE_WALLET_STORAGE_KEY=avax_wallet_key
```

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Blockchain**: ethers.js v6 + Avalanche Network
- **AI**: Google Generative AI (Gemini 2.0 Flash)
- **Storage**: Lighthouse IPFS / Pinata
- **Build**: Vite + PostCSS

## 🤖 AI Commands

The AI understands natural language commands:

### AVAX Transactions
- "send 0.5 avax to 0x742d35Cc6634C0532925a3b8D99C4dE1e5c7Db8C"
- "transfer 1 AVAX to my friend"
- "what's my balance?"

### Token Creation
- "create token called MyToken with symbol MTK"
- "deploy token Kings ticker KNG supply 10000"
- "make a new cryptocurrency"

### NFT Minting
- "mint nft called My Artwork"
- "create nft with description Beautiful sunset"
- "mint collectible"

## 📝 Smart Contract Deployment

1. **Open Remix IDE**: https://remix.ethereum.org/
2. **Copy Contracts**: Use contracts from `/contracts/` folder
3. **Compile**: Set Solidity version to ^0.8.20
4. **Deploy**: Connect MetaMask to Avalanche network
5. **Update Config**: Add contract addresses to `.env.local`

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

## 🔒 Security

- 🔐 **Private keys stored locally** - Never leaves your browser
- 🌐 **No backend required** - Fully client-side application
- 🔑 **Environment-based secrets** - API keys in `.env.local`
- 🚫 **No data collection** - Complete privacy

## 📱 Responsive Design

- 💻 **Desktop**: Two-column layout with chat and wallet info
- 📱 **Mobile**: Stacked layout with collapsible sections
- 🎨 **Modern UI**: Clean design with smooth animations

## 🧪 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Network Support

### Avalanche Fuji Testnet (Default)
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Faucet**: https://faucet.avax.network/
- **Explorer**: https://testnet.snowtrace.io

### Avalanche Mainnet
- **Chain ID**: 43114
- **RPC URL**: https://api.avax.network/ext/bc/C/rpc
- **Explorer**: https://snowtrace.io

## 📁 Project Structure

```
AVAX/
├── src/
│   ├── components/        # React components
│   ├── utils/            # Utility functions
│   │   ├── wallet.ts     # Wallet operations
│   │   ├── blockchain.ts # Blockchain transactions
│   │   ├── ai.ts         # AI integration
│   │   └── storage.ts    # IPFS storage
│   ├── config.ts         # Environment configuration
│   └── App.tsx           # Main application
├── contracts/            # Smart contracts
├── .env.example          # Environment template
└── SETUP_GUIDE.md       # Detailed setup guide
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- 📖 **Documentation**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 🐛 **Issues**: Create an issue on GitHub
- 💬 **Questions**: Start a discussion

## 🎉 Acknowledgments

- **Avalanche** - For the robust blockchain infrastructure
- **Google AI** - For the powerful Gemini API
- **Lighthouse** - For decentralized IPFS storage
- **ethers.js** - For the excellent Web3 library

---

**Happy Blockchain Building!** 🚀

Made with ❤️ for the Avalanche ecosystem
