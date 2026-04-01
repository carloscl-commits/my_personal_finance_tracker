'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full rounded-2xl animate-scale-in max-h-[90vh] flex flex-col',
          sizeStyles[size]
        )}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <h2
            style={{
              fontSize: 15, fontWeight: 700,
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8, color: 'var(--text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'opacity 150ms',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
