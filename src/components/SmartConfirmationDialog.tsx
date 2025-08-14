// Smart Confirmation Dialog for AI Token/NFT Deployment
// Shows parsed details and handles auto-deployment

import React, { useState } from 'react';
import { deployTokenForAI, deployNFTForAI } from './AIDeployment';
import type { WalletData } from '../App';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userPrompt: string;
  wallet: WalletData;
  imageFile?: File;
  // Parsed parameters
  parsedParams?: any;
  requestType?: 'token' | 'nft';
}

export const SmartConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  userPrompt,
  wallet,
  parsedParams,
  requestType
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [estimatedCost, setEstimatedCost] = useState<string>('');

  if (!isOpen) return null;

  // Use parsed parameters directly
  const tokenRequest = requestType === 'token' && parsedParams ? parsedParams : null;
  const nftRequest = requestType === 'nft' && parsedParams ? parsedParams : null;

  React.useEffect(() => {
    if (requestType === 'token' || requestType === 'nft') {
      // Estimate cost based on request type
      const cost = requestType === 'token' ? '~0.0125 AVAX' : '~0.0175 AVAX';
      setEstimatedCost(cost);
    }
  }, [requestType]);

  const handleConfirmDeploy = async () => {
    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      let result;
      
      if (tokenRequest) {
        console.log('🤖 AI: Deploying token automatically...', tokenRequest);
        result = await deployTokenForAI(
          tokenRequest.name,
          tokenRequest.ticker,
          tokenRequest.supply,
          wallet
        );
      } else if (nftRequest) {
        console.log('🤖 AI: Deploying NFT automatically...', nftRequest);
        
        // If no image file provided, create a simple placeholder
        let imageFile = nftRequest.imageFile;
        if (!imageFile) {
          console.log('📸 No image provided, creating placeholder NFT...');
          // Create a simple text-based placeholder "image"
          const canvas = document.createElement('canvas');
          canvas.width = 500;
          canvas.height = 500;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Create a simple colored background
            ctx.fillStyle = '#' + Math.floor(Math.random()*16777215).toString(16);
            ctx.fillRect(0, 0, 500, 500);
            
            // Add NFT name as text
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(nftRequest.name, 250, 250);
            ctx.fillText('NFT', 250, 320);
          }
          
          // Convert canvas to blob then to File
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png');
          });
          
          imageFile = new File([blob], `${nftRequest.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
        }
        
        result = await deployNFTForAI(
          nftRequest.name,
          nftRequest.description || '',
          imageFile,
          nftRequest.quantity || 1,
          wallet
        );
      } else {
        throw new Error('Missing required information for deployment');
      }

      setDeploymentResult(result);
    } catch (error) {
      setDeploymentResult({
        success: false,
        message: error instanceof Error ? error.message : 'Deployment failed'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClose = () => {
    setDeploymentResult(null);
    setIsDeploying(false);
    onClose();
  };

  if (!requestType || (!tokenRequest && !nftRequest)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">❓ Unable to Parse Request</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-2">I couldn't understand your request:</p>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              "{userPrompt}"
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Try examples like:</strong><br/>
              • "create token called AvaxTeam ticker AT supply 500"<br/>
              • "make nft called CoolArt with description amazing digital art"
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {requestType === 'token' ? '🪙 Confirm Token Deployment' : '🖼️ Confirm NFT Deployment'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        {/* Show deployment result if available */}
        {deploymentResult && (
          <div className={`mb-4 p-4 rounded-lg border ${
            deploymentResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">
                {deploymentResult.success ? '✅' : '❌'}
              </span>
              <span className="font-semibold">
                {deploymentResult.success ? 'Deployment Successful!' : 'Deployment Failed'}
              </span>
            </div>
            <p className="text-sm mb-2">{deploymentResult.message}</p>
            
            {deploymentResult.success && (
              <div className="text-xs space-y-1">
                <div><strong>Contract:</strong> {deploymentResult.contractAddress}</div>
                <div><strong>Transaction:</strong> {deploymentResult.transactionHash}</div>
                <div>
                  <a 
                    href={deploymentResult.explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View on Snowtrace →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User's original prompt */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Request:
          </label>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
            "{userPrompt}"
          </div>
        </div>

        {/* Parsed details */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Parsed Details:
          </label>
          
          {tokenRequest && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Token Name:</strong> {tokenRequest.name}</div>
                <div><strong>Symbol:</strong> {tokenRequest.ticker}</div>
                <div><strong>Supply:</strong> {tokenRequest.supply.toLocaleString()}</div>
                <div><strong>Decimals:</strong> {tokenRequest.decimals}</div>
              </div>
            </div>
          )}

          {nftRequest && (
            <div className="bg-purple-50 border border-purple-200 rounded p-3 space-y-2">
              <div className="text-sm space-y-1">
                <div><strong>NFT Name:</strong> {nftRequest.name}</div>
                <div><strong>Description:</strong> {nftRequest.description}</div>
                <div><strong>Quantity:</strong> {nftRequest.quantity}</div>
                <div><strong>Image:</strong> {
                  nftRequest.imageFile 
                    ? nftRequest.imageFile.name.includes(nftRequest.name.replace(/\s+/g, '_'))
                      ? '🎨 Auto-generated placeholder image'
                      : nftRequest.imageFile.name
                    : '🎨 Auto-generated placeholder image'
                }</div>
              </div>
            </div>
          )}
        </div>

        {/* Deployment info */}
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h4 className="font-medium text-yellow-800 mb-2">📋 Deployment Info:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• <strong>Network:</strong> Avalanche Mainnet</div>
              <div>• <strong>Estimated Cost:</strong> {estimatedCost || 'Calculating...'}</div>
              <div>• <strong>Auto-Signature:</strong> MetaMask will auto-sign</div>
              <div>• <strong>Ownership:</strong> You will own 100% of the {requestType}</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isDeploying}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmDeploy}
            disabled={isDeploying || deploymentResult?.success}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isDeploying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deploying...
              </>
            ) : deploymentResult?.success ? (
              '✅ Deployed'
            ) : (
              `🚀 Deploy ${requestType === 'token' ? 'Token' : 'NFT'} (${estimatedCost})`
            )}
          </button>
        </div>

        {/* Help text */}
        {!deploymentResult && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Clicking deploy will automatically sign the transaction and deploy to mainnet
          </div>
        )}
      </div>
    </div>
  );
};
