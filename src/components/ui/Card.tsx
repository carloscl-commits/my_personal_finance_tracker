'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export default function Card({ children, className, hover = false, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-card rounded-xl border border-border',
        padding && 'p-5',
        hover && 'card-hover cursor-pointer',
        className
      )}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {children}
    </div>
  );
}
