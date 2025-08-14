// Web3 Integration for Token and NFT Deployment
// This file handles all blockchain interactions

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

// Contract ABIs
const MASTER_FACTORY_ABI = [
  "function createToken(string memory name, string memory ticker, uint256 supply) public returns (address)",
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract, uint256[] memory tokenIds)",
  "function getUserContracts(address user) public view returns (address[] memory tokens, address[] memory nfts)",
  "function getFactories() public view returns (address, address)",
  "event TokenDeployed(address indexed tokenAddress, address indexed owner, string name, string symbol, uint256 initialSupply, uint8 decimals)",
  "event NFTDeployed(address indexed nftAddress, address indexed owner, string name, string symbol, string baseURI)"
];

const ERC20_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function mint(address to, uint256 amount) public",
  "function burn(uint256 amount) public"
];

const ERC721_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function mint(address to, string memory uri) public returns (uint256)",
  "function batchMint(address to, string[] memory tokenURIs, uint256 quantity) public"
];

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private masterFactory: ethers.Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  // Initialize Web3 provider
  async initializeProvider() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.masterFactory = new ethers.Contract(
        CONFIG.CONTRACTS.MASTER_FACTORY,
        MASTER_FACTORY_ABI,
        this.signer
      );
    } else {
      throw new Error('MetaMask not found. Please install MetaMask.');
    }
  }

  // Connect wallet
  async connectWallet() {
    if (!this.provider) await this.initializeProvider();
    
    if (!window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask.');
    }
    
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = await this.signer!.getAddress();
      const balance = await this.provider!.getBalance(address);
      
      return {
        address,
        balance: ethers.formatEther(balance)
      };
    } catch (error: unknown) {
      throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Switch to Avalanche network
  async switchToAvalanche() {
    if (!window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask.');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA86A' }], // 43114 in hex
      });
    } catch (switchError: any) {
      // Network not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xA86A',
            chainName: 'Avalanche Network',
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            nativeCurrency: {
              name: 'AVAX',
              symbol: 'AVAX',
              decimals: 18
            },
            blockExplorerUrls: ['https://snowtrace.io/']
          }]
        });
      } else {
        throw switchError;
      }
    }
  }

  // Create Token
  async createToken(name: string, ticker: string, supply: number) {
    if (!this.masterFactory) throw new Error('Contract not initialized');

    try {
      console.log(`Creating token: ${name} (${ticker}) with supply ${supply}`);
      
      // Optimized gas settings for Avalanche
      const gasOptions = {
        gasLimit: 500000, // Reduced from default to ~500K gas
        gasPrice: ethers.parseUnits('25', 'gwei') // 25 nAVAX gas price
      };
      
      const tx = await this.masterFactory.createToken(name, ticker, supply, gasOptions);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Parse events to get token address
      const tokenDeployedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'TokenDeployed'
      );
      
      if (tokenDeployedEvent) {
        const tokenAddress = tokenDeployedEvent.args[0];
        return {
          success: true,
          tokenAddress,
          transactionHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString()
        };
      } else {
        throw new Error('Token deployment event not found');
      }
    } catch (error: unknown) {
      console.error('Token creation error:', error);
      throw new Error(`Failed to create token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Create NFT
  async createNFT(name: string, description: string, imageURI: string, quantity: number = 1) {
    if (!this.masterFactory) throw new Error('Contract not initialized');

    try {
      console.log(`Creating NFT: ${name} with quantity ${quantity}`);
      
      // Optimized gas settings for Avalanche
      const gasOptions = {
        gasLimit: 700000, // Reduced gas limit for NFT creation
        gasPrice: ethers.parseUnits('25', 'gwei') // 25 nAVAX gas price
      };
      
      const tx = await this.masterFactory.createNFT(name, description, imageURI, quantity, gasOptions);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Parse events to get NFT contract and token IDs
      const nftDeployedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'NFTDeployed'
      );
      
      if (nftDeployedEvent) {
        const nftContract = nftDeployedEvent.args[0];
        return {
          success: true,
          nftContract,
          tokenIds: Array.from({length: quantity}, (_, i) => i + 1), // Token IDs start from 1
          transactionHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString()
        };
      } else {
        throw new Error('NFT deployment event not found');
      }
    } catch (error: unknown) {
      console.error('NFT creation error:', error);
      throw new Error(`Failed to create NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get user's deployed contracts
  async getUserContracts(userAddress: string) {
    if (!this.masterFactory) throw new Error('Contract not initialized');

    try {
      const [tokens, nfts] = await this.masterFactory.getUserContracts(userAddress);
      return { tokens, nfts };
    } catch (error: unknown) {
      throw new Error(`Failed to get user contracts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get token details
  async getTokenDetails(tokenAddress: string) {
    if (!this.provider) throw new Error('Provider not initialized');

    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    } catch (error: unknown) {
      throw new Error(`Failed to get token details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get NFT details
  async getNFTDetails(nftAddress: string) {
    if (!this.provider) throw new Error('Provider not initialized');

    try {
      const nftContract = new ethers.Contract(nftAddress, ERC721_ABI, this.provider);
      
      const [name, symbol] = await Promise.all([
        nftContract.name(),
        nftContract.symbol()
      ]);

      let totalSupply = '0';
      try {
        totalSupply = (await nftContract.totalSupply()).toString();
      } catch (e) {
        // Some NFT contracts don't have totalSupply
        console.warn('NFT contract does not have totalSupply function');
      }

      return {
        address: nftAddress,
        name,
        symbol,
        totalSupply
      };
    } catch (error: unknown) {
      throw new Error(`Failed to get NFT details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Upload to IPFS (placeholder - implement with your preferred IPFS service)
  async uploadToIPFS(file: File) {
    // This is a placeholder - implement with Pinata, Lighthouse, or other IPFS service
    console.log('Uploading to IPFS:', file.name);
    
    // Example with Pinata (you'll need to implement the actual API calls)
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${CONFIG.STORAGE.PINATA_JWT}` },
    //   body: formData
    // });
    // const result = await response.json();
    // return `ipfs://${result.IpfsHash}`;
    
    // For now, return a placeholder
    return `ipfs://QmPlaceholderHash${Date.now()}`;
  }

  // Estimate gas for operations
  async estimateGas(operation: 'token' | 'nft', params: any) {
    if (!this.masterFactory) throw new Error('Contract not initialized');

    try {
      let gasEstimate;
      
      if (operation === 'token') {
        gasEstimate = await this.masterFactory.createToken.estimateGas(
          params.name, params.ticker, params.supply
        );
      } else {
        gasEstimate = await this.masterFactory.createNFT.estimateGas(
          params.name, params.description, params.imageURI, params.quantity
        );
      }

      const gasPrice = await this.provider!.getFeeData();
      const estimatedCost = gasEstimate * (gasPrice.gasPrice || 0n);
      
      return {
        gasEstimate: gasEstimate.toString(),
        estimatedCost: ethers.formatEther(estimatedCost)
      };
    } catch (error: unknown) {
      throw new Error(`Failed to estimate gas: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
