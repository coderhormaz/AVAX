import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config';

/**
 * AI utility functions for parsing blockchain commands
 */

export interface AIResponse {
  success: boolean;
  action?: 'send_avax' | 'create_token' | 'mint_nft' | 'help' | 'unknown';
  parameters?: any;
  message: string;
  needsConfirmation?: boolean;
  missingParams?: string[];
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

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini AI
 */
export const initializeAI = () => {
  if (!CONFIG.AI.GEMINI_API_KEY) {
    console.warn('Gemini API key not configured');
    return false;
  }
  
  try {
    genAI = new GoogleGenerativeAI(CONFIG.AI.GEMINI_API_KEY);
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    return false;
  }
};

/**
 * System prompt for the AI assistant
 */
const SYSTEM_PROMPT = `You are an AI assistant specialized in Avalanche blockchain operations. Your role is to help users perform blockchain transactions through natural language commands.

SUPPORTED ACTIONS:
1. send_avax - Send AVAX to another address
2. create_token - Deploy a new ERC20 token
3. mint_nft - Mint an NFT

INSTRUCTIONS:
- Always respond in JSON format
- Parse user commands into structured blockchain actions
- If parameters are missing, ask for them specifically
- Be accurate and efficient with token usage
- Only suggest actions that are available in this app
- Always require user confirmation before executing transactions

RESPONSE FORMAT:
{
  "success": true/false,
  "action": "send_avax|create_token|mint_nft|help|unknown",
  "parameters": {...},
  "message": "Clear explanation of what will happen",
  "needsConfirmation": true/false,
  "missingParams": ["param1", "param2"] // if any required params are missing
}

EXAMPLES:
User: "send 5 avax to 0x123..."
Response: {
  "success": true,
  "action": "send_avax",
  "parameters": {"to": "0x123...", "amount": "5"},
  "message": "Ready to send 5 AVAX to 0x123...",
  "needsConfirmation": true
}

User: "create token called Kings"
Response: {
  "success": false,
  "action": "create_token",
  "parameters": {"name": "Kings"},
  "message": "To create the Kings token, I need more information:",
  "missingParams": ["symbol", "initialSupply", "decimals"]
}`;

/**
 * Parse user command using AI
 */
export const parseCommand = async (userInput: string, walletAddress?: string): Promise<AIResponse> => {
  if (!genAI) {
    return {
      success: false,
      message: 'AI assistant not initialized. Please check your API configuration.'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: CONFIG.AI.MODEL,
      generationConfig: {
        temperature: CONFIG.AI.TEMPERATURE,
        maxOutputTokens: CONFIG.AI.MAX_TOKENS,
      }
    });

    const contextPrompt = walletAddress 
      ? `User wallet: ${walletAddress}\n\n${SYSTEM_PROMPT}`
      : SYSTEM_PROMPT;

    const prompt = `${contextPrompt}\n\nUser command: "${userInput}"\n\nRespond with JSON only:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate response structure
      if (typeof parsedResponse.success !== 'boolean') {
        throw new Error('Invalid response format');
      }
      
      return parsedResponse as AIResponse;
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return {
        success: false,
        message: 'I had trouble understanding that request. Could you please rephrase it?'
      };
    }
    
  } catch (error) {
    console.error('AI request failed:', error);
    return {
      success: false,
      message: 'AI assistant is currently unavailable. Please try again later.'
    };
  }
};

/**
 * Generate help message
 */
export const getHelpMessage = (): string => {
  return `🤖 **Avalanche AI Assistant Help**

**Available Commands:**

**💸 Send AVAX:**
- "send 5 avax to 0x123..."
- "transfer 0.1 AVAX to 0xabc..."

**🪙 Create Token:**
- "create token called MyToken with symbol MTK"
- "deploy token Kings ticker KNG supply 10000"

**🎨 Mint NFT:**
- "mint nft"
- "create nft called My Art"

**💡 Tips:**
- Always have at least 0.01 AVAX in your wallet
- All transactions require confirmation
- You can ask for help anytime

**⚠️ Security:**
- Never share your private key
- Always verify transaction details before confirming`;
};

/**
 * Validate command parameters
 */
export const validateParameters = (action: string, parameters: any): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  switch (action) {
    case 'send_avax':
      if (!parameters.to) missing.push('recipient address');
      if (!parameters.amount) missing.push('amount');
      break;
      
    case 'create_token':
      if (!parameters.name) missing.push('token name');
      if (!parameters.symbol) missing.push('token symbol');
      if (!parameters.initialSupply) missing.push('initial supply');
      if (!parameters.decimals) missing.push('decimals');
      break;
      
    case 'mint_nft':
      // NFT parameters are collected through UI
      break;
      
    default:
      return { valid: false, missing: ['valid action'] };
  }
  
  return { valid: missing.length === 0, missing };
};

/**
 * Format transaction summary for confirmation
 */
export const formatTransactionSummary = (action: string, parameters: any): string => {
  switch (action) {
    case 'send_avax':
      return `Send ${parameters.amount} AVAX to ${parameters.to}`;
      
    case 'create_token':
      return `Create token "${parameters.name}" (${parameters.symbol}) with ${parameters.initialSupply} initial supply and ${parameters.decimals} decimals`;
      
    case 'mint_nft':
      return `Mint NFT${parameters.quantity > 1 ? `s (${parameters.quantity})` : ''} ${parameters.name ? `"${parameters.name}"` : ''}`;
      
    default:
      return 'Unknown transaction';
  }
};
