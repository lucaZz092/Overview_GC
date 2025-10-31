export default function DiagnosticPage() {
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Diagnóstico</h1>
      <p>URL: {hasUrl ? 'OK' : 'FALTA'}</p>
      <p>KEY: {hasKey ? 'OK' : 'FALTA'}</p>
      <button onClick={() => window.location.href = '/'}>Voltar</button>
    </div>
  );
}
