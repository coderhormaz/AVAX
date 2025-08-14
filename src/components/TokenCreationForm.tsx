import React, { useState } from 'react';
import { X, Coins, AlertCircle } from 'lucide-react';
import { deployToken } from '../utils/blockchain';
import { getCurrentNetwork } from '../config';
import type { WalletData } from '../App';

interface TokenCreationFormProps {
  wallet: WalletData;
  onTokenCreated: (tokenData: any) => void;
  onClose: () => void;
}

export const TokenCreationForm: React.FC<TokenCreationFormProps> = ({
  wallet,
  onTokenCreated,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    initialSupply: '',
    decimals: '18'
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const network = getCurrentNetwork();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Token name is required');
      return false;
    }
    
    if (!formData.symbol.trim()) {
      setError('Token symbol is required');
      return false;
    }
    
    if (formData.symbol.length > 10) {
      setError('Token symbol must be 10 characters or less');
      return false;
    }
    
    const supply = parseInt(formData.initialSupply);
    if (!supply || supply <= 0) {
      setError('Initial supply must be a positive number');
      return false;
    }
    
    const decimals = parseInt(formData.decimals);
    if (decimals < 0 || decimals > 18) {
      setError('Decimals must be between 0 and 18');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsDeploying(true);
    setError(null);

    try {
      const result = await deployToken({
        privateKey: wallet.privateKey,
        name: formData.name.trim(),
        symbol: formData.symbol.trim().toUpperCase(),
        initialSupply: parseInt(formData.initialSupply),
        decimals: parseInt(formData.decimals)
      });

      if (result.success) {
        onTokenCreated({
          name: formData.name.trim(),
          symbol: formData.symbol.trim().toUpperCase(),
          contractAddress: result.txHash, // This would be the contract address
          explorerLink: result.explorerLink,
          txHash: result.txHash
        });
      } else {
        setError(result.error || 'Token deployment failed');
      }
    } catch (err: any) {
      setError(err.message || 'Token deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Coins className="h-5 w-5 text-avalanche-blue mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Create Token</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isDeploying}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Token Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., My Awesome Token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-avalanche-blue focus:border-transparent"
              disabled={isDeploying}
              maxLength={50}
            />
          </div>

          {/* Token Symbol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Symbol *
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              placeholder="e.g., MAT"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-avalanche-blue focus:border-transparent"
              disabled={isDeploying}
              maxLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">
              Usually 3-5 characters (e.g., BTC, ETH, AVAX)
            </p>
          </div>

          {/* Initial Supply */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Supply *
            </label>
            <input
              type="number"
              value={formData.initialSupply}
              onChange={(e) => handleInputChange('initialSupply', e.target.value)}
              placeholder="e.g., 1000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-avalanche-blue focus:border-transparent"
              disabled={isDeploying}
              min="1"
              step="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total number of tokens to create initially
            </p>
          </div>

          {/* Decimals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decimals
            </label>
            <input
              type="number"
              value={formData.decimals}
              onChange={(e) => handleInputChange('decimals', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-avalanche-blue focus:border-transparent"
              disabled={isDeploying}
              min="0"
              max="18"
            />
            <p className="text-xs text-gray-500 mt-1">
              Usually 18 (same as ETH). Determines divisibility of your token.
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

          {/* Network Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Deployment Info:</p>
              <ul className="text-xs space-y-1">
                <li>• Network: {network.name}</li>
                <li>• Gas Fee: ~0.02-0.03 {network.currency}</li>
                <li>• You will own 100% of the initial supply</li>
                <li>• Token will be fully transferable</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-avalanche-blue transition-colors"
              disabled={isDeploying}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-avalanche-blue text-white rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-avalanche-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isDeploying || !formData.name || !formData.symbol || !formData.initialSupply}
            >
              {isDeploying ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deploying...
                </div>
              ) : (
                'Deploy Token'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
