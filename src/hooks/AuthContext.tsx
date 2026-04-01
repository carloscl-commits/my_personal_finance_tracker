'use client';

import React, { createContext, useContext } from 'react';
import { AuthStore } from '@/types/auth';
import { useAuthStore } from './useAuthStore';

const AuthContext = createContext<AuthStore | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  return (
    <AuthContext.Provider value={store}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
