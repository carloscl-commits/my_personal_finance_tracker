'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
          <div className="text-center max-w-md px-6">
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              An unexpected error occurred. Try refreshing the page.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ background: 'var(--accent, #6366f1)' }}
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('finance_app_data');
                  window.location.reload();
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg"
                style={{ color: 'var(--text-secondary, #475569)', background: 'var(--bg-hover, rgba(0,0,0,0.03))' }}
              >
                Reset App Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
