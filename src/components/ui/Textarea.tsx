'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, style: styleProp, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && (
          <label
            htmlFor={textareaId}
            style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 13,
            borderRadius: 8,
            border: `1px solid ${error ? 'var(--expense)' : 'var(--border-color)'}`,
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            outline: 'none',
            resize: 'none',
            transition: 'border-color 150ms',
            ...styleProp,
          }}
          rows={3}
          {...props}
        />
        {error && (
          <p style={{ fontSize: 11, color: 'var(--expense)' }}>{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
