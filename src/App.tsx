import { useState, useEffect } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { ChatInterface } from './components/ChatInterface';
import { WalletInfo } from './components/WalletInfo';
import { createWalletFromPrivateKey } from './utils/wallet';
import { initializeAI } from './utils/ai';
import { CONFIG } from './config';
import { Sparkles, Wallet2, ArrowUpRight, Shield, Zap, Menu, X } from 'lucide-react';
import './App.css';

export interface WalletData {
  address: string;
  balance: string;
  privateKey: string;
}

function App() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize app
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize AI
        const aiInitialized = initializeAI();
        if (!aiInitialized) {
          console.warn('AI features will be limited without API key');
        }

        // Check for stored wallet
        const storedKey = localStorage.getItem(CONFIG.WALLET.STORAGE_KEY);
        if (storedKey) {
          try {
            const walletInfo = await createWalletFromPrivateKey(storedKey);
            setWallet(walletInfo);
          } catch (err) {
            console.error('Failed to restore wallet:', err);
            localStorage.removeItem(CONFIG.WALLET.STORAGE_KEY);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize app');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const handleWalletConnect = async (privateKey: string) => {
    try {
      setError(null);
      const walletInfo = await createWalletFromPrivateKey(privateKey);
      
      // Store private key securely
      localStorage.setItem(CONFIG.WALLET.STORAGE_KEY, privateKey);
      
      setWallet(walletInfo);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleWalletDisconnect = () => {
    localStorage.removeItem(CONFIG.WALLET.STORAGE_KEY);
    setWallet(null);
    setSidebarOpen(false);
  };

  const refreshWalletBalance = async () => {
    if (!wallet) return;
    
    try {
      const walletInfo = await createWalletFromPrivateKey(wallet.privateKey);
      setWallet(walletInfo);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <Sparkles className="w-6 h-6 text-purple-400 absolute top-3 left-3" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium">Initializing Avalanche AI Assistant...</p>
            <p className="text-slate-400 text-sm mt-1">Connecting to Avalanche Mainnet</p>
          </div>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-3xl"></div>
          <div className="relative px-6 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent mb-6">
                Avalanche AI
              </h1>
              
              <p className="text-2xl text-slate-300 mb-4 font-light">
                Professional Blockchain Assistant
              </p>

              <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Experience the future of blockchain interaction. Send AVAX, create tokens, mint NFTs, and manage your portfolio with natural language commands powered by advanced AI.
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
                <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-500">
                    <Wallet2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Smart Wallet</h3>
                  <p className="text-slate-400 leading-relaxed">Enterprise-grade wallet management with advanced security features and seamless blockchain interactions</p>
                </div>

                <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-500">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">AI Intelligence</h3>
                  <p className="text-slate-400 leading-relaxed">Natural language processing powered by advanced AI for intuitive blockchain operations and smart automation</p>
                </div>

                <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-500">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Bank-Grade Security</h3>
                  <p className="text-slate-400 leading-relaxed">Military-grade encryption with local key storage ensuring your assets remain completely secure</p>
                </div>
              </div>

              {/* Network Status */}
              <div className="flex items-center justify-center mb-12">
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl px-6 py-3 flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-red-200 font-medium">Live on Avalanche Mainnet</span>
                  <ArrowUpRight className="w-5 h-5 text-red-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="max-w-lg mx-auto px-6 pb-16">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
            <WalletConnect onConnect={handleWalletConnect} error={error} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <div className="mobile-header-brand">
            <div className="mobile-header-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="mobile-header-title">Avalanche AI</h1>
              <p className="mobile-header-subtitle">Mainnet</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-sm"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className="app-content">
        {/* Sidebar */}
        <div className={`app-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          {/* Sidebar Content */}
          <div className="sidebar-content">
            <div className="sidebar-section">
              <h3>Wallet</h3>
              <WalletInfo 
                wallet={wallet} 
                onRefresh={refreshWalletBalance}
                onDisconnect={handleWalletDisconnect}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Overlay for Mobile */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="app-main">
          <ChatInterface 
            wallet={wallet}
            onTransactionComplete={refreshWalletBalance}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
