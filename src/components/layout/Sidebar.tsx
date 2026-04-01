'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Tags, Repeat, BarChart3,
  Sun, Moon, X, Wallet, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useFinance } from '@/hooks/FinanceContext';
import { cn } from '@/lib/utils';
import { SIDEBAR_W, SIDEBAR_W_COLLAPSED } from './AppShell';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

interface SidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  mounted: boolean;
}

export default function Sidebar({ mobileOpen, collapsed, onClose, onToggleCollapse, mounted }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useFinance();

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  const sidebarBg = theme === 'dark'
    ? 'linear-gradient(180deg, #030712 0%, #0a0f1e 100%)'
    : 'linear-gradient(180deg, #0c1222 0%, #131c31 100%)';

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <style>{`
        .app-sidebar { width: ${SIDEBAR_W}px; }
        @media (min-width: 1024px) {
          .app-sidebar { width: ${collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W}px !important; }
        }
      `}</style>
      <aside
        className={cn(
          'app-sidebar fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{
          background: sidebarBg,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transition: mounted
            ? 'width 280ms cubic-bezier(0.16,1,0.3,1), transform 280ms cubic-bezier(0.16,1,0.3,1)'
            : 'none',
        }}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-[60px] shrink-0', collapsed ? 'lg:justify-center lg:px-0 px-5' : 'px-5')}>
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden" onClick={onClose}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              <Wallet className="w-[18px] h-[18px] text-white" />
            </div>
            <span
              className={cn(
                'font-bold text-[17px] text-white whitespace-nowrap overflow-hidden tracking-tight',
                'transition-all duration-200',
                collapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
              )}
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Cashflow
            </span>
          </Link>
          <button className="lg:hidden ml-auto p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className={cn('flex-1 py-4 overflow-y-auto overflow-x-hidden', collapsed ? 'lg:px-2 px-3' : 'px-3')}>
          <p className={cn(
            'text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2 transition-all duration-200',
            collapsed ? 'lg:hidden' : 'px-3'
          )}>
            Menu
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl text-[13px] font-medium',
                    'transition-all duration-200',
                    collapsed ? 'lg:justify-center lg:w-11 lg:h-10 lg:mx-auto lg:p-0 px-3 py-2.5' : 'px-3 py-2.5',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  )}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.15)',
                  } : undefined}
                >
                  {isActive && !collapsed && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)' }}
                    />
                  )}
                  <Icon className="w-[18px] h-[18px] shrink-0" style={isActive ? { color: '#a5b4fc' } : undefined} />
                  <span className={cn(
                    'whitespace-nowrap overflow-hidden transition-all duration-200',
                    collapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className={cn('py-3 space-y-1', collapsed ? 'lg:px-2 px-3' : 'px-3')}
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={toggleTheme}
            title={collapsed ? (theme === 'light' ? 'Dark' : 'Light') : undefined}
            className={cn(
              'flex items-center gap-3 w-full rounded-xl text-[13px] font-medium',
              'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-200',
              collapsed ? 'lg:justify-center lg:h-10 lg:w-11 lg:mx-auto lg:p-0 px-3 py-2.5' : 'px-3 py-2.5'
            )}
          >
            {theme === 'light' ? <Moon className="w-[18px] h-[18px] shrink-0" /> : <Sun className="w-[18px] h-[18px] shrink-0" />}
            <span className={cn('whitespace-nowrap overflow-hidden transition-all duration-200', collapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100')}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>
          <button
            onClick={onToggleCollapse}
            className={cn(
              'hidden lg:flex items-center gap-3 w-full rounded-xl text-[13px] font-medium',
              'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-200',
              collapsed ? 'lg:justify-center lg:h-10 lg:w-11 lg:mx-auto lg:p-0 px-3 py-2.5' : 'px-3 py-2.5'
            )}
          >
            {collapsed ? <PanelLeftOpen className="w-[18px] h-[18px] shrink-0" /> : <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />}
            <span className={cn('whitespace-nowrap overflow-hidden transition-all duration-200', collapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100')}>
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
