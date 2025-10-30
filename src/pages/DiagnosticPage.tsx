import { useEffect, useState } from 'react';

const DiagnosticPage = () => {
  const [envVars, setEnvVars] = useState({
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

  const [urlStatus, setUrlStatus] = useState('Verificando...');
  const [keyStatus, setKeyStatus] = useState('Verificando...');

  useEffect(() => {
    // Check URL
    if (envVars.url && envVars.url.startsWith('http')) {
      setUrlStatus('✅ Válida e carregada');
    } else if (envVars.url) {
      setUrlStatus('❌ Inválida (não parece ser um URL)');
    } else {
      setUrlStatus('❌ Não encontrada');
    }

    // Check Key
    if (envVars.key && envVars.key.length > 50) {
      setKeyStatus('✅ Carregada (formato parece correto)');
    } else if (envVars.key) {
      setKeyStatus('❌ Inválida (muito curta)');
    } else {
      setKeyStatus('❌ Não encontrada');
    }
  }, [envVars]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: 'auto', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>Página de Diagnóstico de Ambiente</h1>
        <p>Esta página verifica se as variáveis de ambiente necessárias para a conexão com o Supabase estão configuradas corretamente no ambiente de produção (Vercel).</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Variáveis de Ambiente do Supabase</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
            <p><strong>VITE_SUPABASE_URL:</strong></p>
            <p style={{ wordBreak: 'break-all', backgroundColor: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' }}>
              {envVars.url || 'Não definida'}
            </p>
            <p><strong>Status:</strong> {urlStatus}</p>
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', marginTop: '1rem' }}>
            <p><strong>VITE_SUPABASE_ANON_KEY:</strong></p>
            <p style={{ wordBreak: 'break-all', backgroundColor: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' }}>
              {envVars.key ? `${envVars.key.substring(0, 15)}...` : 'Não definida'}
            </p>
            <p><strong>Status:</strong> {keyStatus}</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <h3>Próximos Passos:</h3>
            <ul>
                <li>Se alguma variável estiver "Não encontrada" ou "Inválida", verifique as configurações do seu projeto no painel da Vercel.</li>
                <li>As variáveis devem ser nomeadas como <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.</li>
                <li>Certifique-se de que os valores copiados do Supabase estão corretos.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
