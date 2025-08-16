// Advanced AI Token Creation Parser with Similar Word Recognition
// This module handles intelligent parsing of user token creation requests

interface TokenCreationRequest {
  name: string;
  ticker: string;
  supply: number;
  type: 'token' | 'nft';
  confidence: number;
}

interface ParsedResult {
  success: boolean;
  data?: TokenCreationRequest;
  error?: string;
  suggestions?: string[];
}

export class TokenCreationAI {
  // Similar word mappings for intelligent recognition
  private static readonly FIELD_SYNONYMS = {
    name: ['name', 'title', 'called', 'named', 'token-name', 'tokenname', 'nome', 'nombre'],
    ticker: ['ticker', 'symbol', 'code', 'short', 'abbr', 'abbreviation', 'sym', 'tick', 'simbolo'],
    supply: ['supply', 'amount', 'total', 'quantity', 'count', 'number', 'volume', 'size', 'suma', 'cantidad'],
    token: ['token', 'coin', 'currency', 'asset', 'erc20', 'erc-20', 'tok', 'moneda'],
    nft: ['nft', 'collectible', 'art', 'artwork', 'collection', 'erc721', 'erc-721', 'non-fungible']
  };

  // Number word mappings
  private static readonly NUMBER_WORDS: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'hundred': 100, 'thousand': 1000, 'million': 1000000, 'billion': 1000000000,
    'k': 1000, 'm': 1000000, 'b': 1000000000,
    'uno': 1, 'dos': 2, 'tres': 3, 'cien': 100, 'mil': 1000, 'millon': 1000000
  };

  /**
   * Main parsing function that handles user input
   * @param input User's natural language input
   * @returns ParsedResult with extracted token data
   */
  static parseTokenRequest(input: string): ParsedResult {
    try {
      console.log('🤖 AI: Parsing token request:', input);
      
      // Clean and normalize input
      const cleanInput = this.normalizeInput(input);
      const words = cleanInput.split(/\s+/);
      
      // Determine if it's token or NFT
      const type = this.determineType(cleanInput);
      
      // Extract fields using intelligent parsing
      const name = this.extractName(words);
      const ticker = this.extractTicker(words);
      const supply = this.extractSupply(words);
      
      // Validation
      const validation = this.validateExtraction(name, ticker, supply, type);
      
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          suggestions: validation.suggestions
        };
      }
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(name, ticker, supply, cleanInput);
      
      console.log('✅ AI: Successfully parsed:', { name, ticker, supply, type, confidence });
      
      return {
        success: true,
        data: {
          name,
          ticker,
          supply,
          type,
          confidence
        }
      };
      
    } catch (error) {
      console.error('❌ AI: Parsing error:', error);
      return {
        success: false,
        error: `Failed to parse request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestions: [
          'Try: "Create token name MyToken ticker MTK supply 1000000"',
          'Try: "Make a token called Bitcoin2 symbol BTC2 amount 21000000"',
          'Try: "New token: name=Ethereum2, ticker=ETH2, supply=100M"'
        ]
      };
    }
  }

  /**
   * Normalize input text for better parsing
   */
  private static normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[=:]/g, ' ') // Replace = and : with spaces
      .replace(/,/g, ' ') // Replace commas with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  /**
   * Determine if request is for token or NFT
   */
  private static determineType(input: string): 'token' | 'nft' {
    const nftKeywords = this.FIELD_SYNONYMS.nft;
    const tokenKeywords = this.FIELD_SYNONYMS.token;
    
    const hasNftKeyword = nftKeywords.some(keyword => input.includes(keyword));
    const hasTokenKeyword = tokenKeywords.some(keyword => input.includes(keyword));
    
    // If both or neither, default to token
    if (hasNftKeyword && !hasTokenKeyword) {
      return 'nft';
    }
    
    return 'token';
  }

  /**
   * Extract token name using intelligent parsing
   */
  private static extractName(words: string[]): string {
    const nameKeywords = this.FIELD_SYNONYMS.name;
    
    // Find name keyword index
    let nameIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (nameKeywords.includes(words[i])) {
        nameIndex = i;
        break;
      }
    }
    
    if (nameIndex === -1) {
      // Try to find name after "create", "make", etc.
      const createWords = ['create', 'make', 'new', 'generate', 'build'];
      for (let i = 0; i < words.length; i++) {
        if (createWords.includes(words[i]) && i + 1 < words.length) {
          nameIndex = i;
          break;
        }
      }
    }
    
    if (nameIndex !== -1 && nameIndex + 1 < words.length) {
      // Extract name (could be multiple words until next keyword)
      const nameWords = [];
      for (let i = nameIndex + 1; i < words.length; i++) {
        const word = words[i];
        
        // Stop if we hit another field keyword
        if (this.isFieldKeyword(word)) break;
        
        nameWords.push(word);
      }
      
      return nameWords.join(' ').trim() || 'DefaultToken';
    }
    
    return 'DefaultToken';
  }

  /**
   * Extract ticker/symbol using intelligent parsing
   */
  private static extractTicker(words: string[]): string {
    const tickerKeywords = this.FIELD_SYNONYMS.ticker;
    
    // Find ticker keyword index
    let tickerIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (tickerKeywords.includes(words[i])) {
        tickerIndex = i;
        break;
      }
    }
    
    if (tickerIndex !== -1 && tickerIndex + 1 < words.length) {
      const ticker = words[tickerIndex + 1].toUpperCase();
      
      // Validate ticker format (2-10 characters, letters/numbers only)
      if (/^[A-Z0-9]{2,10}$/.test(ticker)) {
        return ticker;
      }
    }
    
    return 'TKN';
  }

  /**
   * Extract supply amount using intelligent parsing with number recognition
   */
  private static extractSupply(words: string[]): number {
    const supplyKeywords = this.FIELD_SYNONYMS.supply;
    
    // Find supply keyword index
    let supplyIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (supplyKeywords.includes(words[i])) {
        supplyIndex = i;
        break;
      }
    }
    
    if (supplyIndex !== -1 && supplyIndex + 1 < words.length) {
      const supplyStr = words[supplyIndex + 1];
      const supply = this.parseNumber(supplyStr);
      if (supply > 0) return supply;
    }
    
    // Fallback: look for any number in the input
    for (const word of words) {
      const number = this.parseNumber(word);
      if (number >= 1000) { // Assume supplies are at least 1000
        return number;
      }
    }
    
    return 1000000; // Default 1M supply
  }

  /**
   * Parse number from string with support for abbreviations and word numbers
   */
  private static parseNumber(str: string): number {
    if (!str) return 0;
    
    const cleanStr = str.toLowerCase().replace(/,/g, '');
    
    // Check if it's a word number
    if (this.NUMBER_WORDS[cleanStr]) {
      return this.NUMBER_WORDS[cleanStr];
    }
    
    // Handle abbreviations (1k, 2.5m, etc.)
    const match = cleanStr.match(/^(\d+(?:\.\d+)?)\s*([kmb]?)$/);
    if (match) {
      const number = parseFloat(match[1]);
      const multiplier = match[2];
      
      switch (multiplier) {
        case 'k': return Math.floor(number * 1000);
        case 'm': return Math.floor(number * 1000000);
        case 'b': return Math.floor(number * 1000000000);
        default: return Math.floor(number);
      }
    }
    
    // Try regular number parsing
    const parsed = parseInt(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Check if a word is a field keyword
   */
  private static isFieldKeyword(word: string): boolean {
    const allKeywords = [
      ...this.FIELD_SYNONYMS.name,
      ...this.FIELD_SYNONYMS.ticker,
      ...this.FIELD_SYNONYMS.supply
    ];
    return allKeywords.includes(word);
  }

  /**
   * Validate extracted data
   */
  private static validateExtraction(name: string, ticker: string, supply: number, _type: 'token' | 'nft'): {
    success: boolean;
    error?: string;
    suggestions?: string[];
  } {
    const errors = [];
    const suggestions = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('Token name is required');
      suggestions.push('Add token name: "name MyToken" or "called Bitcoin2"');
    }
    
    if (!ticker || ticker.length < 2) {
      errors.push('Token ticker must be at least 2 characters');
      suggestions.push('Add ticker: "ticker BTC" or "symbol ETH"');
    }
    
    if (supply <= 0) {
      errors.push('Token supply must be greater than 0');
      suggestions.push('Add supply: "supply 1000000" or "amount 1M"');
    }
    
    if (supply > 1000000000000) { // 1 trillion limit
      errors.push('Token supply too large (max 1 trillion)');
      suggestions.push('Reduce supply to reasonable amount');
    }
    
    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', '),
        suggestions
      };
    }
    
    return { success: true };
  }

  /**
   * Calculate confidence score based on parsing quality
   */
  private static calculateConfidence(name: string, ticker: string, supply: number, _input: string): number {
    let confidence = 0;
    
    // Name confidence
    if (name !== 'DefaultToken') confidence += 30;
    if (name.length > 3) confidence += 10;
    
    // Ticker confidence  
    if (ticker !== 'TKN') confidence += 30;
    if (/^[A-Z]{2,5}$/.test(ticker)) confidence += 10;
    
    // Supply confidence
    if (supply !== 1000000) confidence += 20; // Not default
    if (supply >= 1000 && supply <= 1000000000) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  /**
   * Generate confirmation message for user
   */
  static generateConfirmation(data: TokenCreationRequest): string {
    const { name, ticker, supply, confidence } = data;
    
    return `🤖 **Token Creation Confirmation**

📋 **Extracted Details:**
• **Name:** ${name}
• **Ticker:** ${ticker}  
• **Supply:** ${supply.toLocaleString()}
• **Network:** Avalanche Mainnet
• **Confidence:** ${confidence}%

💰 **Estimated Costs:**
• **Gas Fee:** ~0.01 AVAX
• **Network:** Avalanche Mainnet

✅ **Ready to Deploy?**
Type "yes" or "confirm" to proceed with deployment.
Type "edit" to modify details.`;
  }

  /**
   * Test the parser with example inputs
   */
  static runTests(): void {
    console.log('🧪 Running TokenCreationAI Tests...\n');
    
    const testCases = [
      "Create a token name hormaz ticker HD supply 5000",
      "Make token called Bitcoin2 symbol BTC2 amount 1000000",
      "New token: name=Ethereum, ticker=ETH, supply=1M",
      "Generate coin named DogeCoin ticker DOGE with 21M supply",
      "Create token MyAwesome ticker MAT supply 500k"
    ];
    
    testCases.forEach((test, index) => {
      console.log(`Test ${index + 1}: "${test}"`);
      const result = this.parseTokenRequest(test);
      
      if (result.success && result.data) {
        console.log(`✅ Success:`, result.data);
        console.log(`📝 Confirmation:`, this.generateConfirmation(result.data));
      } else {
        console.log(`❌ Failed:`, result.error);
        if (result.suggestions) {
          console.log(`💡 Suggestions:`, result.suggestions);
        }
      }
      console.log('---\n');
    });
  }
}

// Export for use in other modules
export type { TokenCreationRequest, ParsedResult };
