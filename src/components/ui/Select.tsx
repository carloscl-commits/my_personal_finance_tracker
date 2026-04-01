'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, style: styleProp, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          style={{
            width: '100%',
            height: 36,
            padding: '0 30px 0 12px',
            fontSize: 13,
            borderRadius: 8,
            border: `1px solid ${error ? 'var(--expense)' : 'var(--border-color)'}`,
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: CHEVRON,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            transition: 'border-color 150ms',
            ...styleProp,
          }}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && (
          <p style={{ fontSize: 11, color: 'var(--expense)' }}>{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
