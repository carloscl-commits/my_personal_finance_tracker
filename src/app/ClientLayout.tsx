'use client';

import React from 'react';
import { FinanceProvider } from '@/hooks/FinanceContext';
import { AuthProvider, useAuth } from '@/hooks/AuthContext';
import AppShell from '@/components/layout/AppShell';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import LoginScreen from '@/components/auth/LoginScreen';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { initialized, isSetup, isAuthenticated } = useAuth();

  if (!initialized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-page)',
        }}
      />
    );
  }

  if (!isSetup || !isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <FinanceProvider>
      <AppShell>{children}</AppShell>
    </FinanceProvider>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </ErrorBoundary>
  );
}
