'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangeCredentialsModal({ open, onClose }: Props) {
  const { username, changeCredentials } = useAuth();
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
