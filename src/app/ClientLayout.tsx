'use client';

import React from 'react';
import { FinanceProvider } from '@/hooks/FinanceContext';
import AppShell from '@/components/layout/AppShell';
import ErrorBoundary from '@/components/layout/ErrorBoundary';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <FinanceProvider>
        <AppShell>
          {children}
        </AppShell>
      </FinanceProvider>
    </ErrorBoundary>
  );
}
