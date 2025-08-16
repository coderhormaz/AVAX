import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Key, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  Copy, 
  Shield, 
  Sparkles,
  Zap,
} from 'lucide-react';
import { generateRandomWallet, isValidPrivateKey } from '../utils/wallet';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (privateKey: string) => void;
  error: string | null;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ 
  isOpen, 
  onClose, 
  onConnect, 
  error 
}) => {
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [generatedWallet, setGeneratedWallet] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrivateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!privateKey.trim()) {
      setValidationError('Please enter a private key');
      return;
    }

    if (!isValidPrivateKey(privateKey)) {
      setValidationError('Invalid private key format');
      return;
    }

    onConnect(privateKey.trim());
  };

  const handleGenerateWallet = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const newWallet = generateRandomWallet();
      setGeneratedWallet(newWallet);
      setPrivateKey(newWallet.privateKey);
      setIsGenerating(false);
      setValidationError(null);
    }, 1000);
  };

  const handleCopyPrivateKey = async () => {
    if (generatedWallet?.privateKey) {
      await navigator.clipboard.writeText(generatedWallet.privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        <div className="wallet-modal-header">
          <div className="wallet-modal-title">
            <Wallet className="w-6 h-6 text-purple-400" />
            <h2>Connect Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="wallet-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="wallet-modal-content">
          {/* Direct Private Key Form - NO TABS */}
          <div className="wallet-tab-content">
            <div className="wallet-option">
              <form onSubmit={handlePrivateKeySubmit} className="private-key-form">
                <div className="form-group">
                  <label htmlFor="privateKey" className="form-label">
                    Private Key
                  </label>
                  <div className="input-container">
                    <Key size={20} className="input-icon" />
                    <input
                      id="privateKey"
                      type={showPrivateKey ? 'text' : 'password'}
                      value={privateKey}
                      onChange={(e) => {
                        setPrivateKey(e.target.value);
                        setValidationError(null);
                      }}
                      placeholder="Enter your private key (0x...)"
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="toggle-visibility"
                    >
                      {showPrivateKey ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Error Display */}
                {(error || validationError) && (
                  <div className="error-display">
                    <AlertCircle size={16} />
                    <span>{error || validationError}</span>
                  </div>
                )}

                {/* Generated Wallet Display */}
                {generatedWallet && (
                  <div className="generated-wallet">
                    <div className="generated-wallet-header">
                      <Sparkles size={16} />
                      <span>New Wallet Generated</span>
                    </div>
                    <div className="generated-wallet-info">
                      <div className="generated-wallet-field">
                        <label>Address:</label>
                        <div className="wallet-address">{generatedWallet.address}</div>
                      </div>
                      <div className="generated-wallet-field">
                        <label>Private Key:</label>
                        <div className="private-key-display">
                          <span>{generatedWallet.privateKey}</span>
                          <button
                            type="button"
                            onClick={handleCopyPrivateKey}
                            className="copy-btn"
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="generated-wallet-warning">
                      <Shield size={16} />
                      <span>Save your private key securely. You'll need it to recover your wallet.</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="wallet-actions">
                  <button
                    type="submit"
                    disabled={!privateKey.trim()}
                    className="btn btn-primary"
                  >
                    <Wallet size={20} />
                    Connect Wallet
                  </button>

                  <div className="wallet-actions-divider">
                    <span>or</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateWallet}
                    disabled={isGenerating}
                    className="btn btn-secondary"
                  >
                    {isGenerating ? (
                      <>
                        <div className="spinner"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate New Wallet
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Notice */}
          <div className="wallet-security-notice">
            <div className="security-header">
              <Shield size={16} />
              <span>Security First</span>
            </div>
            <ul className="security-points">
              <li>🔐 Your private keys never leave your browser</li>
              <li>🚫 Zero server storage - complete client-side security</li>
              <li>🛡️ Military-grade encryption for all operations</li>
            </ul>
          </div>

          {/* Requirements Banner */}
          <div className="requirements-banner">
            <Zap size={16} />
            <span>Minimum <strong>0.1 AVAX</strong> required to unlock AI features</span>
          </div>
        </div>
      </div>
    </div>
  );
};
