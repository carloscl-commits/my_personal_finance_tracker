'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Repeat,
  BarChart3,
  Sun,
  Moon,
  X,
  Wallet,
} from 'lucide-react';
import { useFinance } from '@/hooks/FinanceContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useFinance();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col',
          'bg-bg-sidebar text-text-inverse',
          'transition-transform duration-300 ease-in-out',
          'w-[var(--sidebar-width)]',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Cashflow
            </span>
          </Link>
          <button
            className="lg:hidden p-1 rounded hover:bg-bg-sidebar-hover transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-bg-sidebar-active text-white'
                    : 'text-white/60 hover:text-white hover:bg-bg-sidebar-hover'
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 pb-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-bg-sidebar-hover transition-all duration-150"
          >
            {theme === 'light' ? (
              <Moon className="w-[18px] h-[18px]" />
            ) : (
              <Sun className="w-[18px] h-[18px]" />
            )}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>
    </>
  );
}
