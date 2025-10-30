import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error boundary component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ 
      padding: '20px', 
      color: 'red', 
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap'
    }}>
      <h2>Something went wrong:</h2>
      <details style={{ whiteSpace: 'pre-wrap' }}>
        {error.message}
        {error.stack}
      </details>
    </div>
  )
}

// Wrap App in error boundary
function SafeApp() {
  try {
    return <App />
  } catch (error) {
    console.error('App error:', error)
    return <ErrorFallback error={error as Error} />
  }
}

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

try {
  root.render(<SafeApp />)
} catch (error) {
  console.error('Render error:', error)
  root.render(<ErrorFallback error={error as Error} />)
}
