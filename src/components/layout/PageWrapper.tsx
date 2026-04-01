'use client';

import React from 'react';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div
        className="mx-auto animate-fade-in"
        style={{
          maxWidth: 1320,
          padding: '28px 28px 40px',
        }}
      >
        {children}
      </div>
    </main>
  );
}
