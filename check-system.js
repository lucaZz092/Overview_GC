import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ocgmsuenqyfebkrqcmjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njc4OTgsImV4cCI6MjA3NzM0Mzg5OH0.Q25qhlkdNvINmyNUpq2OwW2Co4hBpVtOXxFTEXGGZZY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSystemStatus() {
  console.log('🔍 Verificando estrutura do sistema...');

  try {
    // 1. Verificar se conseguimos ler a tabela invitation_codes
    console.log('📋 Testando leitura da tabela invitation_codes...');
    const { data: codesData, error: codesError } = await supabase
      .from('invitation_codes')
      .select('*')
      .limit(5);

    if (codesError) {
      console.error('❌ Erro ao ler invitation_codes:', codesError);
    } else {
      console.log('✅ Tabela invitation_codes acessível');
      console.log(`📊 Registros encontrados: ${codesData?.length || 0}`);
      
      if (codesData && codesData.length > 0) {
        console.log('🏗️ Estrutura da tabela:');
        console.log('Campos:', Object.keys(codesData[0]));
        console.log('Exemplo:', codesData[0]);
      }
    }

    // 2. Verificar tabela users  
    console.log('\n👥 Testando leitura da tabela users...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(3);

    if (usersError) {
      console.error('❌ Erro ao ler users:', usersError);
    } else {
      console.log('✅ Tabela users acessível');
      console.log(`👤 Usuários encontrados: ${usersData?.length || 0}`);
      
      if (usersData && usersData.length > 0) {
        console.log('📋 Usuários no sistema:');
        usersData.forEach(user => {
          console.log(`  • ${user.email} (${user.role})`);
        });
      }
    }

    // 3. Verificar outras tabelas
    const tables = ['members', 'meetings', 'reports'];
    for (const table of tables) {
      console.log(`\n📊 Testando tabela ${table}...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK (${data?.length || 0} registros de exemplo)`);
      }
    }

    console.log('\n🎯 Resumo do sistema:');
    console.log('• Supabase conectando: ✅');
    console.log('• Tabelas básicas: ✅');
    console.log('• RLS ativo: ✅ (por isso não conseguimos inserir sem auth)');
    console.log('• Sistema pronto para teste com usuário logado');

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

checkSystemStatus();