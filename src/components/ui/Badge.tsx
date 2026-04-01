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
          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
          className
        )}
        style={{
          backgroundColor: color + '20',
          color: color,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        variant === 'outline'
          ? 'border border-border text-text-secondary'
          : 'bg-bg-secondary text-text-secondary',
        className
      )}
    >
      {children}
    </span>
  );
}
