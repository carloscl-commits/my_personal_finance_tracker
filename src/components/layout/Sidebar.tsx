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

const DURATION = '400ms';
const EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';
const T = `${DURATION} ${EASE}`;

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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  // All values are fixed px so CSS can interpolate
  const itemW = collapsed ? 40 : SIDEBAR_W - 24;
  const itemPx = collapsed ? 0 : 12;
  const anim = mounted ? T : '0ms';

  const itemGap = collapsed ? 0 : 12;

  // Shared transition string for nav items & buttons
  const itemTransition = `width ${anim}, padding-left ${anim}, padding-right ${anim}, gap ${anim}, background 150ms, color 150ms`;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <style>{`
        .app-sidebar { width: ${SIDEBAR_W}px; }
        @media (min-width: 1024px) {
          .app-sidebar {
            width: ${collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W}px !important;
            transform: translateX(0) !important;
          }
        }
      `}</style>

      <aside
        className="app-sidebar fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(180deg, #070b14 0%, #0e1525 100%)'
            : 'linear-gradient(180deg, #111827 0%, #1e293b 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: mounted ? `width ${T}, transform ${T}` : 'none',
        }}
      >
        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 64, flexShrink: 0 }}>
          <Link
            href="/dashboard"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: itemGap,
              width: itemW,
              overflow: 'hidden',
              transition: `width ${anim}, gap ${anim}`,
              textDecoration: 'none',
            }}
          >
            <div
              className="shrink-0"
              style={{
                width: 36, height: 36, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Wallet style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontWeight: 700, fontSize: 17, color: '#fff',
                whiteSpace: 'nowrap', letterSpacing: '-0.02em',
                opacity: collapsed ? 0 : 1,
                transition: `opacity ${anim}`,
              }}
            >
              Cashflow
            </span>
          </Link>
          <button
            className="lg:hidden"
            onClick={onClose}
            style={{
              position: 'absolute', right: 12, top: 20, padding: 6,
              borderRadius: 8, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 16 }}>
          <p style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em',
            color: '#64748b', width: itemW, paddingLeft: 4, overflow: 'hidden', whiteSpace: 'nowrap',
            opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 18, marginBottom: collapsed ? 0 : 8,
            transition: `width ${anim}, opacity ${anim}, height ${anim}, margin ${anim}`,
          }}>
            Menu
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%' }}>
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={cn(!isActive && 'hover:bg-white/[0.05]')}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: itemGap, width: itemW, height: 40, borderRadius: 8,
                    paddingLeft: itemPx, paddingRight: itemPx,
                    fontSize: 13, fontWeight: 500, textDecoration: 'none',
                    color: isActive ? '#fff' : '#94a3b8',
                    overflow: 'hidden', position: 'relative',
                    transition: itemTransition,
                    ...(isActive ? {
                      background: 'rgba(99, 102, 241, 0.15)',
                      boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.2)',
                    } : {}),
                  }}
                >
                  {isActive && !collapsed && (
                    <span style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 16, borderRadius: '0 99px 99px 0', background: '#818cf8',
                    }} />
                  )}
                  <Icon className="shrink-0" style={{ width: 18, height: 18, color: isActive ? '#a5b4fc' : undefined }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1, transition: `width ${anim}, opacity ${anim}` }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── Bottom ── */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center',
        }}>
          <button
            onClick={toggleTheme}
            title={collapsed ? (theme === 'light' ? 'Dark' : 'Light') : undefined}
            className="hover:bg-white/[0.05]"
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: itemGap, width: itemW, height: 40, borderRadius: 8,
              paddingLeft: itemPx, paddingRight: itemPx,
              fontSize: 13, fontWeight: 500, color: '#94a3b8',
              background: 'none', border: 'none', cursor: 'pointer', overflow: 'hidden',
              transition: itemTransition,
            }}
          >
            {theme === 'light'
              ? <Moon className="shrink-0" style={{ width: 18, height: 18 }} />
              : <Sun className="shrink-0" style={{ width: 18, height: 18 }} />
            }
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1, transition: `width ${anim}, opacity ${anim}` }}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex hover:bg-white/[0.05]"
            style={{
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: itemGap, width: itemW, height: 40, borderRadius: 8,
              paddingLeft: itemPx, paddingRight: itemPx,
              fontSize: 13, fontWeight: 500, color: '#94a3b8',
              background: 'none', border: 'none', cursor: 'pointer', overflow: 'hidden',
              transition: itemTransition,
            }}
          >
            {collapsed
              ? <PanelLeftOpen className="shrink-0" style={{ width: 18, height: 18 }} />
              : <PanelLeftClose className="shrink-0" style={{ width: 18, height: 18 }} />
            }
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', width: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1, transition: `width ${anim}, opacity ${anim}` }}>
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
