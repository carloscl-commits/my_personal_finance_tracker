'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-inset)' }}
      >
        {icon || <Inbox className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />}
      </div>
      <h3
        className="text-sm font-bold mb-1"
        style={{
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h3>
      <p className="text-[13px] max-w-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
      {action}
    </div>
  );
}
