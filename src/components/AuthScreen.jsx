import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let result;
      if (mode === 'register') {
        result = await register(name, email, password);
      } else {
        result = await login(email, password);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Background decoration */}
      <div className="auth-bg-orb auth-bg-orb-1"></div>
      <div className="auth-bg-orb auth-bg-orb-2"></div>
      <div className="auth-bg-orb auth-bg-orb-3"></div>

      <div className="auth-container fade-in">
        {/* Logo / Branding */}
        <div className="auth-brand">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
              <defs>
                <linearGradient id="authDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A5B4FC"/>
                  <stop offset="100%" stopColor="#818CF8"/>
                </linearGradient>
              </defs>
              <path d="M12 2C12 2 6 10 6 14.5C6 17.8 8.7 21 12 21C15.3 21 18 17.8 18 14.5C18 10 12 2 12 2Z" fill="url(#authDropGrad)" />
              <ellipse cx="10" cy="13" rx="2" ry="3" fill="white" opacity="0.3" transform="rotate(-15, 10, 13)"/>
            </svg>
          </div>
          <h1 className="auth-title">Milk Tracker</h1>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Welcome back! Sign in to continue.' 
              : 'Create your account to get started.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode()}
              type="button"
              disabled={mode === 'login'}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode()}
              type="button"
              disabled={mode === 'register'}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Error Message */}
            {error && (
              <div className="auth-error fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                {error}
              </div>
            )}

            {/* Name Field (Register only) */}
            {mode === 'register' && (
              <div className="auth-field fade-in">
                <label className="auth-label" htmlFor="auth-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  id="auth-name"
                  className="auth-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength="30"
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Email
              </label>
              <input
                type="email"
                id="auth-email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password"
                  className="auth-input"
                  placeholder={mode === 'register' ? 'Min 4 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button 
                  type="button" 
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-spinner"></span>
              ) : (
                <>
                  {mode === 'login' ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                      Sign In
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                      Create Account
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Mode Switch Link */}
          <div className="auth-switch">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button type="button" className="auth-switch-link" onClick={switchMode}>
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button type="button" className="auth-switch-link" onClick={switchMode}>
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <span>🥛 Track milk deliveries · Calculate bills · Manage payments</span>
        </div>
      </div>
    </div>
  );
}
