'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'solid' | 'outline';
  className?: string;
}

export default function Badge({ children, color, variant = 'solid', className }: BadgeProps) {
  if (color && variant === 'solid') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full text-[11px] font-semibold tracking-wide',
          className
        )}
        style={{ backgroundColor: color + '22', color, padding: '6px 16px' }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full text-[11px] font-semibold tracking-wide',
        className
      )}
      style={{
        padding: '6px 16px',
        background: 'var(--bg-inset)',
        color: 'var(--text-secondary)',
        border: variant === 'outline' ? '1px solid var(--border-color)' : 'none',
      }}
    >
      {children}
    </span>
  );
}
