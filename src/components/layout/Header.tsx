'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onMenuClick, actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 lg:px-8 border-b border-border bg-bg-card">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5 text-text-primary" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-text-primary" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-text-tertiary">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
