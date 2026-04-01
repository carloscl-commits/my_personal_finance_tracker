'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-9 px-3 text-[13px] rounded-xl transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            className
          )}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--expense)' : 'var(--border-color)'}`,
          }}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-[11px]" style={{ color: 'var(--expense)' }}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
