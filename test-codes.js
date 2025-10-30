import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ocgmsuenqyfebkrqcmjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njc4OTgsImV4cCI6MjA3NzM0Mzg5OH0.Q25qhlkdNvINmyNUpq2OwW2Co4hBpVtOXxFTEXGGZZY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInvitationCodes() {
  console.log('🧪 Testando sistema de invitation_codes...');

  try {
    // Tentar inserir um código de teste
    const testCode = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    console.log('📝 Tentando inserir código de teste...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('invitation_codes')
      .insert([{
        code: testCode,
        role: 'leader',
        description: 'Código de teste automático',
        expires_at: expiresAt.toISOString(),
        max_uses: 1,
        current_uses: 0,
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      console.log('💡 Pode ser que faltem campos na tabela. Vamos verificar a estrutura...');
      
      // Tentar buscar registros existentes para ver a estrutura
      const { data: existingData, error: selectError } = await supabase
        .from('invitation_codes')
        .select('*')
        .limit(1);
        
      if (selectError) {
        console.error('❌ Erro ao buscar dados:', selectError);
      } else if (existingData && existingData.length > 0) {
        console.log('📊 Estrutura atual da tabela:');
        console.log('Campos disponíveis:', Object.keys(existingData[0]));
      } else {
        console.log('📊 Tabela vazia, tentando inserir com campos mínimos...');
        
        // Tentar com campos básicos
        const { data: simpleData, error: simpleError } = await supabase
          .from('invitation_codes')
          .insert([{
            code: testCode,
            role: 'leader'
          }])
          .select();
          
        if (simpleError) {
          console.error('❌ Erro com campos básicos:', simpleError);
        } else {
          console.log('✅ Inserção simples funcionou:', simpleData);
        }
      }
    } else {
      console.log('✅ Código inserido com sucesso:', insertData);
      
      // Tentar buscar o código
      const { data: fetchData, error: fetchError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', testCode)
        .single();
        
      if (fetchError) {
        console.error('❌ Erro ao buscar código:', fetchError);
      } else {
        console.log('✅ Código encontrado:', fetchData);
        
        // Limpar o código de teste
        const { error: deleteError } = await supabase
          .from('invitation_codes')
          .delete()
          .eq('id', insertData.id);
          
        if (deleteError) {
          console.warn('⚠️ Não conseguiu deletar código de teste:', deleteError);
        } else {
          console.log('🧹 Código de teste removido');
        }
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testInvitationCodes();