import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Database, CheckCircle, AlertCircle, Loader2, Copy } from 'lucide-react';

const QuickSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [status, setStatus] = useState('');
  const [completed, setCompleted] = useState(false);
  const [copiedField, setCopiedField] = useState('');

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

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const setupManual = async () => {
    setIsSettingUp(true);
    setStatus('Preparando configuração manual...');
    
    try {
      // Gerar SQL para adicionar a coluna
      const alterTableSQL = `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS grupo_crescimento TEXT;`;
      
      // Gerar SQL para inserir usuários (assumindo que eles foram criados manualmente)
      const insertUsersSQL = `
-- Execute estes comandos no SQL Editor do Supabase:

-- 1. Primeiro, adicione a coluna grupo_crescimento:
${alterTableSQL}

-- 2. Depois, se você criou os usuários manualmente no painel Auth, 
--    atualize seus perfis com este comando:
${testUsers.map(user => `
UPDATE public.users 
SET name = '${user.name}', 
    role = '${user.role}', 
    grupo_crescimento = ${user.grupo_crescimento ? `'${user.grupo_crescimento}'` : 'NULL'}
WHERE email = '${user.email}';`).join('')}

-- 3. Ou insira diretamente (se souber os UUIDs):
${testUsers.map(user => `
INSERT INTO public.users (id, email, name, role, grupo_crescimento) 
VALUES ('UUID_DO_USUARIO', '${user.email}', '${user.name}', '${user.role}', ${user.grupo_crescimento ? `'${user.grupo_crescimento}'` : 'NULL'})
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  grupo_crescimento = EXCLUDED.grupo_crescimento;`).join('')}
      `;
      
      setStatus(insertUsersSQL);
      setCompleted(true);
      
    } catch (error) {
      setStatus(`❌ Erro: ${error.message}`);
    }
    
    setIsSettingUp(false);
  };

  const setupDirect = async () => {
    setIsSettingUp(true);
    setStatus('Tentando criar usuários diretamente...');
    
    try {
      // Primeiro verificar se conseguimos adicionar a coluna
      setStatus('Verificando estrutura da tabela...');
      
      // Tentar fazer uma query para ver se a coluna existe
      const { error: testError } = await supabase
        .from('users')
        .select('grupo_crescimento')
        .limit(1);
        
      if (testError && testError.message.includes('column')) {
        setStatus('❌ Campo grupo_crescimento não existe. Siga os passos manuais abaixo.');
        await setupManual();
        return;
      }

      setStatus('✅ Estrutura da tabela OK! Criando usuários...');
      
      let successCount = 0;
      
      for (const user of testUsers) {
        try {
          setStatus(`Criando: ${user.email}...`);
          
          // Tentar criar usuário com autoConfirm
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // Confirma automaticamente
            user_metadata: {
              name: user.name,
              role: user.role
            }
          });

          if (authError) {
            console.log(`Erro admin API para ${user.email}:`, authError.message);
            
            // Se não conseguir com admin API, tenta método normal
            const { data: normalAuth, error: normalError } = await supabase.auth.signUp({
              email: user.email,
              password: user.password,
            });
            
            if (normalError) {
              console.log(`Erro signup normal para ${user.email}:`, normalError.message);
              continue;
            }
            
            if (normalAuth.user) {
              // Inserir dados na tabela users
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: normalAuth.user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  grupo_crescimento: user.grupo_crescimento
                });

              if (!profileError) {
                successCount++;
              }
            }
            continue;
          }

          if (authData.user) {
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

            if (!profileError) {
              successCount++;
            }
          }
          
        } catch (error) {
          console.log(`Erro geral ${user.email}:`, error.message);
        }
      }
      
      if (successCount > 0) {
        setStatus(`✅ Configuração concluída! ${successCount} usuários criados e confirmados.`);
        setCompleted(true);
      } else {
        setStatus('❌ Não foi possível criar usuários automaticamente. Use o método manual abaixo.');
        await setupManual();
      }
      
    } catch (error) {
      setStatus(`❌ Erro: ${error.message}`);
      await setupManual();
    }
    
    setIsSettingUp(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuração Rápida - Usuários de Teste
          </CardTitle>
          <CardDescription>
            Resolva o problema de confirmação de email e crie usuários de teste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!completed ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Confirmação de Email Ativa</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      O Supabase está pedindo confirmação de email. Vamos tentar criar usuários já confirmados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={setupDirect}
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
                      Tentar Configuração Automática
                    </>
                  )}
                </Button>

                <Button 
                  onClick={setupManual}
                  variant="outline"
                  disabled={isSettingUp}
                  className="w-full"
                >
                  Mostrar Configuração Manual
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Configuração Concluída!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Usuários criados e confirmados. Pode fazer login normalmente.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {status && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap flex-1 font-mono">
                  {status}
                </pre>
                {status.includes('ALTER TABLE') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(status, 'sql')}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedField === 'sql' ? 'Copiado!' : 'Copiar SQL'}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3">Opção Alternativa - Desabilitar Confirmação de Email</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p>1. Acesse o painel do Supabase</p>
              <p>2. Vá em <strong>Authentication → Settings</strong></p>
              <p>3. Desmarque "<strong>Enable email confirmations</strong>"</p>
              <p>4. Salve e tente criar os usuários novamente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credenciais */}
      <Card>
        <CardHeader>
          <CardTitle>Credenciais dos Usuários de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Senha</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">GC</th>
                  <th className="text-left p-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {testUsers.map((user, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{user.email}</td>
                    <td className="p-3 font-mono text-sm">{user.password}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.grupo_crescimento || 'N/A'}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${user.email}:${user.password}`, `user-${index}`)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {copiedField === `user-${index}` ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickSetup;