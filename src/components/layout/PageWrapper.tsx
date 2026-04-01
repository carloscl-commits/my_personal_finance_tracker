'use client';

import React from 'react';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-6 lg:py-8 animate-fade-in">
        {children}
      </div>
    </main>
  );
}
