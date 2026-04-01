'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, style: styleProp, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            width: '100%',
            height: 36,
            padding: '0 12px',
            fontSize: 13,
            borderRadius: 8,
            border: `1px solid ${error ? 'var(--expense)' : 'var(--border-color)'}`,
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 150ms',
            ...styleProp,
          }}
          {...props}
        />
        {error && (
          <p style={{ fontSize: 11, color: 'var(--expense)' }}>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
