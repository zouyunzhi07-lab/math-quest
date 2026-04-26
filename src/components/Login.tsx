import { useState } from 'react';
import { useAuth } from '../AuthContext';
import './Login.css';

interface LoginProps {
  onSwitchToSignup: () => void;
}

export default function Login({ onSwitchToSignup }: LoginProps) {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Math Quest</h1>
          <p className="login-subtitle">Nana & Jimi</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          {(localError || error) && (
            <div className="error-message">
              {localError || error}
            </div>
          )}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button onClick={onSwitchToSignup} className="link-button">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
