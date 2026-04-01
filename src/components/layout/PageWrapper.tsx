'use client';

import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {children}
      </div>
    </main>
  );
}
