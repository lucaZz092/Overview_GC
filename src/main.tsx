import React from 'react'
import { createRoot } from 'react-dom/client'
import Index from './pages/Index.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import DiagnosticPage from './components/DiagnosticPage.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'

// Verificar variáveis de ambiente
const checkEnv = () => {
  console.log('🔍 Verificando variáveis de ambiente:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Definida' : '❌ Não encontrada');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não encontrada');
  
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Variáveis de ambiente do Supabase não encontradas. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas.');
  }
};

function SafeApp() {
  try {
    checkEnv();
    return (
      <AuthProvider>
        <Index />
      </AuthProvider>
    )
  } catch (error) {
    console.error('Erro na inicialização:', error);
    // Em caso de erro, mostrar página de diagnóstico
    return <DiagnosticPage />;
  }
}

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

try {
  root.render(
    <ErrorBoundary>
      <SafeApp />
    </ErrorBoundary>
  )
} catch (error) {
  console.error('Render error:', error)
  // Fallback direto no DOM se tudo falhar
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: Arial;">
      <h2>🚨 Erro crítico na aplicação</h2>
      <p>Erro: ${error}</p>
      <button onclick="window.location.reload()">Recarregar</button>
    </div>
  `
}
