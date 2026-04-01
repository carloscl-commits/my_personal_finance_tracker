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
      <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center mb-4">
        {icon || <Inbox className="w-7 h-7 text-text-tertiary" />}
      </div>
      <h3
        className="text-base font-bold text-text-primary mb-1"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {title}
      </h3>
      <p className="text-sm text-text-tertiary max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}
