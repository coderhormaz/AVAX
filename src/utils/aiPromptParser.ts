// AI Prompt Parser for Token and NFT Creation
// Extracts structured data from natural language prompts

interface TokenRequest {
  name: string;
  ticker: string;
  supply: number;
  decimals?: number;
}

interface NFTRequest {
  name: string;
  description?: string;
  quantity?: number;
  imageFile?: File;
}

export class AIPromptParser {
  
  /**
   * Parse token creation request from natural language
   * Examples:
   * - "create a token called AvaxTeam ticker AT supply 500"
   * - "make token named Bitcoin Gold symbol BTG with 1000000 supply"
   * - "deploy token MyToken (MT) 50000 tokens"
   */
  static parseTokenRequest(prompt: string): TokenRequest | null {
    // Extract token name
    let name = '';
    const namePatterns = [
      /(?:token\s+(?:called|named)\s+([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+ticker|\s+symbol|\s+with|\s*\(|$))/i,
      /(?:create|make|deploy)\s+(?:a\s+)?token\s+([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+ticker|\s+symbol|\s+with|\s*\(|$)/i,
      /(?:token\s+)([a-zA-Z]+(?:\s+[a-zA-Z]+)*?)(?:\s+ticker|\s+symbol|\s*\()/i
    ];
    
    for (const pattern of namePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }
    
    // Extract ticker/symbol
    let ticker = '';
    const tickerPatterns = [
      /(?:ticker|symbol)\s+([A-Z]{1,10})/i,
      /\(([A-Z]{1,10})\)/i,
      /ticker\s*[:=]\s*([A-Z]{1,10})/i,
      /symbol\s*[:=]\s*([A-Z]{1,10})/i
    ];
    
    for (const pattern of tickerPatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        ticker = match[1].toUpperCase();
        break;
      }
    }
    
    // If no explicit ticker, generate from name
    if (!ticker && name) {
      const words = name.split(/\s+/);
      if (words.length === 1) {
        ticker = name.substring(0, 4).toUpperCase();
      } else {
        ticker = words.map(w => w[0]).join('').substring(0, 5).toUpperCase();
      }
    }
    
    // Extract supply
    let supply = 0;
    const supplyPatterns = [
      /supply\s+(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s+(?:tokens?|supply)/i,
      /with\s+(\d+(?:,\d{3})*(?:\.\d+)?)/i,
      /(\d+(?:,\d{3})*(?:\.\d+)?)(?:\s+tokens?)?\s*$/i
    ];
    
    for (const pattern of supplyPatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        supply = parseInt(match[1].replace(/,/g, ''));
        break;
      }
    }
    
    // Default supply if not specified
    if (supply === 0) {
      supply = 1000000; // Default 1M tokens
    }
    
    // Extract decimals (optional)
    let decimals = 18; // Default
    const decimalMatch = prompt.match(/(?:decimals?\s+(\d+))/i);
    if (decimalMatch) {
      decimals = parseInt(decimalMatch[1]);
    }
    
    if (name && ticker) {
      return {
        name: this.capitalizeWords(name),
        ticker: ticker,
        supply: supply,
        decimals: decimals
      };
    }
    
    return null;
  }
  
  /**
   * Parse NFT creation request from natural language
   * Examples:
   * - "create nft called CoolArt with description amazing digital art"
   * - "make nft PixelPunk quantity 5"
   * - "deploy nft collection GameItems"
   */
  static parseNFTRequest(prompt: string, imageFile?: File): NFTRequest | null {
    // Extract NFT name
    let name = '';
    const namePatterns = [
      /(?:nft\s+(?:called|named|name)\s+([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+with|\s+description|\s+quantity|$))/i,
      /(?:create|make|deploy)\s+(?:an?\s+)?nft\s+(?:collection\s+)?([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+with|\s+description|\s+quantity|$)/i,
      /(?:create|make|deploy)\s+nft\s+(?:name|called|named)\s+([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+with|\s+description|\s+quantity|$)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }
    
    // Extract description
    let description = '';
    const descPatterns = [
      /description\s+([^,]+?)(?:\s+quantity|$)/i,
      /with\s+description\s+([^,]+?)(?:\s+quantity|$)/i,
      /desc\s*[:=]\s*([^,]+?)(?:\s+quantity|$)/i
    ];
    
    for (const pattern of descPatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        description = match[1].trim();
        break;
      }
    }
    
    // Extract quantity
    let quantity = 1; // Default
    const quantityPatterns = [
      /quantity\s+(\d+)/i,
      /(\d+)\s+nfts?/i,
      /mint\s+(\d+)/i
    ];
    
    for (const pattern of quantityPatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        quantity = parseInt(match[1]);
        break;
      }
    }
    
    if (name) {
      return {
        name: this.capitalizeWords(name),
        description: description || `${this.capitalizeWords(name)} NFT Collection`,
        quantity: quantity,
        imageFile: imageFile
      };
    }
    
    return null;
  }
  
  /**
   * Determine if prompt is for token or NFT creation
   */
  static getRequestType(prompt: string): 'token' | 'nft' | 'unknown' {
    const cleanPrompt = prompt.toLowerCase();
    
    const tokenKeywords = ['token', 'erc20', 'currency', 'coin'];
    const nftKeywords = ['nft', 'erc721', 'collectible', 'artwork', 'art'];
    
    const hasTokenKeyword = tokenKeywords.some(keyword => cleanPrompt.includes(keyword));
    const hasNFTKeyword = nftKeywords.some(keyword => cleanPrompt.includes(keyword));
    
    if (hasTokenKeyword && !hasNFTKeyword) return 'token';
    if (hasNFTKeyword && !hasTokenKeyword) return 'nft';
    if (hasTokenKeyword && hasNFTKeyword) {
      // If both, prefer the first mentioned
      const tokenIndex = Math.min(...tokenKeywords.map(k => cleanPrompt.indexOf(k)).filter(i => i >= 0));
      const nftIndex = Math.min(...nftKeywords.map(k => cleanPrompt.indexOf(k)).filter(i => i >= 0));
      return tokenIndex < nftIndex ? 'token' : 'nft';
    }
    
    return 'unknown';
  }
  
  /**
   * Helper function to capitalize words
   */
  private static capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
  
  /**
   * Estimate gas cost for deployment
   */
  static async estimateDeploymentCost(type: 'token' | 'nft'): Promise<string> {
    // Optimized estimates for Avalanche mainnet with MasterFactory gas limits
    const gasEstimates = {
      token: 500000,   // 500K gas limit for token creation
      nft: 700000      // 700K gas limit for NFT creation
    };
    
    const gasPrice = 25; // 25 nAVAX gas price
    const gasLimit = gasEstimates[type];
    const costInWei = gasLimit * gasPrice * 1e9; // Convert to wei
    const costInAVAX = costInWei / 1e18; // Convert to AVAX
    
    return `~${costInAVAX.toFixed(4)} AVAX`;
  }
}
