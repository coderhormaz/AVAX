import React, { useState } from 'react';
import { Wallet, Key, Shield, AlertCircle, Sparkles, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { generateRandomWallet, isValidPrivateKey } from '../utils/wallet';
import { getCurrentNetwork } from '../config';

interface WalletConnectProps {
  onConnect: (privateKey: string) => void;
  error: string | null;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, error }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const network = getCurrentNetwork();

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Add small delay for UX
    setTimeout(() => {
      const newWallet = generateRandomWallet();
      setPrivateKey(newWallet.privateKey);
      setIsGenerating(false);
      setValidationError(null);
    }, 500);
  };

  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(e.target.value);
    setValidationError(null);
  };

  return (
    <div className="welcome-screen">
      <div className="premium-bg"></div>

      <div className="welcome-container fade-in">
        {/* Header */}
        <div className="welcome-header">
          <div className="welcome-icon-container">
            <div className="welcome-icon">
              <Sparkles size={40} color="white" />
              <div className="welcome-icon-badge">
                <Zap size={16} color="white" />
              </div>
            </div>
          </div>
          
          <h1 className="welcome-title">
            Welcome to Avalanche AI
          </h1>
          
          <p className="welcome-subtitle">
            Professional Blockchain Assistant
          </p>
          
          <p className="welcome-description">
            Connect your wallet to unlock advanced AI features
          </p>
        </div>

        {/* Network Status */}
        <div className="network-status">
          <div className="network-card">
            <div className="network-content">
              <div className="network-indicator">
                <div className="network-dot"></div>
                <div className="network-ping"></div>
              </div>
              <div className="network-info">
                <h3>Live on {network.name}</h3>
                <p>Chain ID: {network.chainId}</p>
              </div>
              <Shield size={20} color="#fca5a5" style={{ marginLeft: 'auto' }} />
            </div>
          </div>
        </div>

        {/* Connection Form */}
        <div className="connection-form slide-up">
          <form onSubmit={handleSubmit} className="card">
            <div className="card-body">
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
                    onChange={handlePrivateKeyChange}
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
                  <div className="error-content">
                    <AlertCircle size={20} className="error-icon" />
                    <p className="error-message">
                      {error || validationError}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  type="submit"
                  disabled={!privateKey.trim()}
                  className="btn btn-primary btn-lg w-full"
                >
                  <Wallet size={20} />
                  <span>Connect Wallet</span>
                  <ArrowRight size={20} />
                </button>

                <div className="divider">
                  <div className="divider-line"></div>
                  <div className="divider-text">
                    <span>or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateWallet}
                  disabled={isGenerating}
                  className="btn btn-secondary btn-lg w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Key size={20} />
                      <span>Generate New Wallet</span>
                      <Sparkles size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="security-notice slide-up">
          <div className="security-content">
            <div className="security-icon-container">
              <Shield size={16} className="security-icon" />
            </div>
            <div className="security-text">
              <h4>Security First</h4>
              <ul className="security-list">
                <li>• Your private key stays in your browser only</li>
                <li>• Zero server storage - complete client-side security</li>
                <li>• Never share your private key with anyone</li>
                <li>• Keep secure backups of your wallet</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="requirements">
          <div className="requirements-badge">
            <Zap size={16} />
            <p className="requirements-text">
              Minimum <span className="requirements-highlight">0.1 AVAX</span> required for AI features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
