import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import './AdminLogin.css';

interface AdminLoginProps {
  onSwitchToPublic: () => void;
}

export default function AdminLogin({ onSwitchToPublic }: AdminLoginProps) {
  const { signIn, loading, error, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    try {
      await signIn(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setLocalError('Please enter your email first');
      return;
    }
    
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send reset email');
    }
  };

  if (showReset) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1 className="admin-login-title">Reset Password</h1>
            <p className="admin-login-subtitle">Admin Portal</p>
          </div>
          
          {resetSent ? (
            <div className="reset-success">
              <div className="success-icon">✓</div>
              <h2>Check your email</h2>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
              <p className="reset-note">Click the link in the email to reset your password.</p>
              <button onClick={() => { setShowReset(false); setResetSent(false); }} className="back-button">
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                />
              </div>
              
              {localError && (
                <div className="error-message">{localError}</div>
              )}
              
              <button type="submit" className="admin-login-button">
                Send Reset Link
              </button>
              
              <button type="button" onClick={() => setShowReset(false)} className="link-button">
                Back to Login
              </button>
            </form>
          )}
          
          <div className="admin-login-footer">
            <button onClick={onSwitchToPublic} className="link-button">
              ← Back to Student Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">Math Quest Management</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
            />
          </div>
          
          {(localError || error) && (
            <div className="error-message">
              {localError || error}
            </div>
          )}
          
          <button type="submit" className="admin-login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
          
          <button type="button" onClick={() => setShowReset(true)} className="link-button">
            Forgot Password?
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p className="setup-link">
            First time? <button onClick={() => window.location.href = '/setup'} className="link-button">Setup Admin Account</button>
          </p>
          <button onClick={onSwitchToPublic} className="link-button">
            ← Back to Student Login
          </button>
        </div>
      </div>
    </div>
  );
}
