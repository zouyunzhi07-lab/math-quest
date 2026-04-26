import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './OwnerSetup.css';

interface OwnerSetupProps {
  onSetupComplete: () => void;
}

export default function OwnerSetup({ onSetupComplete }: OwnerSetupProps) {
  const [step, setStep] = useState<'check' | 'create' | 'done'>('check');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: 'zouyunzhi07@gmail.com',
    password: '',
    confirmPassword: '',
    fullName: 'Owner',
  });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkOwnerExists();
  }, []);

  const checkOwnerExists = async () => {
    try {
      // Check if there's already a super_admin
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'super_admin')
        .single();
      
      if (data) {
        setStep('done');
      } else {
        setStep('create');
      }
    } catch (err) {
      console.error('Error checking owner:', err);
      setStep('create');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setCreating(true);
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'super_admin',
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile as super_admin
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: 'super_admin',
          });

        if (profileError) throw profileError;

        // Create default tenant
        const { error: tenantError } = await supabase
          .from('tenants')
          .insert({
            name: 'Math Quest Academy',
            subdomain: 'mathquest',
          });

        if (tenantError) console.error('Error creating tenant:', tenantError);

        setStep('done');
        alert('Owner account created successfully! You can now log in.');
        onSetupComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="owner-setup-container">
        <div className="loading-spinner"></div>
        <p>Checking setup status...</p>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="owner-setup-container">
        <div className="setup-card">
          <div className="setup-header">
            <div className="check-icon">✓</div>
            <h1>Owner Account Ready</h1>
            <p>Your owner account has been set up. You can now log in to the admin portal.</p>
          </div>
          <button onClick={() => window.location.href = '/admin'} className="login-btn">
            Go to Admin Portal
          </button>
          <button onClick={() => window.location.href = '/'} className="back-link">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>Math Quest Setup</h1>
          <p>Create your owner account to manage the platform</p>
        </div>

        <form onSubmit={handleCreateOwner} className="setup-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={creating}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={creating}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
              disabled={creating}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter your password"
              disabled={creating}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="create-btn" disabled={creating}>
            {creating ? 'Creating Account...' : 'Create Owner Account'}
          </button>
        </form>

        <div className="setup-footer">
          <p className="security-note">
            🔒 Your password is encrypted and secure. You can change it later.
          </p>
          <button onClick={() => window.location.href = '/'} className="back-link">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
