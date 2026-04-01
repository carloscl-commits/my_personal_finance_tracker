'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-9 px-3 text-[13px] rounded-xl transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            className
          )}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--expense)' : 'var(--border-color)'}`,
            // @ts-expect-error CSS custom property
            '--tw-ring-color': 'color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
          {...props}
        />
        {error && <p className="text-[11px]" style={{ color: 'var(--expense)' }}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
