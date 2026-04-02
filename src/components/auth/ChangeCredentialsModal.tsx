'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import { useFinance } from '@/hooks/FinanceContext';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($) — US Dollar' },
  { value: 'EUR', label: 'EUR (€) — Euro' },
  { value: 'GBP', label: 'GBP (£) — British Pound' },
  { value: 'JPY', label: 'JPY (¥) — Japanese Yen' },
  { value: 'CAD', label: 'CAD (CA$) — Canadian Dollar' },
  { value: 'AUD', label: 'AUD (A$) — Australian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'CNY', label: 'CNY (CN¥) — Chinese Yuan' },
  { value: 'BRL', label: 'BRL (R$) — Brazilian Real' },
  { value: 'INR', label: 'INR (₹) — Indian Rupee' },
  { value: 'MXN', label: 'MXN (MX$) — Mexican Peso' },
  { value: 'KRW', label: 'KRW (₩) — Korean Won' },
  { value: 'SEK', label: 'SEK (kr) — Swedish Krona' },
  { value: 'NOK', label: 'NOK (kr) — Norwegian Krone' },
  { value: 'DKK', label: 'DKK (kr) — Danish Krone' },
  { value: 'PLN', label: 'PLN (zł) — Polish Zloty' },
  { value: 'TRY', label: 'TRY (₺) — Turkish Lira' },
  { value: 'ZAR', label: 'ZAR (R) — South African Rand' },
  { value: 'SGD', label: 'SGD (S$) — Singapore Dollar' },
  { value: 'HKD', label: 'HKD (HK$) — Hong Kong Dollar' },
  { value: 'NZD', label: 'NZD (NZ$) — New Zealand Dollar' },
  { value: 'COP', label: 'COP (COL$) — Colombian Peso' },
  { value: 'ARS', label: 'ARS (ARS$) — Argentine Peso' },
  { value: 'CLP', label: 'CLP (CL$) — Chilean Peso' },
  { value: 'PEN', label: 'PEN (S/) — Peruvian Sol' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangeCredentialsModal({ open, onClose }: Props) {
  const { username, changeCredentials } = useAuth();
  const { currency, setCurrency } = useFinance();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewUsername(username);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }
    if (newPassword && newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    const ok = await changeCredentials(
      currentPassword,
      newUsername.trim(),
      newPassword || currentPassword,
    );
    setLoading(false);

    if (!ok) {
      setError('Current password is incorrect');
      return;
    }

    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(handleClose, 1200);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Account Settings" size="sm">
      {/* Currency Preference */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12 }}>
          Preferences
        </p>
        <Select
          label="Currency"
          options={CURRENCIES}
          value={currency || 'USD'}
          onChange={e => setCurrency(e.target.value)}
        />
      </div>

      <div style={{ height: 1, background: 'var(--border-color)', marginBottom: 20 }} />

      {/* Account Credentials */}
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12 }}>
        Account
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
        />
        <div style={{ height: 1, background: 'var(--border-color)' }} />
        <Input
          label="New Username"
          type="text"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          placeholder="Enter new username"
          required
        />
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Leave blank to keep current"
        />
        {newPassword && (
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        )}

        {error && (
          <p style={{ fontSize: 13, color: 'var(--expense)' }}>{error}</p>
        )}
        {success && (
          <p style={{ fontSize: 13, color: 'var(--income)' }}>Credentials updated successfully!</p>
        )}

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
