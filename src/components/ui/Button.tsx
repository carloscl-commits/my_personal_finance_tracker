'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 btn-press focus:outline-none disabled:opacity-50 disabled:pointer-events-none';

  const variantStyle: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-card)',
    },
    ghost: { background: 'transparent', color: 'var(--text-secondary)' },
    danger: {
      background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(244,63,94,0.25)',
    },
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-[12px] gap-1.5',
    md: 'h-9 px-4 text-[13px] gap-2',
    lg: 'h-10 px-5 text-sm gap-2',
  };

  return (
    <button
      className={cn(base, sizes[size], className)}
      style={variantStyle[variant]}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
