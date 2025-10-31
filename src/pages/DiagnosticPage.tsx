import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
  const [testResults, setTestResults] = useState<any>({
    envVars: { url: false, key: false },
    supabaseImport: 'Testando...',
    authTest: 'Testando...',
    error: null
  });

  useEffect(() => {
    const runTests = async () => {
      const results: any = { envVars: {}, error: null };
      
      try {
        // Test 1: Variáveis de ambiente
        console.log('🧪 Test 1: Verificando variáveis de ambiente');
        results.envVars = {
          url: !!import.meta.env.VITE_SUPABASE_URL,
          key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          urlValue: import.meta.env.VITE_SUPABASE_URL || 'UNDEFINED'
        };
        console.log('✅ Env vars:', results.envVars);

        // Test 2: Import do Supabase
        console.log('🧪 Test 2: Importando Supabase');
        try {
          const { supabase } = await import('@/lib/supabase');
          results.supabaseImport = '✅ Importado com sucesso';
          console.log('✅ Supabase importado');

          // Test 3: Testar conexão
          console.log('🧪 Test 3: Testando conexão com Supabase');
          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              results.authTest = `❌ Erro: ${error.message}`;
              console.error('❌ Erro na conexão:', error);
            } else {
              results.authTest = '✅ Conexão OK';
              console.log('✅ Conexão funcionando');
            }
          } catch (authError: any) {
            results.authTest = `❌ Exception: ${authError.message}`;
            console.error('❌ Exception na conexão:', authError);
          }
        } catch (importError: any) {
          results.supabaseImport = `❌ Erro ao importar: ${importError.message}`;
          console.error('❌ Erro ao importar Supabase:', importError);
        }
      } catch (error: any) {
        results.error = error.message;
        console.error('❌ Erro geral:', error);
      }

      setTestResults(results);
    };

    runTests();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ color: '#4CAF50' }}>🔍 Diagnóstico Completo</h1>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h2>1. Variáveis de Ambiente</h2>
        <p>URL definida: {testResults.envVars.url ? '✅ SIM' : '❌ NÃO'}</p>
        <p>URL value: {testResults.envVars.urlValue}</p>
        <p>KEY definida: {testResults.envVars.key ? '✅ SIM' : '❌ NÃO'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h2>2. Import do Supabase</h2>
        <p>{testResults.supabaseImport}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h2>3. Teste de Conexão</h2>
        <p>{testResults.authTest}</p>
      </div>

      {testResults.error && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ff4444', borderRadius: '8px' }}>
          <h2>❌ Erro Geral</h2>
          <p>{testResults.error}</p>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          ← Voltar
        </button>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Testar Novamente
        </button>
      </div>
    </div>
  );
}
