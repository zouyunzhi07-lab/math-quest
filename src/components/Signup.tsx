import { useState } from 'react';
import { useAuth } from '../AuthContext';
import './Login.css';

interface SignupProps {
  onSwitchToLogin: () => void;
}

export default function Signup({ onSwitchToLogin }: SignupProps) {
  const { signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password || !fullName) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign up');
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Check Your Email!</h1>
            <p className="login-subtitle">We sent a confirmation link</p>
          </div>
          <p style={{ textAlign: 'center', color: '#666' }}>
            Please check your email and click the confirmation link to activate your account.
          </p>
          <div className="login-footer">
            <p>
              Already confirmed?{' '}
              <button onClick={onSwitchToLogin} className="link-button">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Join Math Quest</h1>
          <p className="login-subtitle">Create your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>
          
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
              placeholder="Create a password (min 6 characters)"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>
          
          {(localError || error) && (
            <div className="error-message">
              {localError || error}
            </div>
          )}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="link-button">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
