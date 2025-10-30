// Script para executar SQL no Supabase via API REST
const SUPABASE_URL = 'https://ocgmsuenqyfebkrqcmjn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTgxNzgyMCwiZXhwIjoyMDQ1MzkzODIwfQ.EQ_YkLaTH1DgVs-5sSEXQrD6zZQJQpA5bRJIFWnTlFo';

async function executeSQL() {
  const sql = `
    -- Sistema de Links de Convite Temporários
    -- Tabela de tokens de convite
    CREATE TABLE IF NOT EXISTS public.invitation_tokens (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        token TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('pastor', 'leader', 'co_leader')),
        created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
        used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN DEFAULT true
    );
  `;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ sql })
    });

    const result = await response.text();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Tabela criada com sucesso!');
    } else {
      console.log('❌ Erro ao criar tabela:', result);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

executeSQL();