'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useShell } from './AppShell';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { onMenuClick } = useShell();

  return (
    <header
      className="flex items-center justify-between h-[60px] px-6 lg:px-8 shrink-0 z-10"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1
            className="text-[17px] font-bold leading-tight truncate"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 ml-4">{actions}</div>}
    </header>
  );
}
