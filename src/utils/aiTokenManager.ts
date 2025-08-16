// AI Token Deployment Integration
// This module integrates the advanced AI parser with the blockchain service

import { TokenCreationAI, type TokenCreationRequest } from './advancedTokenAI';
import { deployTokenForAI } from '../components/AIDeployment';
import type { WalletData } from '../App';

interface DeploymentState {
  stage: 'parsing' | 'confirming' | 'deploying' | 'completed' | 'error';
  data?: TokenCreationRequest;
  result?: DeploymentResult;
  error?: string;
}

interface DeploymentResult {
  success: boolean;
  message: string;
  contractAddress?: string;
  transactionHash?: string;
  explorerUrl?: string;
  error?: string;
}

export class AITokenDeploymentManager {
  private currentState: DeploymentState = { stage: 'parsing' };
  private wallet: WalletData | null = null;

  constructor(wallet: WalletData | null) {
    this.wallet = wallet;
  }

  /**
   * Process user input and manage the token creation flow
   */
  async processUserInput(input: string): Promise<string> {
    console.log('🤖 AI Manager: Processing input:', input);

    try {
      // Handle different stages
      switch (this.currentState.stage) {
        case 'parsing':
          return await this.handleParsingStage(input);
        
        case 'confirming':
          return await this.handleConfirmationStage(input);
        
        case 'deploying':
          return 'Deployment in progress... Please wait.';
        
        case 'completed':
        case 'error':
          // Reset and start over
          this.currentState = { stage: 'parsing' };
          return await this.handleParsingStage(input);
        
        default:
          this.currentState = { stage: 'parsing' };
          return await this.handleParsingStage(input);
      }
    } catch (error) {
      console.error('❌ AI Manager: Error processing input:', error);
      this.currentState = { 
        stage: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      return `❌ **Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again with a new request.`;
    }
  }

  /**
   * Handle the initial parsing stage
   */
  private async handleParsingStage(input: string): Promise<string> {
    console.log('📝 Parsing user request...');

    // Check if wallet is connected
    if (!this.wallet) {
      return `🔐 **Wallet Required**

Please connect your wallet first to create tokens.

After connecting, try again with:
• "Create token name hormaz ticker HD supply 5000"
• "Make token called MyToken symbol MTK amount 1M"`;
    }

    // Parse the token request
    const parseResult = TokenCreationAI.parseTokenRequest(input);

    if (!parseResult.success || !parseResult.data) {
      let errorMessage = `❌ **Unable to Parse Request**

${parseResult.error || 'Could not understand your request.'}

`;

      if (parseResult.suggestions && parseResult.suggestions.length > 0) {
        errorMessage += `💡 **Try these formats:**
${parseResult.suggestions.map(s => `• ${s}`).join('\n')}`;
      }

      return errorMessage;
    }

    // Store parsed data and move to confirmation stage
    this.currentState = {
      stage: 'confirming',
      data: parseResult.data
    };

    // Generate confirmation message
    const confirmation = TokenCreationAI.generateConfirmation(parseResult.data);
    return confirmation;
  }

  /**
   * Handle the confirmation stage
   */
  private async handleConfirmationStage(input: string): Promise<string> {
    console.log('✅ Handling confirmation stage...');

    if (!this.currentState.data) {
      this.currentState = { stage: 'parsing' };
      return 'Error: No token data found. Please start over.';
    }

    const normalizedInput = input.toLowerCase().trim();

    // Check for confirmation
    const confirmWords = ['yes', 'y', 'confirm', 'proceed', 'deploy', 'ok', 'continue', 'go'];
    const editWords = ['no', 'n', 'edit', 'change', 'modify', 'cancel'];

    if (confirmWords.some(word => normalizedInput.includes(word))) {
      // User confirmed - start deployment
      return await this.startDeployment();
    } else if (editWords.some(word => normalizedInput.includes(word))) {
      // User wants to edit - go back to parsing
      this.currentState = { stage: 'parsing' };
      return `🔄 **Starting Over**

Please provide your token details again:
• "Create token name [YOUR_NAME] ticker [TICKER] supply [AMOUNT]"`;
    } else {
      // Unclear response
      return `❓ **Please Confirm**

Current token details:
• **Name:** ${this.currentState.data.name}
• **Ticker:** ${this.currentState.data.ticker}
• **Supply:** ${this.currentState.data.supply.toLocaleString()}

Please type:
• **"yes"** or **"confirm"** to deploy
• **"edit"** or **"no"** to modify`;
    }
  }

  /**
   * Start the deployment process
   */
  private async startDeployment(): Promise<string> {
    console.log('🚀 Starting token deployment...');

    if (!this.currentState.data || !this.wallet) {
      this.currentState = { stage: 'error', error: 'Missing required data' };
      return '❌ Error: Missing wallet or token data.';
    }

    // Update state to deploying
    this.currentState.stage = 'deploying';

    const { name, ticker, supply } = this.currentState.data;

    try {
      console.log('📡 Calling deployTokenForAI...', { name, ticker, supply });

      // Call the deployment function
      const deployResult = await deployTokenForAI(name, ticker, supply, this.wallet);

      console.log('🎯 Deployment result:', deployResult);

      if (deployResult.success) {
        this.currentState = {
          stage: 'completed',
          result: deployResult
        };

        return `🎉 **Token Deployed Successfully!**

🪙 **Token Details:**
• **Name:** ${name}
• **Ticker:** ${ticker}
• **Supply:** ${supply.toLocaleString()}

📋 **Contract Info:**
• **Address:** [${deployResult.contractAddress}](https://snowtrace.io/token/${deployResult.contractAddress}?type=erc20&chainid=null)
• **Transaction:** [${deployResult.transactionHash}](https://snowtrace.io/tx/${deployResult.transactionHash})

✅ Your token is now live on Avalanche Mainnet!

🔗 **Quick Links:**
• [View Token on Snowtrace](https://snowtrace.io/token/${deployResult.contractAddress}?type=erc20&chainid=null)
• [View Transaction](https://snowtrace.io/tx/${deployResult.transactionHash})

You can now use your token address for trading, transfers, or further integrations.`;

      } else {
        this.currentState = {
          stage: 'error',
          error: deployResult.error
        };

        return `❌ **Deployment Failed**

**Error:** ${deployResult.message}

${deployResult.error ? `**Details:** ${deployResult.error}` : ''}

💡 **Troubleshooting:**
• Check your AVAX balance (need ~0.01 AVAX for gas)
• Verify your wallet is connected
• Try again in a few minutes

Would you like to try again?`;
      }

    } catch (error) {
      console.error('💥 Deployment error:', error);
      
      this.currentState = {
        stage: 'error',
        error: error instanceof Error ? error.message : 'Unknown deployment error'
      };

      return `💥 **Deployment Error**

Something went wrong during deployment:
**${error instanceof Error ? error.message : 'Unknown error'}**

Please check:
• Your internet connection
• AVAX balance in your wallet
• Try again in a few minutes

Would you like to try again?`;
    }
  }

  /**
   * Get current state for debugging
   */
  getCurrentState(): DeploymentState {
    return this.currentState;
  }

  /**
   * Reset the manager state
   */
  reset(): void {
    this.currentState = { stage: 'parsing' };
  }

  /**
   * Update wallet reference
   */
  updateWallet(wallet: WalletData | null): void {
    this.wallet = wallet;
  }

  /**
   * Test the complete flow
   */
  static async runTest(): Promise<void> {
    console.log('🧪 Testing AITokenDeploymentManager...\n');

    // Mock wallet
    const mockWallet: WalletData = {
      address: '0x1234567890123456789012345678901234567890',
      balance: '1.5',
      privateKey: 'mock-private-key'
    };

    const manager = new AITokenDeploymentManager(mockWallet);

    // Test parsing
    console.log('1. Testing parsing...');
    const parseResponse = await manager.processUserInput('Create token name hormaz ticker HD supply 5000');
    console.log('Response:', parseResponse);

    // Test confirmation (mock)
    console.log('\n2. Testing confirmation...');
    const confirmResponse = await manager.processUserInput('yes');
    console.log('Response:', confirmResponse);

    console.log('\n✅ Test completed!');
  }
}

export { type DeploymentState, type DeploymentResult };
