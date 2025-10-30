import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Users, Trash2, RefreshCw } from 'lucide-react';

const TestUsersManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([]);

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
    }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'pastor': return 'bg-purple-100 text-purple-800';
      case 'leader': return 'bg-blue-100 text-blue-800';
      case 'co_leader': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'pastor': return 'Pastor';
      case 'leader': return 'Líder';
      case 'co_leader': return 'Co-líder';
      default: return role;
    }
  };

  const formatGCName = (gc) => {
    if (!gc) return 'N/A';
    return gc.replace('gc_', 'GC ');
  };

  const createTestUsers = async () => {
    setIsCreating(true);
    setStatus('Criando usuários de teste...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of testUsers) {
      try {
        // 1. Criar usuário na autenticação
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
        });

        if (authError) {
          console.log(`Erro auth para ${user.email}:`, authError.message);
          errorCount++;
          continue;
        }

        if (!authData.user) {
          console.log(`Usuário não criado: ${user.email}`);
          errorCount++;
          continue;
        }

        // 2. Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Inserir dados na tabela users
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
          console.log(`Erro perfil para ${user.email}:`, profileError.message);
          errorCount++;
          continue;
        }

        successCount++;
        setStatus(`Criados: ${successCount}/${testUsers.length}`);
        
      } catch (error) {
        console.log(`Erro geral para ${user.email}:`, error.message);
        errorCount++;
      }
    }
    
    setStatus(`Concluído! ✅ ${successCount} criados, ❌ ${errorCount} erros`);
    setIsCreating(false);
    loadTestUsers();
  };

  const cleanTestUsers = async () => {
    setIsCleaning(true);
    setStatus('Limpando usuários de teste...');
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .like('email', '%@teste.com');
        
      if (error) {
        setStatus(`Erro ao limpar usuários: ${error.message}`);
      } else {
        setStatus('Usuários de teste limpos com sucesso!');
        setUsers([]);
      }
    } catch (error) {
      setStatus(`Erro: ${error.message}`);
    }
    
    setIsCleaning(false);
  };

  const loadTestUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .like('email', '%@teste.com')
        .order('role');
        
      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  React.useEffect(() => {
    loadTestUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciador de Usuários de Teste
          </CardTitle>
          <CardDescription>
            Crie usuários de teste para cada hierarquia do sistema (Admin, Pastor, Líder, Co-líder)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={createTestUsers}
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              {isCreating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              {isCreating ? 'Criando...' : 'Criar Usuários de Teste'}
            </Button>
            
            <Button 
              variant="destructive"
              onClick={cleanTestUsers}
              disabled={isCleaning}
              className="flex items-center gap-2"
            >
              {isCleaning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isCleaning ? 'Limpando...' : 'Limpar Usuários de Teste'}
            </Button>

            <Button 
              variant="outline"
              onClick={loadTestUsers}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar
            </Button>
          </div>
          
          {status && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{status}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de usuários criados */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários de Teste Existentes ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatGCName(user.grupo_crescimento)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de credenciais */}
      <Card>
        <CardHeader>
          <CardTitle>Credenciais dos Usuários de Teste</CardTitle>
          <CardDescription>Use estas credenciais para fazer login com diferentes tipos de usuário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Senha</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">GC</th>
                </tr>
              </thead>
              <tbody>
                {testUsers.map((user, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{user.email}</td>
                    <td className="p-2 font-mono text-sm">{user.password}</td>
                    <td className="p-2">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="p-2">{formatGCName(user.grupo_crescimento)}</td>
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

export default TestUsersManager;