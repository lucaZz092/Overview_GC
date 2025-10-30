import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ocgmsuenqyfebkrqcmjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njc4OTgsImV4cCI6MjA3NzM0Mzg5OH0.Q25qhlkdNvINmyNUpq2OwW2Co4hBpVtOXxFTEXGGZZY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔄 Verificando tabelas existentes...');

  // Verificar se invitation_codes existe
  try {
    const { data: codesData, error: codesError } = await supabase
      .from('invitation_codes')
      .select('*')
      .limit(1);

    if (!codesError) {
      console.log('✅ Tabela invitation_codes existe!');
      console.log('Dados:', codesData);
      
      // Vamos usar essa tabela como base ou renomear
      console.log('\n🔄 Verificando estrutura da tabela invitation_codes...');
      
      const { data: allCodes, error: allCodesError } = await supabase
        .from('invitation_codes')
        .select('*');
        
      if (!allCodesError && allCodes) {
        console.log('📊 Estrutura atual:', Object.keys(allCodes[0] || {}));
        
        // Vamos adaptar nosso código para usar invitation_codes em vez de invitation_tokens
        console.log('\n💡 Sugestão: Vamos adaptar o LinkGenerator para usar invitation_codes');
      }
    } else {
      console.log('❌ invitation_codes não existe:', codesError);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar invitation_codes:', error);
  }

  // Verificar outras tabelas
  const tablesToCheck = ['users', 'members', 'meetings', 'reports'];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (!error) {
        console.log(`✅ Tabela ${table} existe`);
      } else {
        console.log(`❌ Tabela ${table} não existe:`, error.code);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar ${table}:`, error);
    }
  }
}

checkTables();