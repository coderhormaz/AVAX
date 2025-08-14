import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatAddress } from '../utils/wallet';
import { getCurrentNetwork } from '../config';
import type { WalletData } from '../App';

interface TransactionConfirmationProps {
  type: 'send_avax' | 'create_token';
  parameters: any;
  onConfirm: (confirmed: boolean) => void;
  wallet: WalletData;
}

export const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({
  type,
  parameters,
  onConfirm,
  wallet
}) => {
  const network = getCurrentNetwork();

  const renderTransactionDetails = () => {
    switch (type) {
      case 'send_avax':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">From</label>
                <code className="text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                  {formatAddress(wallet.address)}
                </code>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">To</label>
                <code className="text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                  {formatAddress(parameters.to)}
                </code>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Amount</label>
                <span className="text-gray-900 font-medium">
                  {parameters.amount} {network.currency}
                </span>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Transaction Details</p>
                  <p>Please verify the recipient address carefully. This transaction cannot be reversed.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'create_token':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">Token Name</label>
                <span className="text-gray-900 font-medium">{parameters.name}</span>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Symbol</label>
                <span className="text-gray-900 font-medium">{parameters.symbol}</span>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Initial Supply</label>
                <span className="text-gray-900 font-medium">
                  {parameters.initialSupply.toLocaleString()}
                </span>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Decimals</label>
                <span className="text-gray-900 font-medium">{parameters.decimals || 18}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-blue-600 mr-2" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Token Deployment</p>
                  <p>This will create a new ERC20 token contract on {network.name}. Gas fees apply.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTransactionTitle = () => {
    switch (type) {
      case 'send_avax':
        return 'Confirm AVAX Transfer';
      case 'create_token':
        return 'Confirm Token Deployment';
      default:
        return 'Confirm Transaction';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {getTransactionTitle()}
          </h3>
          <button
            onClick={() => onConfirm(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTransactionDetails()}

          {/* Current Balance */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Current Balance</span>
              <span className="text-gray-900 font-medium">
                {parseFloat(wallet.balance).toFixed(4)} {network.currency}
              </span>
            </div>
          </div>

          {/* Estimated Gas */}
          <div className="mt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Estimated Gas Fee</span>
              <span className="text-gray-900 font-medium">
                ~0.002 {network.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={() => onConfirm(false)}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-avalanche-blue transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="flex-1 py-2 px-4 bg-avalanche-red text-white rounded-lg text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-avalanche-red transition-colors"
          >
            Confirm Transaction
          </button>
        </div>
      </div>
    </div>
  );
};
