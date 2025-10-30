import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ocgmsuenqyfebkrqcmjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njc4OTgsImV4cCI6MjA3NzM0Mzg5OH0.Q25qhlkdNvINmyNUpq2OwW2Co4hBpVtOXxFTEXGGZZY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createInvitationTokensTable() {
  console.log('🔄 Criando tabela invitation_tokens...');

  // Primeiro, vamos criar a tabela básica usando uma função SQL
  const createTableSQL = `
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_token ON public.invitation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_expires ON public.invitation_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_active ON public.invitation_tokens(is_active);

-- Habilitar RLS
ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para invitation_tokens
CREATE POLICY "Admin can manage invitation tokens" ON public.invitation_tokens
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can view tokens for validation" ON public.invitation_tokens
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
  `;

  try {
    // Usar uma função SQL personalizada (se existir) ou direto
    const { data, error } = await supabase.rpc('exec_sql', { query: createTableSQL });
    
    if (error) {
      console.log('❌ Função exec_sql não disponível, tentando abordagem alternativa...');
      
      // Vamos criar um registro temporário para testar se já existe
      const { data: testData, error: testError } = await supabase
        .from('invitation_tokens')
        .select('id')
        .limit(1);
        
      if (testError && testError.code === 'PGRST116') {
        console.log('❌ Tabela não existe. Por favor, execute o SQL manualmente no Supabase Dashboard.');
        console.log('\n📋 SQL para executar:');
        console.log('=====================================');
        console.log(createTableSQL);
        console.log('=====================================\n');
        
        console.log('🔗 Como executar:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/ocgmsuenqyfebkrqcmjn/sql');
        console.log('2. Cole o SQL acima');
        console.log('3. Clique em "Run"');
        console.log('4. Depois execute novamente este script');
        
        return;
      } else {
        console.log('✅ Tabela invitation_tokens já existe!');
      }
    } else {
      console.log('✅ SQL executado com sucesso!');
    }

    // Testar se conseguimos acessar a tabela
    const { data: testData, error: testError } = await supabase
      .from('invitation_tokens')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erro ao testar tabela:', testError);
    } else {
      console.log('✅ Tabela invitation_tokens está funcionando!');
      
      // Criar algumas funções básicas se possível
      await createFunctions();
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function createFunctions() {
  console.log('🔄 Criando funções auxiliares...');
  
  const generateTokenFunction = `
CREATE OR REPLACE FUNCTION public.generate_invitation_token(
    p_role TEXT,
    p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_token TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_token_id UUID;
BEGIN
    -- Verificar se é admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_admin_id AND role = 'admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Apenas administradores podem gerar tokens'
        );
    END IF;
    
    -- Gerar token único
    v_token := encode(
        digest(
            extract(epoch from now())::text || 
            gen_random_uuid()::text || 
            p_role, 
            'sha256'
        ), 
        'hex'
    );
    
    -- Token expira em 30 minutos
    v_expires_at := NOW() + INTERVAL '30 minutes';
    
    -- Inserir token
    INSERT INTO public.invitation_tokens (token, role, created_by, expires_at)
    VALUES (v_token, p_role, p_admin_id, v_expires_at)
    RETURNING id INTO v_token_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'token', v_token,
        'role', p_role,
        'expires_at', v_expires_at
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: generateTokenFunction });
    
    if (error) {
      console.log('❌ Não foi possível criar função automaticamente');
      console.log('📋 Execute este SQL manualmente no Supabase:');
      console.log('=====================================');
      console.log(generateTokenFunction);
      console.log('=====================================');
    } else {
      console.log('✅ Função generate_invitation_token criada!');
    }
  } catch (error) {
    console.log('❌ Erro ao criar função:', error);
  }
}

createInvitationTokensTable();