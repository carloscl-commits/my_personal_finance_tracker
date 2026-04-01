'use client';

import React from 'react';
import { FinanceProvider } from '@/hooks/FinanceContext';
import AppShell from '@/components/layout/AppShell';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <AppShell>
        {children}
      </AppShell>
    </FinanceProvider>
  );
}
