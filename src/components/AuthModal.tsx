import React, { useState } from 'react';
import { Wallet, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authService, type AuthUser, type LoginCredentials, type SignupCredentials } from '../services/auth';
import '../styles/auth-clean.css';

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
    <div className="auth-overlay">
      <div className="auth-container">
        {/* Main Card */}
        <div className="auth-card">
          
          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon">
              <Wallet size={24} />
            </div>
            <h1 className="auth-title">Welcome to CryptVest.finance</h1>
            <p className="auth-subtitle">Access your crypto wealth management dashboard.</p>
          </div>

          {/* Mode Toggle */}
          <div className="auth-tabs">
            <button
              onClick={() => setMode('login')}
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <div className="auth-form">
            {/* Full Name (Signup only) */}
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={emailForm.fullName}
                  onChange={(e) => setEmailForm({ ...emailForm, fullName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={emailForm.email}
                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                className="form-input"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  className="form-input password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => handleEmailAuth(mode === 'signup')}
              disabled={isLoading || !emailForm.email || !emailForm.password || (mode === 'signup' && !emailForm.fullName)}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account' : 'Login'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Success Message for Signup */}
            {mode === 'signup' && (
              <div className="success-message">
                <p>🎉 Automatic wallet creation included</p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button onClick={onClose} className="auth-close-btn">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};