import React, { useState, useRef } from 'react';
import { Bot, Upload, CheckCircle, ArrowRight, X, AlertCircle, ExternalLink } from 'lucide-react';
import { uploadImageForNFT } from '../services/ipfs';
import { IPFSImage } from '../utils/ipfsUtils';
import { ethers } from 'ethers';
import { CONFIG, getNFTExplorerLink, getExplorerLink, getContractExplorerLink } from '../config';
import type { WalletData } from '../App';

interface NFTCreationWizardProps {
  wallet: WalletData;
  onClose: () => void;
  onNFTCreated: (result: any) => void;
  initialMessage?: string;
}

interface NFTData {
  name: string;
  description: string;
  image: File | null;
  quantity: number;
  imageURI?: string;
  metadataURI?: string;
}

type WizardStep = 'choice' | 'name' | 'description' | 'image' | 'quantity' | 'confirm' | 'uploading' | 'minting' | 'complete' | 'error';

// MasterFactory Contract ABI (only the functions we need)
const MASTER_FACTORY_ABI = [
  "function createNFT(string memory nftName, string memory description, string memory imageURI, uint256 quantity) public returns (address nftContract)",
  "function getUserContracts(address user) public view returns (address[] memory tokens, address[] memory nfts)"
];

export const NFTCreationWizard: React.FC<NFTCreationWizardProps> = ({
  wallet,
  onClose,
  onNFTCreated,
  initialMessage = ''
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('choice');
  const [nftData, setNftData] = useState<NFTData>({
    name: '',
    description: '',
    image: null,
    quantity: 1
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [nftContractAddress, setNftContractAddress] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse initial message if provided
  React.useEffect(() => {
    if (initialMessage.toLowerCase().includes('create')) {
      handleUserMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    switch (currentStep) {
      case 'choice':
        if (lowerMessage.includes('nft')) {
          // Check if name/description already provided
          const nameMatch = message.match(/(?:called|named|name|create)\s+["']?([^"',.!?]+)["']?/i);
          if (nameMatch) {
            const extractedName = nameMatch[1].trim();
            // Filter out common words
            const filteredName = extractedName.replace(/\b(nft|token|called|named|create|an?|the)\b/gi, '').trim();
            if (filteredName) {
              setNftData(prev => ({ ...prev, name: filteredName }));
              setCurrentStep('description');
            } else {
              setCurrentStep('name');
            }
          } else {
            setCurrentStep('name');
          }
        } else if (lowerMessage.includes('token')) {
          setErrorMessage('Token creation is handled in the main chat. Please use the NFT wizard for NFT creation only.');
          setCurrentStep('error');
        }
        break;
        
      case 'name':
        if (message.trim()) {
          setNftData(prev => ({ ...prev, name: message.trim() }));
          setCurrentStep('description');
        }
        break;
        
      case 'description':
        if (lowerMessage.includes('skip') || lowerMessage.includes('no') || lowerMessage.includes('none')) {
          setNftData(prev => ({ ...prev, description: '' }));
          setCurrentStep('image');
        } else if (message.trim()) {
          setNftData(prev => ({ ...prev, description: message.trim() }));
          setCurrentStep('image');
        }
        break;
        
      case 'quantity':
        const quantity = parseInt(message);
        if (!isNaN(quantity) && quantity > 0 && quantity <= 1000) {
          setNftData(prev => ({ ...prev, quantity }));
          setCurrentStep('confirm');
        } else {
          setErrorMessage('Please enter a valid quantity between 1 and 1000.');
        }
        break;
    }
    setUserInput('');
    setErrorMessage('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files.length > 1) {
        setErrorMessage('Please select only one image. Multiple images are not allowed.');
        return;
      }
      
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file (JPEG, PNG, GIF, or WebP).');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Image file must be smaller than 10MB.');
        return;
      }
      
      setNftData(prev => ({ ...prev, image: file }));
      setCurrentStep('quantity');
      setErrorMessage('');
    }
  };

  const uploadToIPFS = async () => {
    if (!nftData.image) {
      throw new Error('No image selected');
    }

    setCurrentStep('uploading');
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { imageURI, metadataURI } = await uploadImageForNFT(
        nftData.image,
        nftData.name,
        nftData.description
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setNftData(prev => ({
        ...prev,
        imageURI,
        metadataURI
      }));

      // Wait a moment to show 100% progress
      setTimeout(() => {
        setCurrentStep('minting');
      }, 500);

    } catch (error: any) {
      setErrorMessage(`Failed to upload to IPFS: ${error.message}`);
      setCurrentStep('error');
    }
  };

  const mintNFT = async () => {
    if (!nftData.imageURI) {
      throw new Error('Image not uploaded to IPFS');
    }

    try {
      // Create provider and signer
      const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.MAINNET.rpcUrl);
      const signer = new ethers.Wallet(wallet.privateKey, provider);

      // Create contract instance
      const masterFactory = new ethers.Contract(
        CONFIG.CONTRACTS.MASTER_FACTORY || "0x1234567890123456789012345678901234567890",
        MASTER_FACTORY_ABI,
        signer
      );

      // Call createNFT function
      console.log('Creating NFT with params:', {
        name: nftData.name,
        description: nftData.description,
        imageURI: nftData.imageURI,
        quantity: nftData.quantity
      });

      const tx = await masterFactory.createNFT(
        nftData.name,
        nftData.description,
        nftData.imageURI,
        nftData.quantity
      );

      setTxHash(tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract NFT contract address from logs
      // This is a simplified approach - in practice, you'd parse the actual event logs
      let contractAddress = '';
      if (receipt.logs && receipt.logs.length > 0) {
        // This is a placeholder - actual implementation would parse the createNFT event
        contractAddress = receipt.logs[0].address;
      }

      setNftContractAddress(contractAddress);
      setCurrentStep('complete');

      // Call parent callback
      onNFTCreated({
        name: nftData.name,
        description: nftData.description,
        quantity: nftData.quantity,
        txHash: tx.hash,
        contractAddress,
        imageURI: nftData.imageURI,
        metadataURI: nftData.metadataURI
      });

    } catch (error: any) {
      console.error('NFT minting error:', error);
      setErrorMessage(`Failed to mint NFT: ${error.reason || error.message}`);
      setCurrentStep('error');
    }
  };

  const handleCreateNFT = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // First upload to IPFS
      await uploadToIPFS();
      // Then mint NFT (this will be called automatically after IPFS upload)
    } catch (error: any) {
      setErrorMessage(`Failed to create NFT: ${error.message}`);
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-mint after IPFS upload
  React.useEffect(() => {
    if (currentStep === 'minting' && nftData.imageURI) {
      mintNFT();
    }
  }, [currentStep, nftData.imageURI]);

  const getCurrentMessage = () => {
    switch (currentStep) {
      case 'choice':
        return "Do you want to create a **Token** or an **NFT**?";
      case 'name':
        return "Please provide a name for your NFT.";
      case 'description':
        return "Would you like to add a description? (optional - type 'skip' to continue)";
      case 'image':
        return "Please upload exactly one image from your gallery to use as your NFT artwork. Only one image is allowed.";
      case 'quantity':
        return "How many NFTs would you like to mint? (1-1000)";
      case 'confirm':
        return "Perfect! Let me confirm your NFT details before creating it.";
      case 'uploading':
        return "Uploading your image to IPFS for decentralized storage...";
      case 'minting':
        return "Minting your NFT on the Avalanche blockchain...";
      case 'complete':
        return "🎉 Your NFT has been created successfully!";
      case 'error':
        return "❌ Something went wrong. Please try again.";
      default:
        return "";
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const renderStepContent = () => {
    if (currentStep === 'error') {
      return (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle size={16} />
              <span className="font-semibold">Error</span>
            </div>
            <p className="text-red-300">{errorMessage}</p>
          </div>
          <button
            onClick={() => {
              setCurrentStep('choice');
              setErrorMessage('');
              setNftData({ name: '', description: '', image: null, quantity: 1 });
            }}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            Start Over
          </button>
        </div>
      );
    }

    if (currentStep === 'uploading') {
      return (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <Upload size={16} />
              <span className="font-semibold">Uploading to IPFS</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-blue-300">{uploadProgress}% complete</p>
          </div>
        </div>
      );
    }

    if (currentStep === 'minting') {
      return (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-purple-400 mb-3">
              <CheckCircle size={16} />
              <span className="font-semibold">Minting NFT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-purple-300">Creating your NFT on the blockchain...</span>
            </div>
            {txHash && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-black/30 px-2 py-1 rounded font-mono">{txHash.slice(0, 20)}...</code>
                  <a
                    href={`${CONFIG.NETWORK.MAINNET.explorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 'choice':
        return (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleUserMessage('nft')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
            >
              Create NFT
            </button>
            <button
              onClick={() => handleUserMessage('token')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Create Token
            </button>
          </div>
        );

      case 'name':
      case 'description':
      case 'quantity':
        return (
          <div className="mt-4 space-y-3">
            {errorMessage && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {errorMessage}
              </div>
            )}
            <input
              type={currentStep === 'quantity' ? 'number' : 'text'}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUserMessage(userInput)}
              placeholder={
                currentStep === 'name' ? 'Enter NFT name...' :
                currentStep === 'description' ? 'Enter description or type "skip"...' :
                'Enter quantity (1-1000)...'
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              min={currentStep === 'quantity' ? "1" : undefined}
              max={currentStep === 'quantity' ? "1000" : undefined}
            />
            <button
              onClick={() => handleUserMessage(userInput)}
              disabled={!userInput.trim()}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        );

      case 'image':
        return (
          <div className="mt-4 space-y-3">
            {errorMessage && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {errorMessage}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-8 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Upload size={32} className="mx-auto mb-2" />
              <p>Click to upload image</p>
              <p className="text-sm">Only one image allowed (max 10MB)</p>
              <p className="text-xs text-gray-500 mt-1">Supported: JPEG, PNG, GIF, WebP</p>
            </button>
            
            {nftData.image && (
              <div className="space-y-3">
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={16} />
                    <span>Image selected: {nftData.image.name}</span>
                  </div>
                  <p className="text-xs text-green-300 mt-1">
                    Size: {(nftData.image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                {/* Image Preview */}
                <div className="relative">
                  <img
                    src={URL.createObjectURL(nftData.image)}
                    alt="NFT Preview"
                    className="w-full max-w-xs mx-auto rounded-lg border border-gray-600"
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                  />
                  <div className="text-center mt-2 text-sm text-gray-400">Preview</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'confirm':
        return (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg space-y-3">
              <h4 className="font-semibold text-purple-400">NFT Details:</h4>
              <div><strong>Name:</strong> {nftData.name}</div>
              {nftData.description && <div><strong>Description:</strong> {nftData.description}</div>}
              <div><strong>Quantity:</strong> {nftData.quantity}</div>
              <div className="text-sm text-gray-400">
                <strong>Wallet:</strong> {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </div>
              
              {/* Image Preview */}
              {nftData.image && (
                <div className="space-y-2">
                  <div><strong>Image:</strong> {nftData.image.name}</div>
                  <img
                    src={URL.createObjectURL(nftData.image)}
                    alt="NFT Preview"
                    className="w-full max-w-xs rounded-lg border border-gray-600"
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                  />
                </div>
              )}
              
              {!nftData.image && (
                <div className="text-gray-500">No image selected - a placeholder will be generated</div>
              )}
            </div>
            
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
              <strong>What happens next:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Upload image to IPFS (decentralized storage)</li>
                <li>Create NFT metadata</li>
                <li>Mint NFT on Avalanche blockchain</li>
                <li>Transfer NFT to your wallet</li>
              </ol>
            </div>
            
            <button
              onClick={handleCreateNFT}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg text-white font-medium transition-all"
            >
              {isProcessing ? 'Creating NFT...' : 'Create NFT'}
            </button>
          </div>
        );

      case 'complete':
        return (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="text-center text-green-400">
                <CheckCircle size={48} className="mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">NFT Created Successfully!</h3>
                <p className="text-sm opacity-80 mb-4">Your NFT "{nftData.name}" has been minted to the blockchain.</p>
                
                <div className="space-y-2 text-left">
                  <div><strong>Name:</strong> {nftData.name}</div>
                  {nftData.description && <div><strong>Description:</strong> {nftData.description}</div>}
                  <div><strong>Quantity:</strong> {nftData.quantity}</div>
                  
                  {/* IPFS Image Display */}
                  {nftData.imageURI && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <strong>IPFS Image:</strong>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${nftData.imageURI.replace('ipfs://', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-xs"
                        >
                          View on IPFS <ExternalLink size={12} className="inline" />
                        </a>
                      </div>
                      <IPFSImage
                        src={nftData.imageURI}
                        alt={nftData.name}
                        className="w-full max-w-xs rounded-lg border border-gray-600"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                        onLoad={() => console.log('✅ IPFS image loaded successfully')}
                        onError={() => console.warn('❌ All IPFS gateways failed')}
                        fallbackText="IPFS image unavailable"
                      />
                    </div>
                  )}
                  
                  {nftContractAddress && (
                    <div className="flex items-center gap-2">
                      <strong>Contract:</strong> 
                      <code className="text-xs bg-black/30 px-1 rounded">{nftContractAddress.slice(0, 10)}...</code>
                      <a
                        href={getContractExplorerLink(nftContractAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300"
                        title="View contract on OKX Web3 Explorer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                  
                  {/* NFT Collection Link */}
                  {nftContractAddress && (
                    <div className="flex items-center gap-2">
                      <strong>View NFT:</strong>
                      <a
                        href={getNFTExplorerLink(nftContractAddress, 1)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 text-sm underline"
                        title="View NFT on OKX Web3 Explorer"
                      >
                        Open in OKX Explorer <ExternalLink size={12} className="inline" />
                      </a>
                    </div>
                  )}
                  
                  {txHash && (
                    <div className="flex items-center gap-2">
                      <strong>Transaction:</strong>
                      <code className="text-xs bg-black/30 px-1 rounded">{txHash.slice(0, 10)}...</code>
                      <a
                        href={getExplorerLink(txHash, 'tx')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300"
                        title="View transaction on OKX Web3 Explorer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepNumber = () => {
    const steps = ['choice', 'name', 'description', 'image', 'quantity', 'confirm'];
    return steps.indexOf(currentStep) + 1;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">NFT Creation Wizard</h2>
              <p className="text-sm text-gray-400">AI-guided NFT creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Indicator */}
        {!['uploading', 'minting', 'complete', 'error'].includes(currentStep) && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Step {getStepNumber()} of 6</span>
              <span>{Math.round((getStepNumber() / 6) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getStepNumber() / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* AI Message */}
        <div className="mb-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div 
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(getCurrentMessage()) }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
};
