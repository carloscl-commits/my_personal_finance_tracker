'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const sizeMap: Record<ButtonSize, { height: number; padding: string; fontSize: number; gap: number }> = {
  sm: { height: 32, padding: '0 12px', fontSize: 12, gap: 6 },
  md: { height: 36, padding: '0 16px', fontSize: 13, gap: 8 },
  lg: { height: 40, padding: '0 20px', fontSize: 14, gap: 8 },
};

const variantMap: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--bg-page)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: '#dc2626',
    color: '#fff',
    border: '1px solid transparent',
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  disabled,
  style: styleProp,
  ...props
}: ButtonProps) {
  const s = sizeMap[size];
  const v = variantMap[variant];

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        borderRadius: 10,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'background 150ms, opacity 150ms',
        whiteSpace: 'nowrap',
        ...v,
        ...styleProp,
      }}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
