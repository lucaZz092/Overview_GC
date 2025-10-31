import { createRoot } from 'react-dom/client'
import { Component, ErrorInfo, ReactNode } from 'react'
import App from './App.tsx'
import './index.css'

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📍 Error info:', errorInfo);
    console.error('📊 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          backgroundColor: '#1a1a1a',
          color: '#ff6b6b',
          fontFamily: 'monospace',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>🚨 Erro na Aplicação</h1>
          
          <div style={{ 
            backgroundColor: '#2d2d2d', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#ffd93d' }}>Erro:</h2>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#fff' }}>
              {this.state.error?.toString()}
            </pre>
          </div>

          {this.state.error?.message && (
            <div style={{ 
              backgroundColor: '#2d2d2d', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#ffd93d' }}>Mensagem:</h2>
              <pre style={{ whiteSpace: 'pre-wrap', color: '#fff' }}>
                {this.state.error.message}
              </pre>
            </div>
          )}

          {this.state.error?.stack && (
            <div style={{ 
              backgroundColor: '#2d2d2d', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#ffd93d' }}>Stack Trace:</h2>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                color: '#fff',
                fontSize: '12px',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                {this.state.error.stack}
              </pre>
            </div>
          )}

          {this.state.errorInfo && (
            <div style={{ 
              backgroundColor: '#2d2d2d', 
              padding: '20px', 
              borderRadius: '8px'
            }}>
              <h2 style={{ color: '#ffd93d' }}>Component Stack:</h2>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                color: '#fff',
                fontSize: '12px',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}

          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
