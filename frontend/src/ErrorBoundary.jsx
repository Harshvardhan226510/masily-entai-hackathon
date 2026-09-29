import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', backgroundColor: '#fef2f2', color: '#991b1b', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Frontend Crash Detected</h2>
          <p>Please copy this exact error message and send it to me:</p>
          <div style={{ backgroundColor: '#fee2e2', padding: '20px', borderRadius: '8px', marginTop: '10px' }}>
            <p style={{ fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '20px', fontSize: '12px', opacity: 0.8 }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
