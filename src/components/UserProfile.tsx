import React, { useState } from 'react';
import { User, Wallet, Mail, LogOut, Copy, ExternalLink, TrendingUp, Coins, Image, Activity } from 'lucide-react';
import { authService, type AuthUser } from '../services/auth';
import '../styles/premium-auth.css';

interface UserProfileProps {
  user: AuthUser;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState('');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="glass-morphism premium-card-container">
      {/* Premium animated gradient ring */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl animate-gradient-xy"></div>
      <div className="absolute inset-[1px] glass-morphism rounded-2xl"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-4 ring-purple-500/20">
              {user.loginMethod === 'email' ? (
                <Mail size={26} className="text-white drop-shadow-sm" />
              ) : (
                <User size={26} className="text-white drop-shadow-sm" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white drop-shadow-sm">{user.fullName || 'Anonymous User'}</h3>
              <p className="text-purple-300 text-sm font-medium capitalize">{user.loginMethod} Account</p>
              {user.email && (
                <p className="text-gray-400 text-xs">{user.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="premium-button-secondary p-3 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-105"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-morphism-light rounded-xl p-4 text-center premium-hover-lift">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Coins size={18} className="text-white drop-shadow-sm" />
            </div>
            <p className="text-2xl font-bold text-white drop-shadow-sm">{user.stats.totalTokens}</p>
            <p className="text-purple-300 text-sm font-medium">Tokens Created</p>
          </div>
          <div className="glass-morphism-light rounded-xl p-4 text-center premium-hover-lift">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Image size={18} className="text-white drop-shadow-sm" />
            </div>
            <p className="text-2xl font-bold text-white drop-shadow-sm">{user.stats.totalNfts}</p>
            <p className="text-purple-300 text-sm font-medium">NFTs Created</p>
          </div>
          <div className="glass-morphism-light rounded-xl p-4 text-center premium-hover-lift">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Activity size={18} className="text-white drop-shadow-sm" />
            </div>
            <p className="text-2xl font-bold text-white drop-shadow-sm">{user.stats.totalTransactions}</p>
            <p className="text-purple-300 text-sm font-medium">Transactions</p>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="glass-morphism-light border border-purple-400/30 rounded-xl p-5 mb-6 premium-hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet size={20} className="text-white drop-shadow-sm" />
            </div>
            <h4 className="text-lg font-bold text-white drop-shadow-sm">AVAX Wallet</h4>
          </div>

          {/* Balance */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 text-sm font-medium">Balance</span>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400 drop-shadow-sm" />
                <span className="text-2xl font-bold text-white drop-shadow-sm">{formatBalance(user.wallet.balance)} AVAX</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-300 text-sm font-medium">Wallet Address</span>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(user.wallet.address, 'address')}
                  className="premium-button-secondary p-2 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
                  title="Copy address"
                >
                  <Copy size={16} />
                </button>
                <a
                  href={`https://snowtrace.io/address/${user.wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-button-secondary p-2 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
                  title="View on Snowtrace"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
            <div className="glass-morphism-light rounded-lg p-4 font-mono text-sm border border-purple-400/20">
              <span className="text-gray-200">{formatAddress(user.wallet.address)}</span>
              {copied === 'address' && (
                <span className="text-green-400 ml-2 text-xs font-sans animate-pulse">Copied!</span>
              )}
            </div>
          </div>

          {/* Private Key (Show/Hide) */}
          {user.loginMethod === 'local' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 text-sm font-medium">Private Key</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="premium-button-secondary px-3 py-1 text-gray-300 hover:text-white transition-all duration-300 text-xs"
                    title={showPrivateKey ? 'Hide' : 'Show'}
                  >
                    {showPrivateKey ? 'Hide' : 'Show'}
                  </button>
                  {showPrivateKey && (
                    <button
                      onClick={() => copyToClipboard(user.wallet.privateKey, 'privateKey')}
                      className="premium-button-secondary p-2 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
                      title="Copy private key"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="glass-morphism-light rounded-lg p-4 font-mono text-sm border border-purple-400/20">
                {showPrivateKey ? (
                  <span className="text-gray-200 break-all">{user.wallet.privateKey}</span>
                ) : (
                  <span className="text-gray-500">••••••••••••••••••••••••••••••••</span>
                )}
                {copied === 'privateKey' && (
                  <span className="text-green-400 ml-2 text-xs font-sans animate-pulse">Copied!</span>
                )}
              </div>
              <p className="text-yellow-400 text-xs mt-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-2">
                ⚠️ Keep your private key safe! Never share it with anyone.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="premium-button-secondary glass-morphism-light border border-purple-400/30 rounded-xl p-4 text-center transition-all duration-300 premium-hover-lift group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Coins size={18} className="text-white drop-shadow-sm" />
            </div>
            <p className="text-white text-sm font-semibold drop-shadow-sm">Create Token</p>
          </button>
          <button className="premium-button-secondary glass-morphism-light border border-purple-400/30 rounded-xl p-4 text-center transition-all duration-300 premium-hover-lift group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Image size={18} className="text-white drop-shadow-sm" />
            </div>
            <p className="text-white text-sm font-semibold drop-shadow-sm">Create NFT</p>
          </button>
        </div>
      </div>
    </div>
  );
};
