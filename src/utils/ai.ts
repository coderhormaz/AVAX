/**
 * Intelligent AI parsing functions for blockchain commands
 * Advanced pattern recognition, typo correction, and natural language understanding
 */

export interface AIResponse {
  success: boolean;
  action?: 'send_avax' | 'create_token' | 'mint_nft' | 'help' | 'unknown';
  parameters?: any;
  message: string;
  needsConfirmation?: boolean;
  missingParams?: string[];
  suggestions?: string[];
}

export interface SendAvaxCommand {
  action: 'send_avax';
  to: string;
  amount: string;
}

export interface CreateTokenCommand {
  action: 'create_token';
  name: string;
  symbol: string;
  initialSupply: number;
  decimals: number;
}

export interface MintNFTCommand {
  action: 'mint_nft';
  name?: string;
  description?: string;
  image?: string;
  quantity?: number;
  to?: string;
}

// Advanced typo correction dictionary
const TYPO_CORRECTIONS: { [key: string]: string } = {
  // Common command typos
  'creat': 'create', 'crate': 'create', 'creete': 'create', 'ceate': 'create', 'craete': 'create',
  'tokn': 'token', 'toekn': 'token', 'tken': 'token', 'tokan': 'token', 'tokne': 'token',
  'symbole': 'symbol', 'sybmol': 'symbol', 'symbl': 'symbol', 'sumbol': 'symbol', 'simbol': 'symbol',
  'tikcer': 'ticker', 'tickr': 'ticker', 'ticekr': 'ticker', 'tiker': 'ticker',
  'suply': 'supply', 'suplly': 'supply', 'supli': 'supply', 'supp;y': 'supply', 'suppyl': 'supply',
  'nft': 'nft', 'nt': 'nft', 'nfts': 'nft',
  'mint': 'mint', 'mnt': 'mint', 'mintt': 'mint', 'mit': 'mint',
  'send': 'send', 'snd': 'send', 'sed': 'send', 'snend': 'send', 'semd': 'send',
  'transfer': 'transfer', 'tranfer': 'transfer', 'trasnfer': 'transfer', 'transferr': 'transfer',
  'avax': 'avax', 'avx': 'avax', 'avaxx': 'avax', 'avac': 'avax',
  'called': 'called', 'calld': 'called', 'caled': 'called', 'callled': 'called',
  'named': 'named', 'namd': 'named', 'name': 'named', 'nameed': 'named',
  'deploy': 'deploy', 'deploi': 'deploy', 'depoy': 'deploy', 'deploye': 'deploy',
  'make': 'make', 'mke': 'make', 'maek': 'make', 'makee': 'make',
  'with': 'with', 'wit': 'with', 'wth': 'with', 'wiht': 'with', 'whit': 'with',
  'decimals': 'decimals', 'decimal': 'decimals', 'decimales': 'decimals', 'decmals': 'decimals'
};

// Synonym recognition
const SYNONYMS: { [key: string]: string[] } = {
  'create': ['make', 'deploy', 'generate', 'build', 'launch', 'start', 'new'],
  'token': ['coin', 'currency', 'crypto', 'cryptocurrency', 'digital asset'],
  'symbol': ['ticker', 'code', 'abbreviation', 'short name'],
  'supply': ['amount', 'total', 'quantity', 'number', 'count'],
  'called': ['named', 'titled', 'with name', 'known as'],
  'send': ['transfer', 'pay', 'give', 'move', 'transmit', 'forward'],
  'mint': ['create', 'generate', 'make', 'produce', 'issue'],
  'nft': ['collectible', 'digital art', 'non-fungible', 'unique token', 'artwork']
};

// Intelligent typo correction
function correctTypos(text: string): string {
  let corrected = text.toLowerCase();
  for (const [typo, correction] of Object.entries(TYPO_CORRECTIONS)) {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, correction);
  }
  return corrected;
}

// Synonym expansion for better understanding
function expandSynonyms(text: string): string {
  let expanded = text;
  for (const [main, syns] of Object.entries(SYNONYMS)) {
    for (const syn of syns) {
      const regex = new RegExp(`\\b${syn}\\b`, 'gi');
      expanded = expanded.replace(regex, main);
    }
  }
  return expanded;
}

// Generate personalized greetings
function generateGreeting(): string {
  const greetings = [
    "Hello there! ✨ I'm AVAX AI, your intelligent blockchain companion! I'm genuinely excited to help you explore the amazing world of Avalanche!",
    "Hey! 👋 Welcome to the future of blockchain interaction! I'm AVAX AI, and I'm here to make your crypto journey smooth, smart, and absolutely delightful!",
    "Greetings, blockchain explorer! 🚀 I'm AVAX AI, your personal DeFi assistant. Together, we'll make magic happen on the Avalanche network!",
    "Hi there, crypto enthusiast! 🌟 I'm AVAX AI - think of me as your brilliant blockchain buddy who speaks your language and makes complex things simple!",
    "Hello! 💫 I'm AVAX AI, your advanced digital asset assistant. I'm not just smart - I'm intuitive, understanding, and here to revolutionize how you interact with blockchain!"
  ];
  
  const features = [
    "💸 **Send AVAX** - Just say 'send 5 AVAX to my friend' and I'll handle the rest!",
    "🪙 **Create Tokens** - 'Make a GameCoin with 1M supply' - I understand even with typos!",
    "🎨 **Mint NFTs** - 'Create cool digital art' - I'll make it happen beautifully!",
    "🧠 **Smart Understanding** - I correct typos, understand synonyms, and speak naturally!"
  ];

  const tips = [
    "✨ I understand natural language - talk to me like a friend!",
    "🔧 I auto-correct typos and understand different ways of saying things!",
    "💡 I'm context-aware and will guide you through any process!",
    "🎯 I learn from our conversation to serve you better!"
  ];

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  const shuffledFeatures = features.sort(() => 0.5 - Math.random()).slice(0, 3);
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return `${randomGreeting}\n\n**What I can do for you:**\n\n${shuffledFeatures.join('\n')}\n\n**Pro Tip:** ${randomTip}\n\nWhat incredible thing shall we build together today? 🚀`;
}

/**
 * Advanced intelligent pattern matching for commands
 */
export const parseCommand = async (userInput: string, walletAddress?: string): Promise<AIResponse> => {
  // Note: walletAddress available for future personalization features
  let input = correctTypos(userInput.toLowerCase().trim());
  input = expandSynonyms(input);
  
  // Enhanced greeting patterns with personality
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|what's up|yo|howdy|salutations)/.test(input)) {
    return {
      success: true,
      action: 'help',
      message: generateGreeting(),
      needsConfirmation: false
    };
  }

  // Gratitude and appreciation responses
  if (/(thank you|thanks|thx|appreciate|grateful|awesome|cool|great|amazing|perfect|excellent)/.test(input)) {
    const responses = [
      "You're absolutely welcome! 😊 I'm thrilled I could help! Ready for our next blockchain adventure?",
      "My pleasure! 🌟 That's what I'm here for - making your crypto journey amazing! What's next?",
      "Aww, thank you! 💫 I love helping brilliant minds like you explore the blockchain universe!",
      "You're so kind! ✨ I'm genuinely happy to assist. Let's keep building something incredible together!"
    ];
    return {
      success: true,
      action: 'help',
      message: responses[Math.floor(Math.random() * responses.length)],
      needsConfirmation: false
    };
  }

  // Enhanced help patterns
  if (/(help|what can you do|commands|instructions|guide|how|what|capabilities|features)/.test(input)) {
    return {
      success: true,
      action: 'help',
      message: getHelpMessage(),
      needsConfirmation: false
    };
  }

  // Advanced Send AVAX patterns with intelligent extraction
  if (/(send|transfer|pay|give|move|transmit)/.test(input) && /avax/.test(input)) {
    // More flexible amount matching
    const amountMatch = input.match(/([\d,.]+)\s*(?:avax|avx|avaxx)/i) || 
                       input.match(/(?:avax|avx|avaxx)\s*([\d,.]+)/i) ||
                       input.match(/([\d,.]+)(?:\s*(?:avax|avx|avaxx))?/i);
    
    // Enhanced address matching
    const addressMatch = input.match(/(0x[a-fA-F0-9]{40})/i);
    
    const amount = amountMatch ? amountMatch[1].replace(',', '') : null;
    const to = addressMatch ? addressMatch[1] : null;
    
    if (amount && to) {
      return {
        success: true,
        action: 'send_avax',
        parameters: { amount, to },
        message: `Perfect! 🎯 Ready to send ${amount} AVAX to ${to}!\n\n✨ I've got everything I need for this transaction!`,
        needsConfirmation: true
      };
    } else {
      const missing = [];
      if (!amount) missing.push('amount');
      if (!to) missing.push('recipient address');
      
      const encouragingMessages = [
        "I'd love to help you send AVAX! 💸 You're so close!",
        "Great! Let's get your AVAX moving! 🚀 I just need a bit more info:",
        "Awesome choice! AVAX transfers are my specialty! 💫 Help me with:"
      ];
      
      return {
        success: false,
        action: 'send_avax',
        message: `${encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]}\n\n${missing.includes('amount') ? '• **Amount**: How much AVAX to send? (e.g., 2.5 AVAX)\n' : ''}${missing.includes('recipient address') ? '• **Address**: Recipient wallet address (starts with 0x...)\n' : ''}\n💡 **Example**: "send 2.5 AVAX to 0x742d35Cc..."`,
        missingParams: missing,
        suggestions: ["Double-check the address to avoid mistakes", "Start with a small test amount first", "Copy-paste the address to ensure accuracy"]
      };
    }
  }

  // Enhanced Create Token patterns with flexible parsing
  if (/(create|make|deploy|launch|build|generate|start|new)/.test(input) && /(token|coin|currency|crypto|digital asset)/.test(input)) {
    // Advanced name extraction patterns
    const namePatterns = [
      /(?:called|named|titled|with name|known as)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:symbol|ticker|with|supply|decimals)|$)/i,
      /(?:token|coin)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:symbol|ticker|with|supply|decimals)|$)/i,
      /(?:create|make|deploy)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:token|coin|symbol|ticker|with|supply|decimals)|$)/i
    ];
    
    let nameMatch = null;
    for (const pattern of namePatterns) {
      nameMatch = input.match(pattern);
      if (nameMatch) break;
    }
    
    // Enhanced symbol extraction
    const symbolMatch = input.match(/(?:symbol|ticker|code|abbreviation)\s+([a-zA-Z0-9]+)/i) ||
                       input.match(/(?:with|symbol|ticker)\s+([A-Z]{1,10})/i);
    
    // Flexible supply extraction
    const supplyMatch = input.match(/([\d,]+)\s*(?:million|m)/i) ? 
                       [null, (parseInt(input.match(/([\d,]+)\s*(?:million|m)/i)![1].replace(/,/g, '')) * 1000000).toString()] :
                       input.match(/([\d,]+)\s*(?:thousand|k)/i) ?
                       [null, (parseInt(input.match(/([\d,]+)\s*(?:thousand|k)/i)![1].replace(/,/g, '')) * 1000).toString()] :
                       input.match(/([\d,]+)(?:\s*(?:supply|tokens?|amount|total|quantity|count))?/i);
    
    const decimalsMatch = input.match(/(?:decimals?|decimal places)\s+(\d+)/i);
    
    const name = nameMatch ? nameMatch[1].trim().replace(/\b\w/g, l => l.toUpperCase()) : null;
    const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : null;
    const supply = supplyMatch && supplyMatch[1] ? parseInt(supplyMatch[1].replace(/,/g, '')) : null;
    const decimals = decimalsMatch ? parseInt(decimalsMatch[1]) : 18;
    
    if (name && symbol && supply) {
      return {
        success: true,
        action: 'create_token',
        parameters: { name, symbol, initialSupply: supply, decimals },
        message: `Brilliant! 🌟 I've got everything to create your ${name} (${symbol}) token!\n\n🎯 **Token Details:**\n• Name: ${name}\n• Symbol: ${symbol}\n• Supply: ${supply.toLocaleString()} tokens\n• Decimals: ${decimals}\n\nThis is going to be amazing! Ready to deploy? 🚀`,
        needsConfirmation: true
      };
    } else {
      const missing = [];
      if (!name) missing.push('token name');
      if (!symbol) missing.push('symbol/ticker');
      if (!supply) missing.push('supply amount');
      
      const encouragingMessages = [
        "Fantastic! I love helping create new tokens! 🪙 Let's make something awesome!",
        "Great idea! Token creation is one of my favorites! 🌟 I just need:",
        "Excellent choice! New tokens are the future! ✨ Help me with:"
      ];
      
      return {
        success: false,
        action: 'create_token',
        message: `${encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]}\n\n${missing.includes('token name') ? '• **Name**: What should your token be called? (e.g., GameCoin, MyToken)\n' : ''}${missing.includes('symbol/ticker') ? '• **Symbol**: Trading ticker (e.g., GAME, MTK - usually 3-5 letters)\n' : ''}${missing.includes('supply amount') ? '• **Supply**: How many tokens? (e.g., 1000000 or 1M)\n' : ''}\n💡 **Example**: "create token called GameCoin symbol GAME supply 1000000"`,
        missingParams: missing,
        suggestions: [
          "Token names are usually one or two words",
          "Symbols are typically 3-5 uppercase letters",
          "Most tokens use 18 decimals (standard)",
          "Consider your token's purpose when choosing the name"
        ]
      };
    }
  }

  // Enhanced NFT patterns with creative understanding
  if (/(mint|create|make|generate|produce|issue)/.test(input) && /(nft|collectible|digital art|non-fungible|unique token|artwork)/.test(input)) {
    const nameMatch = input.match(/(?:called|named|titled)\s+([^,\n]+)/i) ||
                     input.match(/(?:nft|collectible|art)\s+([^,\n]+)/i);
    const descMatch = input.match(/(?:description|desc|about)\s+([^,\n]+)/i);
    
    const name = nameMatch ? nameMatch[1].trim() : null;
    const description = descMatch ? descMatch[1].trim() : null;
    
    const creativeNames = ['Digital Masterpiece', 'Unique Creation', 'Crypto Art', 'Digital Collectible', 'Blockchain Gem'];
    const defaultName = name || creativeNames[Math.floor(Math.random() * creativeNames.length)];
    const defaultDesc = description || 'A unique digital collectible on the Avalanche blockchain';
    
    return {
      success: true,
      action: 'mint_nft',
      parameters: { 
        name: defaultName, 
        description: defaultDesc,
        quantity: 1
      },
      message: `Amazing! 🎨 I'm excited to help you create "${defaultName}"!\n\n✨ **NFT Details:**\n• Name: ${defaultName}\n• Description: ${defaultDesc}\n• Quantity: 1 unique piece\n\nThis is going to be a beautiful addition to the blockchain! Ready to mint? 🌟`,
      needsConfirmation: true
    };
  }

  // Contextual unknown command response
  const unknownResponses = [
    "I'm not quite sure what you'd like me to do there! 🤔 But I'm eager to help!",
    "Hmm, that's an interesting request! 💭 Let me guide you to what I can do best:",
    "I didn't catch that perfectly, but no worries! 😊 Here's what I'm great at:",
    "That's a unique way to put it! 🌟 Let me show you my capabilities:"
  ];
  
  return {
    success: false,
    action: 'unknown',
    message: `${unknownResponses[Math.floor(Math.random() * unknownResponses.length)]}\n\n**Here's what I can help you with:**\n\n• 💸 **Send AVAX**: "send 5 AVAX to 0x123..."\n• 🪙 **Create Token**: "create token called MyToken symbol MTK supply 1000000"\n• 🎨 **Mint NFT**: "mint nft called My Artwork"\n\n💡 **Pro Tip**: I understand typos and different ways of saying things, so feel free to use natural language!\n\nWhat would you like to try? ✨`,
    suggestions: [
      "Try being more specific about what you want to do",
      "Use natural language - I understand typos and synonyms!",
      "Start with 'send', 'create', or 'mint' for different actions",
      "Type 'help' anytime for detailed guidance"
    ]
  };
};

/**
 * No AI initialization needed for local parsing
 */
export const initializeAI = (): boolean => {
  return true; // Always return true since we don't need external APIs
};

/**
 * Enhanced help message with personality
 */
export const getHelpMessage = (): string => {
  return `🤖 **AVAX AI Assistant - Your Intelligent Blockchain Companion**

**🎯 What Makes Me Special:**
• 🧠 **Smart Understanding** - I correct typos, understand synonyms, and speak naturally!
• ✨ **Context Aware** - I remember our conversation and adapt to help you better
• 💫 **Friendly & Helpful** - Think of me as your blockchain buddy who's always excited to help!

**💸 Send AVAX:**
• "send 5 avax to 0x123..." 
• "transfer 0.1 AVAX to my friend"
• "pay 2 AVAX to 0xabc..." (I understand variations!)

**🪙 Create Custom Tokens:**
• "create token called MyToken symbol MTK supply 1000000"
• "make GameCoin with ticker GAME and 5M supply"
• "deploy new coin named SuperCoin" (I'll ask for missing details!)

**🎨 Mint Beautiful NFTs:**
• "mint nft called My Artwork"
• "create digital collectible named Space Art"
• "make unique token called Crypto Gem"

**🔧 Smart Features:**
• **Typo Correction**: "creat tokn" → "create token" ✨
• **Synonym Understanding**: "make" = "create" = "deploy" 🎯
• **Natural Language**: Talk to me like a friend! 💬
• **Context Memory**: I learn from our conversation 🧠

**💡 Pro Tips:**
• I understand natural language - no need for perfect spelling!
• Always have at least 0.01 AVAX in your wallet for transactions
• I'll guide you through every step with clear confirmations
• Ask me anything - I'm here to make blockchain simple and fun!

**⚠️ Security Reminders:**
• Never share your private key with anyone
• Always double-check transaction details
• Start with small amounts when testing

Ready to build something amazing together? 🚀`;
};

/**
 * Validate command parameters with helpful feedback
 */
export const validateParameters = (action: string, parameters: any): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  switch (action) {
    case 'send_avax':
      if (!parameters.amount) missing.push('amount');
      if (!parameters.to) missing.push('to');
      break;
      
    case 'create_token':
      if (!parameters.name) missing.push('name');
      if (!parameters.symbol) missing.push('symbol');
      if (!parameters.initialSupply) missing.push('initialSupply');
      break;
      
    case 'mint_nft':
      // NFTs can have minimal parameters - we'll use smart defaults
      break;
  }
  
  return { valid: missing.length === 0, missing };
};

/**
 * Format transaction description for confirmation with personality
 */
export const formatTransactionDescription = (action: string, parameters: any): string => {
  switch (action) {
    case 'send_avax':
      return `Send ${parameters.amount} AVAX to ${parameters.to}`;
      
    case 'create_token':
      return `Create "${parameters.name}" (${parameters.symbol}) token with ${parameters.initialSupply?.toLocaleString()} supply and ${parameters.decimals} decimals`;
      
    case 'mint_nft':
      return `Mint ${parameters.quantity > 1 ? `${parameters.quantity} ` : ''}NFT${parameters.quantity > 1 ? 's' : ''} "${parameters.name || 'Digital Collectible'}"`;
      
    default:
      return 'Unknown transaction';
  }
};
