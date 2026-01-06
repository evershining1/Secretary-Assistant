import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
                    <h1 style={{ color: '#dc2626' }}>Something went wrong</h1>
                    <details style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
                        <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Error details</summary>
                        <code style={{ display: 'block', padding: '10px', background: '#f3f4f6', borderRadius: '4px' }}>
                            {this.state.error?.toString()}
                            {'\n\n'}
                            {this.state.error?.stack}
                        </code>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
