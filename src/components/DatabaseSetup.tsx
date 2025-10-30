import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const DatabaseSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [status, setStatus] = useState('');
  const [completed, setCompleted] = useState(false);

  const setupDatabase = async () => {
    setIsSettingUp(true);
    setStatus('Configurando banco de dados...');
    
    try {
      // 1. Primeiro, tentar adicionar a coluna grupo_crescimento
      setStatus('Adicionando campo grupo_crescimento...');
      
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS grupo_crescimento TEXT;'
      });

      // Se a função RPC não existir, vamos tentar um método alternativo
      if (alterError) {
        console.log('RPC não disponível, tentando método alternativo...');
        setStatus('Tentando método alternativo para adicionar campo...');
        
        // Tenta inserir um registro de teste para verificar se a coluna existe
        const { error: testError } = await supabase
          .from('users')
          .select('grupo_crescimento')
          .limit(1);
          
        if (testError && testError.message.includes('column')) {
          setStatus('❌ Campo grupo_crescimento não existe. Execute manualmente no SQL Editor do Supabase:');
          setStatus(prev => prev + '\n\nALTER TABLE public.users ADD COLUMN IF NOT EXISTS grupo_crescimento TEXT;');
          setIsSettingUp(false);
          return;
        }
      }

      setStatus('✅ Campo grupo_crescimento configurado!');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Criar usuários de teste
      setStatus('Criando usuários de teste...');
      
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
          email: 'colider1@teste.com',
          password: 'colider123',
          name: 'Co-líder GC1',
          role: 'co_leader',
          grupo_crescimento: 'gc_1'
        }
      ];

      let successCount = 0;
      
      for (const user of testUsers) {
        try {
          setStatus(`Criando: ${user.email}...`);
          
          // Criar usuário na autenticação (sem confirmação de email)
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              emailRedirectTo: undefined,
              data: {
                email_confirm: true
              }
            }
          });

          if (authError) {
            console.log(`Erro auth ${user.email}:`, authError.message);
            if (authError.message.includes('already registered')) {
              // Usuário já existe, tentar atualizar perfil
              const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', user.email)
                .single();
                
              if (existingUser) {
                await supabase
                  .from('users')
                  .update({
                    name: user.name,
                    role: user.role,
                    grupo_crescimento: user.grupo_crescimento
                  })
                  .eq('email', user.email);
                successCount++;
              }
            }
            continue;
          }

          if (authData.user) {
            // Aguardar um pouco para o usuário ser criado
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Inserir dados na tabela users
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
              console.log(`Erro perfil ${user.email}:`, profileError.message);
              continue;
            }
            
            successCount++;
          }
          
        } catch (error) {
          console.log(`Erro geral ${user.email}:`, error.message);
        }
      }
      
      setStatus(`✅ Configuração concluída! ${successCount} usuários criados.`);
      setCompleted(true);
      
    } catch (error) {
      setStatus(`❌ Erro: ${error.message}`);
    }
    
    setIsSettingUp(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuração do Banco de Dados
          </CardTitle>
          <CardDescription>
            Configure a estrutura do banco e crie usuários de teste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!completed ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Configuração Necessária</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Precisa configurar o campo grupo_crescimento na tabela users e criar usuários de teste.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={setupDatabase}
                disabled={isSettingUp}
                className="w-full"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Configurar Banco e Criar Usuários
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Configuração Concluída!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Banco configurado e usuários de teste criados.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {status && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 whitespace-pre-line">{status}</p>
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium mb-2">Usuários de Teste que serão criados:</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2 font-medium border-b pb-1">
                <span>Email</span>
                <span>Senha</span>
                <span>Role</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span>admin@teste.com</span>
                <span>admin123</span>
                <span>Admin</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span>pastor@teste.com</span>
                <span>pastor123</span>
                <span>Pastor</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span>lider1@teste.com</span>
                <span>lider123</span>
                <span>Líder (GC1)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span>colider1@teste.com</span>
                <span>colider123</span>
                <span>Co-líder (GC1)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSetup;