import React, { useState } from 'react';
import { Wallet, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authService, type AuthUser, type LoginCredentials, type SignupCredentials } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [emailForm, setEmailForm] = useState<LoginCredentials & SignupCredentials>({
    email: '',
    password: '',
    fullName: ''
  });

  const handleEmailAuth = async (isSignup: boolean) => {
    setIsLoading(true);
    setError('');

    try {
      let result;
      if (isSignup) {
        result = await authService.signupWithEmail({
          email: emailForm.email,
          password: emailForm.password,
          fullName: emailForm.fullName
        });
      } else {
        result = await authService.loginWithEmail({
          email: emailForm.email,
          password: emailForm.password
        });
      }

      if (result.success && result.user) {
        onAuthSuccess(result.user);
        onClose();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ 
        zIndex: 10000,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1d2e 25%, #0f1419 50%, #1e2a3a 75%, #0a0e1a 100%)',
        backdropFilter: 'blur(20px)',
        animation: 'fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      <div 
        className="relative w-full max-w-md mx-4 transform transition-all duration-500"
        style={{
          animation: 'modalSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))'
        }}
      >
        {/* Elegant main container */}
        <div 
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1a1f2e 0%, #242938 25%, #1e2330 50%, #252a3a 75%, #1a1f2e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px)',
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.05)
            `
          }}
        >
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%, rgba(255, 255, 255, 0.01) 100%)',
              borderRadius: '1.5rem'
            }}
          ></div>
          
          {/* Main content container */}
          <div className="relative z-10 p-8">
            {/* Professional header */}
            <div className="text-center mb-8">
              <div 
                className="relative w-16 h-16 mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #92400e 50%, #f59e0b 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <Wallet size={28} className="text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              </div>
              
              <h1 
                className="text-2xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.025em'
                }}
              >
                Welcome to CryptVest.finance
              </h1>
              
              <p 
                className="text-sm font-medium"
                style={{ 
                  color: '#9ca3af',
                  lineHeight: '1.5'
                }}
              >
                Access your crypto wealth management dashboard.
              </p>
            </div>

            {/* Professional Login/Signup Toggle */}
            <div 
              className="flex mb-8 p-1 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, #1e2330 0%, #242938 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  mode === 'login' ? 'text-gray-900' : 'text-gray-400'
                }`}
                style={{
                  background: mode === 'login' 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                    : 'transparent',
                  boxShadow: mode === 'login' 
                    ? '0 4px 12px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                    : 'none',
                  color: mode === 'login' ? '#ffffff' : '#9ca3af'
                }}
              >
                Login
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  mode === 'signup' ? 'text-gray-900' : 'text-gray-400'
                }`}
                style={{
                  background: mode === 'signup' 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                    : 'transparent',
                  boxShadow: mode === 'signup' 
                    ? '0 4px 12px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                    : 'none',
                  color: mode === 'signup' ? '#ffffff' : '#9ca3af'
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Professional Form Fields */}
            <div className="space-y-5">
              {/* Full Name (Signup only) */}
              {mode === 'signup' && (
                <div className="relative">
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#d1d5db' }}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={emailForm.fullName}
                      onChange={(e) => setEmailForm({ ...emailForm, fullName: e.target.value })}
                      className="w-full py-3 px-4 rounded-xl text-white placeholder-gray-500 border transition-all duration-300"
                      style={{
                        background: 'linear-gradient(145deg, #1a1f2e 0%, #1e2330 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '15px',
                        fontWeight: '500'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f59e0b';
                        e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#d1d5db' }}
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl text-white placeholder-gray-500 border transition-all duration-300"
                    style={{
                      background: 'linear-gradient(145deg, #1a1f2e 0%, #1e2330 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#d1d5db' }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    className="w-full py-3 px-4 pr-12 rounded-xl text-white placeholder-gray-500 border transition-all duration-300"
                    style={{
                      background: 'linear-gradient(145deg, #1a1f2e 0%, #1e2330 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="mt-4 p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(145deg, #7f1d1d 0%, #991b1b 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fecaca'
                }}
              >
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Professional Submit Button */}
            <button
              onClick={() => handleEmailAuth(mode === 'signup')}
              disabled={isLoading || !emailForm.email || !emailForm.password || (mode === 'signup' && !emailForm.fullName)}
              className="w-full mt-6 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isLoading || !emailForm.email || !emailForm.password || (mode === 'signup' && !emailForm.fullName)
                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div 
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  ></div>
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account' : 'Login'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </div>
            </button>

            {/* Success Message for Signup */}
            {mode === 'signup' && (
              <div 
                className="mt-4 p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(145deg, #065f46 0%, #047857 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#a7f3d0'
                }}
              >
                <p className="text-sm font-medium">🎉 Automatic wallet creation included</p>
              </div>
            )}

            {/* Professional Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:bg-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
