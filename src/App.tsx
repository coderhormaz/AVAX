import { useState, useEffect } from 'react';
import { WalletConnectModal } from './components/WalletConnectModal';
import { ChatInterface } from './components/ChatInterface';
import { WalletInfo } from './components/WalletInfo';
import { createWalletFromPrivateKey } from './utils/wallet';
import { initializeAI } from './utils/ai';
import { CONFIG } from './config';
import './App.css';
import './styles/modern-landing.css';

export interface WalletData {
  address: string;
  balance: string;
  privateKey: string;
}

function App() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  
  // Typing animation state
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = 'Welcome to Avalanche AI';

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

  // Typing animation effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isTyping && typedText.length < fullText.length) {
      timeoutId = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 100); // Typing speed
    } else if (typedText.length === fullText.length) {
      setIsTyping(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [typedText, isTyping, fullText]);

  // Reset typing animation on page load/refresh
  useEffect(() => {
    setTypedText('');
    setIsTyping(true);
  }, []);

  const handleWalletConnect = async (privateKey: string) => {
    try {
      setError(null);
      const walletInfo = await createWalletFromPrivateKey(privateKey);
      
      // Store private key securely
      localStorage.setItem(CONFIG.WALLET.STORAGE_KEY, privateKey);
      
      setWallet(walletInfo);
      setWalletModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleWalletDisconnect = () => {
    localStorage.removeItem(CONFIG.WALLET.STORAGE_KEY);
    setWallet(null);
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setCurrentSection(sectionId);
  };

  const handleLetsStart = () => {
    if (wallet) {
      // Navigate to chat interface - this will be handled by the main interface
      return;
    } else {
      setWalletModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <div className="loading-icon">✨</div>
          </div>
          <div className="loading-text">
            <h3>Initializing Avalanche AI</h3>
            <p>Connecting to Avalanche Mainnet (Chain ID: 43114)</p>
          </div>
        </div>
        <div className="loading-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="particle" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties} />
          ))}
        </div>
      </div>
    );
  }

  // If wallet is connected, show the main interface
  if (wallet) {
    return (
      <div className="app">
        {/* Main Content */}
        <div className="app-main">
          {/* Wallet Info Section */}
          <div className="wallet-info-section">
            <WalletInfo 
              wallet={wallet}
              onRefresh={refreshWalletBalance}
              onDisconnect={handleWalletDisconnect}
            />
          </div>
          
          {/* Chat Interface */}
          <ChatInterface 
            wallet={wallet}
            onTransactionComplete={refreshWalletBalance}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="App">
      <div className="galaxy-website">
        {/* Animated Galaxy Background */}
        <div className="galaxy-background">
          <div className="stars"></div>
          <div className="moving-particles"></div>
          <div className="cosmic-dust"></div>
          <div className="nebula"></div>
          <div className="floating-orbs"></div>
        </div>

        {/* Navigation Header */}
        <header className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <span className="logo-text">
                <span className="logo-avalanche">Avalanche</span>
                <span className="logo-ai">AI</span>
              </span>
            </div>
            <nav className="nav-menu">
              <a href="#home" onClick={() => scrollToSection('home')} className={currentSection === 'home' ? 'active' : ''}>
                Home
              </a>
              <a href="#about" onClick={() => scrollToSection('about')} className={currentSection === 'about' ? 'active' : ''}>
                About
              </a>
              <a href="#techstack" onClick={() => scrollToSection('techstack')} className={currentSection === 'techstack' ? 'active' : ''}>
                Tech Stack
              </a>
              <a href="#usp" onClick={() => scrollToSection('usp')} className={currentSection === 'usp' ? 'active' : ''}>
                Features
              </a>
              <a href="#contact" onClick={() => scrollToSection('contact')} className={currentSection === 'contact' ? 'active' : ''}>
                Contact
              </a>
              <button 
                className="lets-start-btn cyber-glow" 
                onClick={handleLetsStart}
              >
                {wallet ? 'Launch AI' : 'Let\'s Start'}
              </button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="typing-text">
                {typedText}
                {isTyping && <span className="cursor">|</span>}
              </span>
            </h1>
            <p className="hero-subtitle fade-in-up">
              Professional Blockchain Assistant – AI-powered wallet management, 
              tokens, NFTs, and seamless blockchain interactions on Avalanche Network.
            </p>
            
            <div className="hero-buttons">
              <button 
                className="primary-btn cosmic-pulse" 
                onClick={() => setWalletModalOpen(true)}
              >
                <span className="btn-icon">🚀</span>
                Connect Wallet
              </button>
              <button 
                className="secondary-btn quantum-border" 
                onClick={() => scrollToSection('about')}
              >
                Learn More
              </button>
            </div>

            {/* Live Network Status */}
            <div className="network-status">
              <div className="status-indicator quantum-pulse"></div>
              <span>Live on Avalanche Mainnet (Chain ID: 43114)</span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="container">
            <h2 className="section-title cosmic-text">About Avalanche AI</h2>
            <div className="about-content">
              <div className="about-text-container">
                <div className="about-text">
                  <p className="about-description fade-in">
                    🚀 <strong>Avalanche AI</strong> is a revolutionary blockchain assistant that combines the power of artificial intelligence 
                    with the security and speed of the Avalanche network. Our platform enables users to interact with 
                    blockchain technology through natural language, making complex operations simple and accessible.
                  </p>
                  <p className="about-description fade-in">
                    🛡️ Built with <strong>enterprise-grade security</strong> in mind, our AI assistant helps you manage wallets, create tokens, 
                    mint NFTs, and execute smart contracts without requiring deep technical knowledge. Your private keys 
                    never leave your browser, ensuring maximum security and privacy.
                  </p>
                  <p className="about-description fade-in">
                    ⚡ Experience the future of <strong>decentralized finance</strong> with sub-second transaction finality, 
                    low costs, and an intuitive AI-powered interface that understands your needs.
                  </p>
                </div>
              </div>
              <div className="about-stats">
                <div className="stat-item quantum-card">
                  <h3 className="stat-number">100%</h3>
                  <p>Client-Side Security</p>
                </div>
                <div className="stat-item quantum-card">
                  <h3 className="stat-number">24/7</h3>
                  <p>AI Assistance</p>
                </div>
                <div className="stat-item quantum-card">
                  <h3 className="stat-number">0</h3>
                  <p>Server Storage</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section id="techstack" className="techstack-section">
          <div className="container">
            <h2 className="section-title cosmic-text">Technology Stack</h2>
            <div className="tech-grid">
              <div className="tech-category quantum-glass">
                <h3>Frontend</h3>
                <div className="tech-items">
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">⚛️</span>
                    <span>React 18</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">📘</span>
                    <span>TypeScript</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">⚡</span>
                    <span>Vite</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">🎨</span>
                    <span>CSS3 + Animations</span>
                  </div>
                </div>
              </div>
              
              <div className="tech-category quantum-glass">
                <h3>Blockchain</h3>
                <div className="tech-items">
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">🔗</span>
                    <span>Avalanche Network</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">📜</span>
                    <span>Solidity</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">🌐</span>
                    <span>Web3.js / Ethers.js</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">🔐</span>
                    <span>Private Key Management</span>
                  </div>
                </div>
              </div>
              
              <div className="tech-category quantum-glass">
                <h3>AI & Tools</h3>
                <div className="tech-items">
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">🤖</span>
                    <span>Advanced AI Engine</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">📁</span>
                    <span>IPFS Storage</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">🔐</span>
                    <span>Client-Side Encryption</span>
                  </div>
                  <div className="tech-item hover-glow">
                    <span className="tech-icon">🚀</span>
                    <span>Real-time Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USP Section */}
        <section id="usp" className="usp-section">
          <div className="container">
            <h2 className="section-title cosmic-text">Unique Features</h2>
            <div className="usp-grid">
              <div className="usp-card quantum-glass hover-lift">
                <div className="usp-icon">🧠</div>
                <h3>AI-Powered Intelligence</h3>
                <p>Natural language processing enables complex blockchain operations through simple conversations. Just tell us what you want to do!</p>
              </div>
              
              <div className="usp-card quantum-glass hover-lift">
                <div className="usp-icon">🔒</div>
                <h3>Ultimate Security</h3>
                <p>Zero server storage, client-side encryption, and browser-only private key management. Your keys never leave your device.</p>
              </div>
              
              <div className="usp-card quantum-glass hover-lift">
                <div className="usp-icon">⚡</div>
                <h3>Lightning Fast</h3>
                <p>Built on Avalanche network for sub-second finality and extremely low transaction costs. Experience DeFi at light speed.</p>
              </div>
              
              <div className="usp-card quantum-glass hover-lift">
                <div className="usp-icon">🎯</div>
                <h3>User-Friendly</h3>
                <p>No coding required. Interact with blockchain through an intuitive chat interface that understands plain English.</p>
              </div>
              
              <div className="usp-card quantum-glass hover-lift">
                <div className="usp-icon">🛠️</div>
                <h3>Complete Toolkit</h3>
                <p>Token creation, NFT minting, wallet management, smart contract deployment, and DeFi interactions all in one place.</p>
              </div>
              
              <div className="usp-card quantum-glass hover-lift">
                <div className="usp-icon">🌍</div>
                <h3>Decentralized</h3>
                <p>Fully decentralized architecture with no central points of failure. True Web3 philosophy in action.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-section">
          <div className="container">
            <h2 className="section-title cosmic-text">Get In Touch</h2>
            <div className="contact-content">
              <div className="contact-form quantum-glass">
                <h3>Send us a Message</h3>
                <form className="form">
                  <div className="form-group">
                    <input type="text" placeholder="Your Name" className="form-input quantum-input" />
                  </div>
                  <div className="form-group">
                    <input type="email" placeholder="Your Email" className="form-input quantum-input" />
                  </div>
                  <div className="form-group">
                    <textarea placeholder="Your Message" rows={5} className="form-textarea quantum-input"></textarea>
                  </div>
                  <button type="submit" className="submit-btn cosmic-pulse">
                    Send Message
                  </button>
                </form>
              </div>
              
              <div className="contact-info quantum-glass">
                <h3>Connect With Us</h3>
                <div className="social-links">
                  <a href="#" className="social-link quantum-hover">
                    <span className="social-icon">💼</span>
                    <span>LinkedIn: xyz</span>
                  </a>
                  <a href="#" className="social-link quantum-hover">
                    <span className="social-icon">🐦</span>
                    <span>Twitter: xyz</span>
                  </a>
                  <a href="#" className="social-link quantum-hover">
                    <span className="social-icon">📧</span>
                    <span>Email: xyz@avalancheai.com</span>
                  </a>
                </div>
                <p className="contact-note">
                  * Contact information is for showcase purposes only
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-logo">
                <span className="logo-text">
                  <span className="logo-avalanche">Avalanche</span>
                  <span className="logo-ai">AI</span>
                </span>
                <p>Professional Blockchain Assistant</p>
              </div>
              
              <div className="footer-links">
                <div className="footer-section">
                  <h4>Navigation</h4>
                  <a href="#home" onClick={() => scrollToSection('home')}>Home</a>
                  <a href="#about" onClick={() => scrollToSection('about')}>About</a>
                  <a href="#techstack" onClick={() => scrollToSection('techstack')}>Tech Stack</a>
                  <a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a>
                </div>
                
                <div className="footer-section">
                  <h4>Connect</h4>
                  <a href="#">LinkedIn: xyz</a>
                  <a href="#">Twitter: xyz</a>
                  <a href="#">Email: xyz@avalancheai.com</a>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2025 Avalanche AI. Built with ❤️ for the future of blockchain.</p>
            </div>
          </div>
        </footer>

        {/* Wallet Connect Modal - NO METAMASK */}
        <WalletConnectModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          onConnect={handleWalletConnect}
          error={error}
        />
      </div>
    </div>
  );
}

export default App;
