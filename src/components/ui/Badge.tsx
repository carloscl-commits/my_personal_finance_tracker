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
          'inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide',
          className
        )}
        style={{ backgroundColor: color + '16', color }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide',
        className
      )}
      style={{
        background: 'var(--bg-inset)',
        color: 'var(--text-secondary)',
        border: variant === 'outline' ? '1px solid var(--border-color)' : 'none',
      }}
    >
      {children}
    </span>
  );
}
