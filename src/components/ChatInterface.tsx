import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Sparkles, ArrowUp, Copy, ExternalLink } from 'lucide-react';
import { parseCommand, getHelpMessage } from '../utils/ai';
import { sendAvax, deployToken } from '../utils/blockchain';
import { TransactionConfirmation } from './TransactionConfirmation';
import { TokenCreationForm } from './TokenCreationForm';
import { NFTMintForm } from './NFTMintForm';
import { CONFIG } from '../config';
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
      content: `Welcome to Avalanche AI! 🚀\n\nI'm your intelligent blockchain assistant. I can help you:\n\n• Send AVAX to any address\n• Create custom tokens (ERC-20)\n• Mint NFTs with metadata\n• Check balances and transaction status\n• Answer blockchain questions\n\nJust type naturally, like "send 0.5 AVAX to alice" or "create a token called MyToken".\n\nWhat would you like to do today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<any>(null);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [showNFTForm, setShowNFTForm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
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

      // Parse command with AI
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
            setShowConfirmation({
              type: 'send_avax',
              parameters: aiResponse.parameters,
              message: aiResponse.message
            });
          } else {
            addMessage({
              type: 'ai',
              content: aiResponse.message + (aiResponse.missingParams?.length ? `\n\n**Missing Information:** ${aiResponse.missingParams.join(', ')}` : '')
            });
          }
          break;

        case 'create_token':
          if (aiResponse.needsConfirmation && aiResponse.parameters) {
            setShowConfirmation({
              type: 'create_token',
              parameters: aiResponse.parameters,
              message: aiResponse.message
            });
          } else {
            setShowTokenForm(true);
            addMessage({
              type: 'ai',
              content: '🪙 **Create Token**\n\nI\'ll help you create a custom ERC-20 token. Please fill out the token creation form with your token details.'
            });
          }
          break;

        case 'mint_nft':
          setShowNFTForm(true);
          addMessage({
            type: 'ai',
            content: '🎨 **Mint NFT**\n\nExciting! Let\'s create your NFT. Please upload your image and provide the metadata details in the form.'
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

  const handleTransactionConfirm = async (confirmed: boolean) => {
    if (!confirmed || !showConfirmation) {
      setShowConfirmation(null);
      return;
    }

    setIsLoading(true);
    const { type, parameters } = showConfirmation;

    try {
      let result: any;
      if (type === 'send_avax') {
        result = await sendAvax({
          privateKey: wallet.privateKey,
          to: parameters.to,
          amount: parameters.amount
        });
        addMessage({
          type: 'ai',
          content: `✅ **Transaction Successful**\n\nSent **${parameters.amount} AVAX** to **${parameters.to}**\n\n**Transaction Hash:** ${result.txHash}\n\nYou can view the transaction on [Snowtrace](https://snowtrace.io/tx/${result.txHash}).`,
          txHash: result.txHash
        });
      } else if (type === 'create_token') {
        result = await deployToken({
          privateKey: wallet.privateKey,
          name: parameters.name,
          symbol: parameters.symbol,
          initialSupply: parameters.initialSupply,
          decimals: parameters.decimals || 18
        });
        addMessage({
          type: 'ai',
          content: `✅ **Token Created Successfully**\n\nYour token **${parameters.name} (${parameters.symbol})** has been deployed!\n\n**Contract Address:** ${result.contractAddress}\n**Transaction Hash:** ${result.txHash}\n\nYou can view the contract on [Snowtrace](https://snowtrace.io/address/${result.contractAddress}).`,
          txHash: result.txHash
        });
      }

      onTransactionComplete();
    } catch (error: any) {
      addMessage({
        type: 'ai',
        content: `❌ **Transaction Failed**\n\n${error.message || 'An unexpected error occurred.'}`
      });
    } finally {
      setIsLoading(false);
      setShowConfirmation(null);
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
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (e.g., 'send 0.5 AVAX to alice' or 'create a token')"
              className="chat-input"
              rows={1}
              disabled={isLoading}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="chat-send-btn"
            >
              <ArrowUp size={18} />
            </button>
          </div>
          
          <div className="chat-input-hint">
            Press Enter to send • Shift + Enter for new line • Powered by Advanced AI
          </div>
        </div>
      </div>

      {/* Modals */}
      {showConfirmation && (
        <TransactionConfirmation
          type={showConfirmation.type}
          parameters={showConfirmation.parameters}
          wallet={wallet}
          onConfirm={handleTransactionConfirm}
        />
      )}

      {showTokenForm && (
        <TokenCreationForm
          wallet={wallet}
          onClose={() => setShowTokenForm(false)}
          onTokenCreated={(result: any) => {
            setShowTokenForm(false);
            addMessage({
              type: 'ai',
              content: `✅ **Token Created Successfully**\n\nYour token has been deployed!\n\n**Contract Address:** ${result.contractAddress}\n**Transaction Hash:** ${result.txHash}`,
              txHash: result.txHash
            });
            onTransactionComplete();
          }}
        />
      )}

      {showNFTForm && (
        <NFTMintForm
          wallet={wallet}
          onClose={() => setShowNFTForm(false)}
          onNFTMinted={(result: any) => {
            setShowNFTForm(false);
            addMessage({
              type: 'ai',
              content: `✅ **NFT Minted Successfully**\n\nYour NFT has been created!\n\n**Token ID:** ${result.tokenId}\n**Transaction Hash:** ${result.txHash}`,
              txHash: result.txHash
            });
            onTransactionComplete();
          }}
        />
      )}
    </>
  );
};
