import React, { useState } from 'react';
import { QrCode, Copy, RefreshCw, ExternalLink, AlertTriangle, Wallet2, LogOut, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import { formatAddress } from '../utils/wallet';
import { getCurrentNetwork, CONFIG } from '../config';
import type { WalletData } from '../App';

interface WalletInfoProps {
  wallet: WalletData;
  onRefresh: () => void;
  onDisconnect?: () => void;
}

export const WalletInfo: React.FC<WalletInfoProps> = ({ wallet, onRefresh, onDisconnect }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const network = getCurrentNetwork();
  const balance = parseFloat(wallet.balance);
  const hasMinBalance = balance >= CONFIG.WALLET.MIN_AVAX_BALANCE;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const openExplorer = () => {
    const url = `${network.explorerUrl}/address/${wallet.address}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Claude-Inspired Wallet Card */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-orange rounded-lg flex items-center justify-center">
              <Wallet2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AVAX Wallet</h3>
              <p className="text-sm text-gray-400">Avalanche C-Chain</p>
            </div>
          </div>

          {/* Balance Display */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-white">{balance.toFixed(4)}</span>
              <span className="text-lg text-gray-300">AVAX</span>
            </div>
            {!hasMinBalance && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Low balance - consider adding funds</span>
              </div>
            )}
          </div>

          {/* Address Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Wallet Address
            </label>
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-1 min-w-0 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm font-mono text-gray-200 overflow-hidden">
                <span className="block truncate">{formatAddress(wallet.address)}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={handleCopyAddress}
                  className="btn btn-ghost btn-sm"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowQR(true)}
                  className="btn btn-secondary btn-sm"
                  title="Show QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
            {copied && (
              <p className="text-sm" style={{ color: '#ff6b35' }}>Address copied!</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn btn-secondary flex-1"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={openExplorer}
              className="btn btn-ghost"
              title="View on Explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            {onDisconnect && (
              <button
                onClick={onDisconnect}
                className="btn btn-ghost text-red-400 hover:text-red-300"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Claude-Style QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="qr-header">
                <div className="qr-icon">
                  QR
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Receive AVAX</h2>
                  <p className="text-sm text-gray-400">Scan QR code or copy address below</p>
                </div>
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-content">
              {/* QR Code */}
              <div className="qr-container">
                <QRCode
                  value={wallet.address}
                  size={200}
                  level="M"
                />
              </div>

              {/* Address Section */}
              <div className="qr-address">
                <div className="qr-address-label">
                  Public Address
                </div>
                <div className="qr-address-value">
                  {wallet.address}
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="btn btn-primary btn-sm w-full"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={openExplorer}
                className="btn btn-secondary"
              >
                <ExternalLink className="w-4 h-4" />
                Explorer
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="btn btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
