import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
          background: 'var(--bg-primary, #0a0c10)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Etwas ist schiefgelaufen</h2>
          <p style={{ opacity: 0.6, marginBottom: '1.5rem', maxWidth: '400px' }}>
            Ein unerwarteter Fehler ist aufgetreten. Versuchen Sie es erneut oder laden Sie die Seite neu.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--accent-gold, #d4af37)',
                color: 'black',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Erneut versuchen
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
