'use client';

import React, { createContext, useContext } from 'react';
import { FinanceStore } from '@/types/finance';
import { useFinanceStore } from './useFinanceStore';

const FinanceContext = createContext<FinanceStore | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const store = useFinanceStore();
  return (
    <FinanceContext.Provider value={store}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceStore {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
