// Smart AI Input Component - Natural Language Token/NFT Creation
// Replaces manual forms with intelligent prompt parsing

import React, { useState, useRef } from 'react';
import { SmartConfirmationDialog } from './SmartConfirmationDialog';
import { AIPromptParser } from '../utils/aiPromptParser';
import type { WalletData } from '../App';

interface SmartAIInputProps {
  wallet: WalletData;
}

export const SmartAIInput: React.FC<SmartAIInputProps> = ({ wallet }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    setIsProcessing(true);
    
    // Small delay for UX (shows processing state)
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmation(true);
    }, 500);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    // Optionally clear the input after successful deployment
  };

  const examplePrompts = [
    "create token called AvaxTeam ticker AT supply 500",
    "make token named Bitcoin Gold symbol BTG with 1000000 supply",
    "deploy token MyToken (MT) 50000 tokens",
    "create nft called CoolArt with description amazing digital art",
    "make nft PixelPunk quantity 5",
    "deploy nft collection GameItems"
  ];

  const handleExampleClick = (example: string) => {
    setUserPrompt(example);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 AI Token & NFT Creator
        </h1>
        <p className="text-gray-600">
          Just tell me what you want to create in natural language
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="ai-prompt" className="block text-lg font-medium text-gray-900 mb-3">
            💬 What do you want to create?
          </label>
          
          <textarea
            id="ai-prompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="e.g., create a token called AvaxTeam ticker AT supply 500..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
            rows={3}
            disabled={isProcessing}
          />
        </div>

        {/* Image Upload for NFTs */}
        <div className="mb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
              disabled={isProcessing}
            >
              🖼️ Add Image (for NFTs)
            </button>
            
            {selectedImage && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📎 {selectedImage.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!userPrompt.trim() || isProcessing}
          className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              🚀 Create with AI
            </>
          )}
        </button>
      </form>

      {/* Examples Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Example Commands:</h3>
        
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-2">🪙 Token Examples:</div>
          {examplePrompts.slice(0, 3).map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm text-gray-700 transition-colors"
            >
              "{example}"
            </button>
          ))}
          
          <div className="text-sm font-medium text-gray-700 mb-2 mt-4">🖼️ NFT Examples:</div>
          {examplePrompts.slice(3).map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="block w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded text-sm text-gray-700 transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Smart Preview */}
      {userPrompt && !isProcessing && (
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h4 className="font-medium text-gray-900 mb-2">🔍 AI Preview:</h4>
          <AIPreview prompt={userPrompt} imageFile={selectedImage} />
        </div>
      )}

      {/* Confirmation Dialog */}
      <SmartConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        userPrompt={userPrompt}
        wallet={wallet}
        imageFile={selectedImage || undefined}
      />
    </div>
  );
};

// Preview component to show parsed details
const AIPreview: React.FC<{ prompt: string; imageFile?: File | null }> = ({ prompt, imageFile }) => {
  const requestType = AIPromptParser.getRequestType(prompt);
  const tokenRequest = requestType === 'token' ? AIPromptParser.parseTokenRequest(prompt) : null;
  const nftRequest = requestType === 'nft' ? AIPromptParser.parseNFTRequest(prompt, imageFile || undefined) : null;

  if (requestType === 'unknown') {
    return (
      <div className="text-yellow-600 text-sm">
        ⚠️ I'm not sure if this is for a token or NFT. Try being more specific.
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium">
          {requestType === 'token' ? '🪙 Token' : '🖼️ NFT'}
        </span>
        <span className="text-green-600">✓ Understood</span>
      </div>
      
      {tokenRequest && (
        <div className="bg-blue-50 p-2 rounded text-xs space-y-1">
          <div><strong>Name:</strong> {tokenRequest.name}</div>
          <div><strong>Symbol:</strong> {tokenRequest.ticker}</div>
          <div><strong>Supply:</strong> {tokenRequest.supply.toLocaleString()}</div>
        </div>
      )}
      
      {nftRequest && (
        <div className="bg-purple-50 p-2 rounded text-xs space-y-1">
          <div><strong>Name:</strong> {nftRequest.name}</div>
          <div><strong>Description:</strong> {nftRequest.description}</div>
          <div><strong>Quantity:</strong> {nftRequest.quantity}</div>
          {imageFile && <div><strong>Image:</strong> {imageFile.name}</div>}
        </div>
      )}
    </div>
  );
};
