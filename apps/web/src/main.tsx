import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './intro.css';
import App from './App';
import { TournamentProvider } from './game/tournamentContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#090909', color: '#ff6b6b', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Application Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#1a0000', padding: '20px', borderRadius: '8px' }}>
            {this.state.error?.toString()}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TournamentProvider>
        <App />
      </TournamentProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
