'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import { Wallet } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LoginScreen() {
  const { isSetup, login, setupCredentials } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);
    const ok = await login(username.trim(), password);
    setLoading(false);
    if (!ok) setError('Invalid username or password');
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    await setupCredentials(username.trim(), password);
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 40,
    padding: '0 14px',
    fontSize: 14,
    borderRadius: 10,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-page)',
    color: 'var(--text-primary)',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-elevated)',
          padding: '40px 36px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--accent)',
              boxShadow: '0 2px 10px color-mix(in srgb, var(--accent) 35%, transparent)',
            }}
          >
            <Wallet style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Cashflow
          </span>
        </div>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          {isSetup ? 'Welcome back' : 'Create your account'}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          {isSetup
            ? 'Sign in to access your finances'
            : 'Set up your credentials to get started'
          }
        </p>

        <form
          onSubmit={isSetup ? handleLogin : handleSetup}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete={isSetup ? 'current-password' : 'new-password'}
              required
              style={inputStyle}
            />
          </div>
          {!isSetup && (
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                required
                style={inputStyle}
              />
            </div>
          )}

          {error && (
            <p style={{ fontSize: 13, color: 'var(--expense)', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 4 }}
          >
            {loading
              ? 'Please wait...'
              : isSetup ? 'Sign In' : 'Get Started'
            }
          </Button>
        </form>
      </div>
    </div>
  );
}
