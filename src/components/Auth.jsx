import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Recycle } from 'lucide-react';

function Auth({ onLoginSuccess, onBackToLanding }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-seed default user if not exists
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('ecosort_users') || '[]');
    const hasAdmin = users.some(u => u.email === 'admin@ecosort.ai');
    if (!hasAdmin) {
      users.push({
        email: 'admin@ecosort.ai',
        password: 'password123',
        name: 'Admin User',
        role: 'Administrator'
      });
      localStorage.setItem('ecosort_users', JSON.stringify(users));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('ecosort_users') || '[]');

    if (isLogin) {
      // Login flow
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(user);
        }, 800);
      } else {
        setError('Invalid email or password.');
      }
    } else {
      // Signup flow
      const userExists = users.some(u => u.email === email);
      if (userExists) {
        setError('An account with this email already exists.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      const newUser = {
        email,
        password,
        name: email.split('@')[0],
        role: 'Operator'
      };

      users.push(newUser);
      localStorage.setItem('ecosort_users', JSON.stringify(users));

      setSuccess('Account created successfully! Switching to Login...');
      setTimeout(() => {
        setIsLogin(true);
        setEmail(email);
        setPassword('');
        setSuccess('');
      }, 1500);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        {/* Card Logo */}
        <div 
          onClick={onBackToLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.75rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            background: 'var(--color-primary)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Recycle size={18} color="#09090b" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>EcoSort AI</span>
        </div>

        <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}>
          {isLogin ? 'Sign In to Console' : 'Create Operator Account'}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
          {isLogin 
            ? 'Enter your credentials to manage segregation hardware' 
            : 'Register a new profile to access dashboard tools'
          }
        </p>

        {error && (
          <div style={{
            padding: '0.65rem 0.85rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <ShieldAlert size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            padding: '0.65rem 0.85rem',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle size={14} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. admin@ecosort.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button className="auth-toggle-btn" onClick={() => { setIsLogin(false); setError(''); }}>
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button className="auth-toggle-btn" onClick={() => { setIsLogin(true); setError(''); }}>
                Sign In
              </button>
            </span>
          )}
        </div>

        {isLogin && (
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            Demo credentials: <strong style={{ color: 'var(--text-secondary)' }}>admin@ecosort.ai</strong> / <strong style={{ color: 'var(--text-secondary)' }}>password123</strong>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            onClick={onBackToLanding}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            ← Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
