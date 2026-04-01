'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthData, SessionData, AuthStore } from '@/types/auth';

const AUTH_KEY = 'finance_app_auth';
const SESSION_KEY = 'finance_app_session';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function loadAuth(): AuthData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthData;
  } catch {
    return null;
  }
}

function saveAuth(auth: AuthData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

function loadSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

function saveSession(session: SessionData | null): void {
  if (typeof window === 'undefined') return;
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function useAuthStore(): AuthStore {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setAuth(loadAuth());
    setSession(loadSession());
    setInitialized(true);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const current = loadAuth();
    if (!current || !current.isSetup) return false;

    const hash = await hashPassword(password);
    if (current.username === username && current.passwordHash === hash) {
      const s: SessionData = { authenticated: true, loginTimestamp: Date.now() };
      setSession(s);
      saveSession(s);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback((): void => {
    setSession(null);
    saveSession(null);
  }, []);

  const setupCredentials = useCallback(async (username: string, password: string): Promise<void> => {
    const hash = await hashPassword(password);
    const newAuth: AuthData = { username, passwordHash: hash, isSetup: true };
    setAuth(newAuth);
    saveAuth(newAuth);
    const s: SessionData = { authenticated: true, loginTimestamp: Date.now() };
    setSession(s);
    saveSession(s);
  }, []);

  const changeCredentials = useCallback(async (
    currentPassword: string,
    newUsername: string,
    newPassword: string
  ): Promise<boolean> => {
    const current = loadAuth();
    if (!current) return false;

    const currentHash = await hashPassword(currentPassword);
    if (current.passwordHash !== currentHash) return false;

    const newHash = await hashPassword(newPassword);
    const updated: AuthData = { username: newUsername, passwordHash: newHash, isSetup: true };
    setAuth(updated);
    saveAuth(updated);
    return true;
  }, []);

  return {
    initialized,
    isSetup: auth?.isSetup ?? false,
    isAuthenticated: session?.authenticated ?? false,
    username: auth?.username ?? '',
    login,
    logout,
    setupCredentials,
    changeCredentials,
  };
}
