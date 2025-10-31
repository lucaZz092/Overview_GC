import React from 'react';

const DiagnosticPage: React.FC = () => {
  const env = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não encontrada',
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
  };

  const browserInfo = {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🔍 Diagnóstico da Aplicação</h1>
      
      <div style={{ 
        backgroundColor: '#f0f8ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #b0d4ff'
      }}>
        <h2>📊 Status do Sistema</h2>
        <p>✅ React carregado com sucesso</p>
        <p>✅ Componente de diagnóstico renderizado</p>
        <p>✅ JavaScript executando normalmente</p>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h2>🔧 Variáveis de Ambiente</h2>
        <ul>
          <li><strong>VITE_SUPABASE_URL:</strong> {env.supabaseUrl || '❌ Não encontrada'}</li>
          <li><strong>VITE_SUPABASE_ANON_KEY:</strong> {env.supabaseKey}</li>
          <li><strong>MODE:</strong> {env.mode}</li>
          <li><strong>DEV:</strong> {env.dev ? 'true' : 'false'}</li>
          <li><strong>PROD:</strong> {env.prod ? 'true' : 'false'}</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <h2>🌐 Informações do Navegador</h2>
        <ul>
          <li><strong>URL:</strong> {browserInfo.url}</li>
          <li><strong>User Agent:</strong> {browserInfo.userAgent}</li>
          <li><strong>Timestamp:</strong> {browserInfo.timestamp}</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: env.supabaseUrl ? '#d4edda' : '#f8d7da', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: `1px solid ${env.supabaseUrl ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <h2>🔑 Status do Supabase</h2>
        {env.supabaseUrl ? (
          <div>
            <p>✅ URL configurada: {env.supabaseUrl}</p>
            <p>✅ Chave API configurada</p>
            <p>Tentando conectar...</p>
          </div>
        ) : (
          <div>
            <p>❌ Variáveis de ambiente do Supabase não encontradas</p>
            <p>Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🔄 Recarregar Página
      </button>

      <button 
        onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          marginLeft: '10px'
        }}
      >
        🗑️ Limpar Cache e Recarregar
      </button>
    </div>
  );
};

export default DiagnosticPage;