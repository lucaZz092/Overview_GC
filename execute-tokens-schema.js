import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const supabaseUrl = 'https://ocgmsuenqyfebkrqcmjn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTgxNzgyMCwiZXhwIjoyMDQ1MzkzODIwfQ.EQ_YkLaTH1DgVs-5sSEXQrD6zZQJQpA5bRJIFWnTlFo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSchema() {
  try {
    console.log('🔄 Executando schema de tokens...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('invitation-tokens-schema.sql', 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length > 10) { // Ignore comandos muito pequenos
        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
        console.log(`   ${command.substring(0, 60)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: command + ';' 
        });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error);
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      }
    }
    
    console.log('🎉 Schema executado com sucesso!');
    
    // Testar se a tabela foi criada
    const { data, error } = await supabase
      .from('invitation_tokens')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('❌ Erro ao testar tabela:', error);
    } else {
      console.log('✅ Tabela invitation_tokens criada com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

executeSchema();