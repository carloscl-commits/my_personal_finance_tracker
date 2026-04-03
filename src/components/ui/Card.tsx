'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className, hover = false, padding = true, style }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl',
        hover && 'card-hover cursor-pointer',
        className
      )}
      style={{
        ...(padding ? { padding: 32 } : {}),
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
