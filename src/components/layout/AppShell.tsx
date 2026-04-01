'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useFinance } from '@/hooks/FinanceContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useFinance();

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-[var(--sidebar-width)] overflow-hidden">
        {React.Children.map(children, child => {
          if (React.isValidElement<{ onMenuClick?: () => void }>(child)) {
            return React.cloneElement(child, {
              onMenuClick: () => setMobileOpen(true),
            } as Partial<{ onMenuClick: () => void }>);
          }
          return child;
        })}
      </div>
    </div>
  );
}
