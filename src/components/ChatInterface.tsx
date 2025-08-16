import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Sparkles, ArrowUp, Copy, ExternalLink, Check, X, Upload } from 'lucide-react';
import { parseCommand, getHelpMessage } from '../utils/ai';
import { sendAvax, deployToken } from '../utils/blockchain';
import { NFTCreationWizard } from './NFTCreationWizard';
import { AITokenDeploymentManager } from '../utils/aiTokenManager';
import { aiNFTManager } from '../utils/aiNFTManager';
import { CONFIG, getNFTExplorerLink } from '../config';
import type { WalletData } from '../App';

export interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  action?: string;
  parameters?: any;
  txHash?: string;
  needsConfirmation?: boolean;
  confirmationType?: 'transaction' | 'ai_deployment';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ChatInterfaceProps {
  wallet: WalletData;
  onTransactionComplete: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  wallet, 
  onTransactionComplete 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: `Hey there! 👋 Welcome to AVAX AI!\n\nI'm your intelligent blockchain buddy who speaks your language! 🧠✨\n\n**What I can do for you:**\n• 💸 **Send AVAX** - "send 2 AVAX to my friend"\n• 🪙 **Create Tokens** - "make a GameCoin with 1M supply"\n• 🎨 **Create NFTs** - "create nft called CoolArt" (I'll ask questions in chat!)\n• 🔍 **Smart Help** - I understand typos, casual language & synonyms!\n\n**Try me with natural language:**\n• "hey, make me a token called AwesomeToken"\n• "send some avax to 0x123..."\n• "create nft named pixel art" - I'll guide you step by step!\n\nWhat awesome thing shall we build today? 🚀`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNFTWizard, setShowNFTWizard] = useState(false);
  const [nftInitialMessage, setNftInitialMessage] = useState('');
  const [nftState, setNftState] = useState(aiNFTManager.getCurrentState());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Token Deployment Manager
  const [aiTokenManager] = useState(() => new AITokenDeploymentManager(wallet));
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update AI manager when wallet changes
  useEffect(() => {
    aiTokenManager.updateWallet(wallet);
  }, [wallet, aiTokenManager]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    console.log('Adding message:', newMessage);
  };

  // Function to create confirmation message with inline actions
  const createConfirmationMessage = (type: 'send_avax' | 'create_token', parameters: any) => {
    const messageId = Date.now().toString();
    
    const onConfirm = async () => {
      // Remove the confirmation message and show loading
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Add loading message
      const loadingMessageId = Date.now().toString() + '_loading';
      const loadingMessage: Message = {
        id: loadingMessageId,
        type: 'ai',
        content: `🔄 **Processing ${type === 'send_avax' ? 'Transfer' : 'Token Deployment'}...**\n\nPlease wait while we process your transaction on the Avalanche blockchain.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, loadingMessage]);
      
      try {
        let result;
        console.log(`Processing ${type} with parameters:`, parameters);
        
        if (type === 'send_avax') {
          result = await sendAvax({
            privateKey: wallet.privateKey,
            to: parameters.to,
            amount: parameters.amount
          });
        } else if (type === 'create_token') {
          result = await deployToken({
            privateKey: wallet.privateKey,
            name: parameters.name,
            symbol: parameters.symbol,
            initialSupply: parameters.initialSupply,
            decimals: parameters.decimals || 18
          });
        }
        
        console.log('Transaction result:', result);
        
        // Remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
        
        if (result?.success && result?.txHash) {
          addMessage({
            type: 'ai',
            content: `✅ **${type === 'send_avax' ? 'Transfer' : 'Token Creation'} Successful**\n\n**Transaction Hash:** ${result.txHash}\n\nYou can view the transaction on [Snowtrace](${CONFIG.NETWORK.MAINNET.explorerUrl}/tx/${result.txHash}).`,
            txHash: result.txHash
          });
          onTransactionComplete();
        } else if (result?.txHash) {
          // Handle case where txHash exists but success might not be explicitly set
          addMessage({
            type: 'ai',
            content: `✅ **${type === 'send_avax' ? 'Transfer' : 'Token Creation'} Completed**\n\n**Transaction Hash:** ${result.txHash}\n\nYou can view the transaction on [Snowtrace](${CONFIG.NETWORK.MAINNET.explorerUrl}/tx/${result.txHash}).`,
            txHash: result.txHash
          });
          onTransactionComplete();
        } else {
          addMessage({
            type: 'ai',
            content: `❌ **Transaction Failed**\n\n${result?.error || 'Transaction was not successful'}`
          });
        }
      } catch (error) {
        console.error('Transaction error:', error);
        // Remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
        
        addMessage({
          type: 'ai',
          content: `❌ **Transaction Failed**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        });
      }
    };

    const onCancel = () => {
      // Remove the confirmation message
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      addMessage({
        type: 'ai',
        content: '❌ **Transaction Cancelled**\n\nNo changes were made to your wallet.'
      });
    };

    return {
      id: messageId,
      type: 'ai' as const,
      content: type === 'send_avax' 
        ? `💰 **Confirm AVAX Transfer**\n\n**From:** ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}\n**To:** ${parameters.to.slice(0, 6)}...${parameters.to.slice(-4)}\n**Amount:** ${parameters.amount} AVAX\n\n⚠️ **Warning:** This transaction cannot be reversed. Please verify the recipient address carefully.`
        : `🪙 **Confirm Token Deployment**\n\n**Token Name:** ${parameters.name}\n**Symbol:** ${parameters.symbol}\n**Initial Supply:** ${parameters.initialSupply.toLocaleString()}\n**Decimals:** ${parameters.decimals || 18}\n\n📋 **Deployment Info:**\n• Network: Avalanche Mainnet\n• Estimated Cost: ~0.002 AVAX\n• You will own 100% of the tokens`,
      timestamp: new Date(),
      needsConfirmation: true,
      confirmationType: 'transaction' as const,
      parameters,
      onConfirm,
      onCancel
    };
  };

  // Function to create AI deployment confirmation message
  const createAIConfirmationMessage = (requestType: 'token' | 'nft', parameters: any, userPrompt: string) => {
    const messageId = Date.now().toString();
    
    const onConfirm = async () => {
      // Remove the confirmation message and show loading
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      const loadingMessageId = Date.now().toString() + '_loading';
      const loadingMessage: Message = {
        id: loadingMessageId,
        type: 'ai',
        content: `🚀 **Deploying ${requestType === 'token' ? 'Token' : 'NFT'}...**\n\nPlease wait while I deploy your ${requestType} to the Avalanche blockchain. This may take a few moments.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, loadingMessage]);

      try {
        let result;
        console.log(`Deploying ${requestType} with parameters:`, parameters);
        
        if (requestType === 'token') {
          const { deployTokenForAI } = await import('./AIDeployment');
          result = await deployTokenForAI(
            parameters.name,
            parameters.ticker,
            parameters.supply,
            wallet
          );
        } else {
          const { deployNFTForAI } = await import('./AIDeployment');
          // Require image file for NFT creation
          const imageFile = parameters.imageFile;
          if (!imageFile) {
            throw new Error('Image file is required for NFT creation. Please upload an image first.');
          }
          
          result = await deployNFTForAI(
            parameters.name,
            parameters.description || '',
            imageFile,
            parameters.quantity || 1,
            wallet
          );
        }

        console.log('Deployment result:', result);
        
        // Remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));

        if (result && result.success) {
          const explorerLink = requestType === 'nft' 
            ? `[OKX Web3 Explorer](${result.tokenUrl})`
            : `[Snowtrace](${CONFIG.NETWORK.MAINNET.explorerUrl}/address/${result.contractAddress})`;
          
          addMessage({
            type: 'ai',
            content: `✅ **${requestType === 'token' ? 'Token' : 'NFT'} Created Successfully**\n\n${result.message}\n\n**Contract Address:** ${result.contractAddress}\n**Transaction Hash:** ${result.transactionHash}\n\n📍 **View Transaction:** [Snowtrace](${CONFIG.NETWORK.MAINNET.explorerUrl}/tx/${result.transactionHash})\n🎯 **View ${requestType === 'token' ? 'Token' : 'NFT'}:** ${explorerLink}`,
            txHash: result.transactionHash
          });
          onTransactionComplete();
        } else {
          addMessage({
            type: 'ai',
            content: `❌ **Deployment Failed**\n\n${result?.message || 'Unknown deployment error occurred'}`
          });
        }
      } catch (error) {
        console.error('Deployment error:', error);
        // Remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
        
        addMessage({
          type: 'ai',
          content: `❌ **Deployment Failed**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}`
        });
      }
    };

    const onCancel = () => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      addMessage({
        type: 'ai',
        content: '❌ **Deployment Cancelled**\n\nNo tokens or NFTs were created.'
      });
    };

    return {
      id: messageId,
      type: 'ai' as const,
      content: requestType === 'token'
        ? `🪙 **Confirm Token Deployment**\n\n**Your Request:** "${userPrompt}"\n\n**AI Parsed Details:**\n• **Token Name:** ${parameters.name}\n• **Symbol:** ${parameters.ticker}\n• **Supply:** ${parameters.supply.toLocaleString()}\n• **Decimals:** ${parameters.decimals}\n\n📋 **Deployment Info:**\n• Network: Avalanche Mainnet\n• Estimated Cost: ~0.0125 AVAX\n• Auto-Signature: MetaMask will auto-sign\n• Ownership: You will own 100% of the tokens`
        : `🖼️ **Confirm NFT Deployment**\n\n**Your Request:** "${userPrompt}"\n\n**AI Parsed Details:**\n• **NFT Name:** ${parameters.name}\n• **Description:** ${parameters.description}\n• **Quantity:** ${parameters.quantity}\n• **Image:** ${parameters.imageFile ? parameters.imageFile.name : '🎨 Auto-generated placeholder image'}\n\n📋 **Deployment Info:**\n• Network: Avalanche Mainnet\n• Estimated Cost: ~0.0175 AVAX\n• Auto-Signature: MetaMask will auto-sign\n• Ownership: You will own 100% of the NFTs`,
      timestamp: new Date(),
      needsConfirmation: true,
      confirmationType: 'ai_deployment' as const,
      parameters,
      onConfirm,
      onCancel
    };
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ Copied to clipboard:', text);
    } catch (err) {
      console.error('❌ Failed to copy:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    addMessage({
      type: 'user',
      content: userMessage
    });

    try {
      // Check if user has minimum balance for AI features
      const balance = parseFloat(wallet.balance);
      if (balance < CONFIG.WALLET.MIN_AVAX_BALANCE) {
        addMessage({
          type: 'ai',
          content: `⚠️ **Insufficient Balance**\n\nYou need at least **${CONFIG.WALLET.MIN_AVAX_BALANCE} AVAX** to use AI features and pay for transaction fees.\n\nPlease deposit some AVAX to your wallet and try again.`
        });
        return;
      }

      // Check if this looks like a token creation request or confirmation
      const tokenKeywords = ['create', 'make', 'generate', 'build', 'deploy', 'token', 'coin', 'currency'];
      const nftKeywords = ['nft', 'collectible', 'digital art', 'non-fungible', 'unique token', 'artwork', 'mint'];
      const confirmKeywords = ['yes', 'y', 'confirm', 'proceed', 'no', 'n', 'edit', 'change', 'cancel'];
      
      const hasTokenKeyword = tokenKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );
      
      const hasNFTKeyword = nftKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );
      
      const hasConfirmKeyword = confirmKeywords.some(keyword => 
        userMessage.toLowerCase().trim() === keyword
      );
      
      const aiManagerState = aiTokenManager.getCurrentState();
      const aiNFTState = aiNFTManager.getCurrentState();
      
      // If it's an NFT request or we're in NFT creation flow, use conversational NFT system
      if (hasNFTKeyword || aiNFTState.stage !== 'idle') {
        console.log('🎨 NFT request detected, using conversational NFT system');
        const nftResponse = await aiNFTManager.processUserInput(userMessage);
        
        // Check if the response contains deployment data (NFT creation confirmation)
        if (nftResponse.includes('_{"name"')) {
            // Extract deployment data and trigger actual NFT creation
            const match = nftResponse.match(/_(\{.*\})_/);
            if (match) {
              try {
                const deployData = JSON.parse(match[1]);
                
                // Get the current image file from NFT manager
                const nftState = aiNFTManager.getCurrentState();
                const imageFile = nftState.imageFile;
                
                // Create confirmation message for actual deployment
                const confirmationMessage = createAIConfirmationMessage('nft', {
                  name: deployData.name,
                  description: deployData.description,
                  quantity: deployData.quantity,
                  imageFile: imageFile  // Pass the actual File object
                }, userMessage);              setMessages(prev => [...prev, confirmationMessage]);
              return;
            } catch (error) {
              console.error('Failed to parse deployment data:', error);
            }
          }
        }
        
        addMessage({
          type: 'ai',
          content: nftResponse
        });
        
        // Update NFT state to trigger re-render of upload button
        const newNftState = aiNFTManager.getCurrentState();
        console.log('NFT State Updated:', newNftState.stage, 'Has Image:', !!newNftState.imageFile);
        setNftState(newNftState);
        return;
      }
      
      // If AI manager is in confirming state, or if it's a token request (but not NFT), use AI manager
      if ((hasTokenKeyword && !hasNFTKeyword) || hasConfirmKeyword || aiManagerState.stage === 'confirming') {
        // Use our advanced AI Token system
        console.log('🤖 Using AI Token Creation System for:', userMessage);
        const aiTokenResponse = await aiTokenManager.processUserInput(userMessage);
        
        addMessage({
          type: 'ai',
          content: aiTokenResponse
        });
        
        return;
      }

      // Parse command with AI for other actions
      const aiResponse = await parseCommand(userMessage, wallet.address);
      
      if (!aiResponse.success) {
        addMessage({
          type: 'ai',
          content: `❌ **Error**\n\n${aiResponse.message}`
        });
        return;
      }

      // Handle different actions
      switch (aiResponse.action) {
        case 'send_avax':
          if (aiResponse.needsConfirmation && aiResponse.parameters) {
            const confirmationMessage = createConfirmationMessage('send_avax', aiResponse.parameters);
            setMessages(prev => [...prev, confirmationMessage]);
          } else {
            let messageContent = aiResponse.message;
            
            // Add missing params info if available
            if (aiResponse.missingParams?.length) {
              messageContent += `\n\n**Missing Information:** ${aiResponse.missingParams.join(', ')}`;
            }
            
            // Add helpful suggestions if available
            if (aiResponse.suggestions?.length) {
              messageContent += '\n\n💡 **Suggestions:**\n' + aiResponse.suggestions.map(s => `• ${s}`).join('\n');
            }
            
            addMessage({
              type: 'ai',
              content: messageContent
            });
          }
          break;

        case 'create_token':
          // Use simple local parsing
          if (aiResponse.success && aiResponse.parameters) {
            // Successfully parsed the token request - create inline confirmation
            const confirmationMessage = createAIConfirmationMessage('token', aiResponse.parameters, inputMessage);
            setMessages(prev => [...prev, confirmationMessage]);
          } else {
            // Show intelligent response about what's missing
            let messageContent = aiResponse.message;
            
            if (aiResponse.missingParams?.length) {
              messageContent += `\n\n**Missing Information:** ${aiResponse.missingParams.join(', ')}`;
            }
            
            if (aiResponse.suggestions?.length) {
              messageContent += '\n\n💡 **Suggestions:**\n' + aiResponse.suggestions.map(s => `• ${s}`).join('\n');
            }
            
            addMessage({
              type: 'ai',
              content: messageContent
            });
          }
          break;

        case 'mint_nft':
          // Use conversational NFT creation system
          const nftResponse = await aiNFTManager.processUserInput(userMessage);
          
          // Check if the response contains deployment data (NFT creation confirmation)
          if (nftResponse.includes('_{"name"')) {
            // Extract deployment data and trigger actual NFT creation
            const match = nftResponse.match(/_(\{.*\})_/);
            if (match) {
              try {
                const deployData = JSON.parse(match[1]);
                
                // Get the current image file from NFT manager
                const nftState = aiNFTManager.getCurrentState();
                const imageFile = nftState.imageFile;
                
                // Create confirmation message for actual deployment
                const confirmationMessage = createAIConfirmationMessage('nft', {
                  name: deployData.name,
                  description: deployData.description,
                  quantity: deployData.quantity,
                  imageFile: imageFile  // Pass the actual File object
                }, userMessage);
                
                setMessages(prev => [...prev, confirmationMessage]);
                return;
              } catch (error) {
                console.error('Failed to parse deployment data:', error);
              }
            }
          }
          
          addMessage({
            type: 'ai',
            content: nftResponse
          });
          break;

        case 'help':
          addMessage({
            type: 'ai',
            content: getHelpMessage()
          });
          break;

        default:
          addMessage({
            type: 'ai',
            content: aiResponse.message
          });
      }
    } catch (error: any) {
      addMessage({
        type: 'ai',
        content: `❌ **Error**\n\nSomething went wrong: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addMessage({
        type: 'ai',
        content: `❌ **Invalid File Type**\n\nPlease upload a valid image file (JPEG, PNG, GIF, or WebP).`
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      addMessage({
        type: 'ai',
        content: `❌ **File Too Large**\n\nPlease upload an image smaller than 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`
      });
      return;
    }

    // Send file to NFT manager
    const response = aiNFTManager.setImageFile(file);
    console.log('Image uploaded:', file.name, 'New stage:', aiNFTManager.getCurrentState().stage);
    addMessage({
      type: 'ai',
      content: response
    });
    
    // Update NFT state to trigger re-render
    setNftState(aiNFTManager.getCurrentState());

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <div className={`message ${isUser ? 'message-user' : ''}`}>
        {/* Avatar */}
        <div className={`message-avatar ${
          isUser ? 'avatar-user' : isSystem ? 'avatar-system' : 'avatar-ai'
        }`}>
          {isUser ? (
            <User size={20} />
          ) : isSystem ? (
            <Sparkles size={20} />
          ) : (
            <Bot size={20} />
          )}
        </div>
        
        {/* Message Bubble */}
        <div className={`message-bubble ${
          isUser ? 'bubble-user' : isSystem ? 'bubble-system' : 'bubble-ai'
        }`}>
          <div 
            className="message-content"
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
          
          {/* Confirmation Actions */}
          {message.needsConfirmation && message.onConfirm && message.onCancel && (
            <div className="confirmation-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button
                onClick={message.onCancel}
                className="confirmation-btn cancel-btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #dc2626',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={message.onConfirm}
                className="confirmation-btn confirm-btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #16a34a',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#15803d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }}
              >
                <Check size={16} />
                {message.confirmationType === 'ai_deployment' ? 'Deploy' : 'Confirm'}
              </button>
            </div>
          )}
          
          {/* Message Actions */}
          {message.txHash && (
            <div className="message-actions">
              <button
                onClick={() => copyToClipboard(message.txHash || '')}
                className="message-action-btn"
                title="Copy transaction hash"
              >
                <Copy size={16} />
                <span>Copy Hash</span>
              </button>
              <a
                href={`${CONFIG.NETWORK.MAINNET.explorerUrl}/tx/${message.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="message-action-btn"
                title="View on Snowtrace"
              >
                <ExternalLink size={16} />
                <span>View Transaction</span>
              </a>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="message-timestamp">
            <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isUser && (
              <>
                <div style={{ width: '2px', height: '2px', background: 'var(--text-muted)', borderRadius: '50%' }}></div>
                <span>Delivered</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div>
            <h3 className="chat-title">AI Assistant</h3>
            <p className="chat-subtitle">Powered by advanced AI • Secure blockchain operations</p>
          </div>
          <div className="chat-status">
            <div className="network-indicator"></div>
            <span className="network-text">Online & Secure</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="message">
              <div className="message-avatar avatar-ai">
                <Bot size={20} />
              </div>
              <div className="message-bubble bubble-ai">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '12px 16px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: '64px'
        }}>
          
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (e.g., 'send 0.5 AVAX to alice' or 'create a token')"
              className="chat-input"
              rows={1}
              disabled={isLoading}
              style={{
                flex: '1',
                minHeight: '36px',
                maxHeight: '120px',
                resize: 'none',
                lineHeight: '1.4',
                fontSize: '14px',
                padding: '8px 12px',
                border: 'none',
                outline: 'none',
                background: 'transparent'
              }}
            />
            
            {/* Image Upload Button - Show only during NFT creation */}
            {nftState.stage === 'asking_image' || nftState.stage === 'asking_quantity' ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-btn"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid transparent',
                    transition: 'all 0.2s ease',
                    background: nftState.imageFile 
                      ? 'linear-gradient(135deg, #059669, #047857)' // Darker green if image uploaded
                      : 'linear-gradient(135deg, #10b981, #059669)', // Regular green if no image
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                  }}
                  title={nftState.imageFile ? `Image uploaded: ${nftState.imageFile.name}` : "Upload NFT Image"}
                >
                  <Upload size={16} className="text-white" />
                </button>
              </>
            ) : null}
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="chat-send-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid transparent',
                transition: 'all 0.2s ease',
                background: !inputMessage.trim() || isLoading 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
                boxShadow: !inputMessage.trim() || isLoading 
                  ? 'none' 
                  : '0 2px 8px rgba(99, 102, 241, 0.3)',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!(!inputMessage.trim() || isLoading)) {
                  e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '2px solid transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = !inputMessage.trim() || isLoading 
                  ? 'none' 
                  : '0 2px 8px rgba(99, 102, 241, 0.3)';
              }}
            >
              <ArrowUp size={16} style={{ 
                color: !inputMessage.trim() || isLoading ? 'rgba(255, 255, 255, 0.3)' : '#ffffff' 
              }} />
            </button>
          </div>

        </div>

      {showNFTWizard && (
        <NFTCreationWizard
          wallet={wallet}
          onClose={() => setShowNFTWizard(false)}
          onNFTCreated={(result: any) => {
            setShowNFTWizard(false);
            addMessage({
              type: 'ai',
              content: `✅ **NFT Created Successfully**\n\nYour NFT has been created!\n\n**Contract Address:** ${result.contractAddress}\n**Transaction Hash:** ${result.txHash}\n\nYou can view the NFT on [OKX Web3 Explorer](${getNFTExplorerLink(result.contractAddress, result.tokenId)}).`,
              txHash: result.txHash
            });
            onTransactionComplete();
          }}
          initialMessage={nftInitialMessage}
        />
      )}
    </>
  );
};
