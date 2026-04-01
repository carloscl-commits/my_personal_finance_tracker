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
        'rounded-2xl',
        hover && 'card-hover cursor-pointer',
        className
      )}
      style={{
        padding: padding ? 32 : 0,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {children}
    </div>
  );
}
