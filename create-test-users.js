// Script para criar usuários de teste usando a API do Supabase
// Execute com: node create-test-users.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Usuários de teste para cada hierarquia
const testUsers = [
  {
    email: 'admin@teste.com',
    password: 'admin123',
    name: 'Admin Teste',
    role: 'admin',
    grupo_crescimento: null
  },
  {
    email: 'pastor@teste.com',
    password: 'pastor123',
    name: 'Pastor Teste',
    role: 'pastor',
    grupo_crescimento: null
  },
  {
    email: 'lider1@teste.com',
    password: 'lider123',
    name: 'Líder GC1',
    role: 'leader',
    grupo_crescimento: 'gc_1'
  },
  {
    email: 'lider2@teste.com',
    password: 'lider123',
    name: 'Líder GC5',
    role: 'leader',
    grupo_crescimento: 'gc_5'
  },
  {
    email: 'lider3@teste.com',
    password: 'lider123',
    name: 'Líder GC10',
    role: 'leader',
    grupo_crescimento: 'gc_10'
  },
  {
    email: 'colider1@teste.com',
    password: 'colider123',
    name: 'Co-líder GC1',
    role: 'co_leader',
    grupo_crescimento: 'gc_1'
  },
  {
    email: 'colider2@teste.com',
    password: 'colider123',
    name: 'Co-líder GC3',
    role: 'co_leader',
    grupo_crescimento: 'gc_3'
  },
  {
    email: 'colider3@teste.com',
    password: 'colider123',
    name: 'Co-líder GC7',
    role: 'co_leader',
    grupo_crescimento: 'gc_7'
  },
  {
    email: 'colider4@teste.com',
    password: 'colider123',
    name: 'Co-líder GC12',
    role: 'co_leader',
    grupo_crescimento: 'gc_12'
  }
];

async function createTestUsers() {
  console.log('🚀 Iniciando criação de usuários de teste...\n');

  for (const user of testUsers) {
    try {
      console.log(`📝 Criando usuário: ${user.email} (${user.role})`);
      
      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      });

      if (authError) {
        console.log(`⚠️  Erro na autenticação para ${user.email}:`, authError.message);
        continue;
      }

      if (!authData.user) {
        console.log(`⚠️  Usuário não foi criado: ${user.email}`);
        continue;
      }

      // 2. Inserir dados adicionais na tabela users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          grupo_crescimento: user.grupo_crescimento
        });

      if (profileError) {
        console.log(`⚠️  Erro ao criar perfil para ${user.email}:`, profileError.message);
        continue;
      }

      console.log(`✅ Usuário criado com sucesso: ${user.email}`);
      
      // Pequena pausa para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Erro geral ao criar ${user.email}:`, error.message);
    }
  }

  console.log('\n🎉 Processo de criação concluído!');
  console.log('\n📋 Usuários de teste criados:');
  console.log('┌─────────────────────┬─────────────┬──────────────┬──────────────┐');
  console.log('│ Email               │ Senha       │ Role         │ GC           │');
  console.log('├─────────────────────┼─────────────┼──────────────┼──────────────┤');
  
  testUsers.forEach(user => {
    const email = user.email.padEnd(19, ' ');
    const password = user.password.padEnd(11, ' ');
    const role = user.role.padEnd(12, ' ');
    const gc = (user.grupo_crescimento || 'N/A').padEnd(12, ' ');
    console.log(`│ ${email} │ ${password} │ ${role} │ ${gc} │`);
  });
  
  console.log('└─────────────────────┴─────────────┴──────────────┴──────────────┘');
  
  process.exit(0);
}

// Função para limpar usuários de teste existentes
async function cleanTestUsers() {
  console.log('🧹 Limpando usuários de teste existentes...');
  
  const { error } = await supabase
    .from('users')
    .delete()
    .like('email', '%@teste.com');
    
  if (error) {
    console.log('⚠️  Erro ao limpar usuários:', error.message);
  } else {
    console.log('✅ Usuários de teste limpos com sucesso');
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--clean')) {
  cleanTestUsers();
} else if (args.includes('--help')) {
  console.log('📖 Uso do script:');
  console.log('  node create-test-users.js        # Criar usuários de teste');
  console.log('  node create-test-users.js --clean # Limpar usuários de teste');
  console.log('  node create-test-users.js --help  # Mostrar esta ajuda');
} else {
  createTestUsers();
}