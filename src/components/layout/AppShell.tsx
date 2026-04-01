'use client';

import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useFinance } from '@/hooks/FinanceContext';

interface ShellContext {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const ShellCtx = createContext<ShellContext>({ onMenuClick: () => {}, sidebarCollapsed: false });
export const useShell = () => useContext(ShellCtx);

export const SIDEBAR_W = 260;
export const SIDEBAR_W_COLLAPSED = 72;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useFinance();

  const onMenuClick = useCallback(() => setMobileOpen(true), []);
  const onClose = useCallback(() => setMobileOpen(false), []);
  const onToggleCollapse = useCallback(() => setCollapsed(c => !c), []);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') setCollapsed(true);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar_collapsed', String(collapsed));
    }
  }, [collapsed, mounted]);

  const sidebarPx = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <ShellCtx.Provider value={{ onMenuClick, sidebarCollapsed: collapsed }}>
      <div
        data-theme={theme}
        className="h-screen overflow-hidden"
        style={{ background: 'var(--bg-page)' }}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          collapsed={collapsed}
          onClose={onClose}
          onToggleCollapse={onToggleCollapse}
          mounted={mounted}
        />
        <style>{`
          .app-main { padding-left: 0; }
          @media (min-width: 1024px) {
            .app-main { padding-left: ${sidebarPx}px !important; }
          }
        `}</style>
        <div
          className="app-main h-full flex flex-col min-w-0 overflow-hidden"
          style={{
            transition: mounted
              ? 'padding-left 400ms cubic-bezier(0.25, 1, 0.5, 1)'
              : 'none',
          }}
        >
          {children}
        </div>
      </div>
    </ShellCtx.Provider>
  );
}
