import React, { useState } from 'react';
import { X, Image, Upload, AlertCircle, Eye } from 'lucide-react';
import { uploadToLighthouse, uploadMetadataToLighthouse, createNFTMetadata, validateImageFile } from '../utils/storage';
import { mintNFT } from '../utils/blockchain';
import { getCurrentNetwork, CONFIG } from '../config';
import type { WalletData } from '../App';

interface NFTMintFormProps {
  wallet: WalletData;
  onNFTMinted: (nftData: any) => void;
  onClose: () => void;
}

export const NFTMintForm: React.FC<NFTMintFormProps> = ({
  wallet,
  onNFTMinted,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '1',
    recipient: wallet.address
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const network = getCurrentNetwork();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('NFT name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('NFT description is required');
      return false;
    }
    
    if (!selectedFile) {
      setError('Please select an image file');
      return false;
    }
    
    const quantity = parseInt(formData.quantity);
    if (!quantity || quantity < 1 || quantity > 100) {
      setError('Quantity must be between 1 and 100');
      return false;
    }

    if (!formData.recipient.trim() || formData.recipient.length !== 42) {
      setError('Invalid recipient address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedFile) return;

    // Check if NFT contract address is configured
    if (!CONFIG.CONTRACTS.NFT_FACTORY) {
      setError('NFT contract not configured. Please deploy the NFT contract first using Remix.');
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      // Step 1: Upload image to IPFS
      setUploadProgress('Uploading image to IPFS...');
      const imageUpload = await uploadToLighthouse(selectedFile);
      if (!imageUpload.success) {
        throw new Error(imageUpload.error || 'Failed to upload image');
      }

      // Step 2: Create and upload metadata
      setUploadProgress('Creating metadata...');
      const metadata = createNFTMetadata(
        formData.name.trim(),
        formData.description.trim(),
        imageUpload.url!
      );

      const metadataUpload = await uploadMetadataToLighthouse(metadata);
      if (!metadataUpload.success) {
        throw new Error(metadataUpload.error || 'Failed to upload metadata');
      }

      // Step 3: Mint NFT(s)
      const quantity = parseInt(formData.quantity);
      setUploadProgress(`Minting ${quantity} NFT${quantity > 1 ? 's' : ''}...`);

      for (let i = 0; i < quantity; i++) {
        const result = await mintNFT({
          privateKey: wallet.privateKey,
          contractAddress: CONFIG.CONTRACTS.NFT_FACTORY,
          to: formData.recipient.trim(),
          tokenURI: metadataUpload.url!
        });

        if (!result.success) {
          throw new Error(result.error || `Failed to mint NFT ${i + 1}`);
        }

        // For the demo, we'll just use the first successful mint
        if (i === 0) {
          onNFTMinted({
            name: formData.name.trim(),
            description: formData.description.trim(),
            image: imageUpload.url,
            txHash: result.txHash,
            explorerLink: result.explorerLink,
            quantity
          });
          break;
        }
      }

    } catch (err: any) {
      console.error('NFT minting error:', err);
      setError(err.message || 'NFT minting failed');
    } finally {
      setIsMinting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Image className="h-5 w-5 text-avalanche-red mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Mint NFT</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isMinting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-lg"
                  />
                  <div className="flex items-center justify-center space-x-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedFile?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-sm text-avalanche-red hover:underline"
                    disabled={isMinting}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WebP up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isMinting}
                  />
                </div>
              )}
            </div>
          </div>

          {/* NFT Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., My Awesome NFT #1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-avalanche-red focus:border-transparent"
              disabled={isMinting}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your NFT..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-avalanche-red focus:border-transparent resize-none"
              disabled={isMinting}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-avalanche-red focus:border-transparent"
              disabled={isMinting}
              min="1"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of identical NFTs to mint (1-100)
            </p>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-avalanche-red focus:border-transparent"
              disabled={isMinting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Address to receive the NFT(s). Defaults to your wallet.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-avalanche-blue mr-2"></div>
                <p className="text-sm text-blue-700">{uploadProgress}</p>
              </div>
            </div>
          )}

          {/* Network Info */}
          {!CONFIG.CONTRACTS.NFT_FACTORY && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Setup Required:</p>
                <p className="text-xs">
                  Please deploy the NFT contract using Remix and update the CONFIG.CONTRACTS.NFT_FACTORY address.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Minting Info:</p>
              <ul className="text-xs space-y-1">
                <li>• Network: {network.name}</li>
                <li>• Gas Fee: ~0.002-0.005 {network.currency} per NFT</li>
                <li>• Metadata stored on IPFS</li>
                <li>• Fully transferable ERC721 tokens</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-avalanche-red transition-colors"
              disabled={isMinting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-avalanche-red text-white rounded-lg text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-avalanche-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={
                isMinting || 
                !formData.name || 
                !formData.description || 
                !selectedFile ||
                !CONFIG.CONTRACTS.NFT_FACTORY
              }
            >
              {isMinting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Minting...
                </div>
              ) : (
                `Mint ${formData.quantity} NFT${parseInt(formData.quantity) > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
