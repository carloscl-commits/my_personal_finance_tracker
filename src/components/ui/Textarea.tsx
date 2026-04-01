'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 text-[13px] rounded-xl resize-none transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            className
          )}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--expense)' : 'var(--border-color)'}`,
          }}
          rows={3}
          {...props}
        />
        {error && <p className="text-[11px]" style={{ color: 'var(--expense)' }}>{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
