import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in component tree:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#070b1f',
            color: '#e8efff',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'rgba(232,244,255,0.7)', maxWidth: '32rem', marginBottom: '1.5rem' }}>
            An unexpected error prevented the page from rendering. Try refreshing
            or click the button below.
          </p>
          <pre
            style={{
              background: 'rgba(255,255,255,0.06)',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              maxWidth: '40rem',
              overflowX: 'auto',
              fontSize: '0.85rem',
              color: '#ff6b6b',
              marginBottom: '1.5rem',
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #6b67ff, #43d9ff)',
              color: '#041233',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
