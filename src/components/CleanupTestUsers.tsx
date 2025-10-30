import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Trash2, RefreshCw, Users, AlertTriangle } from 'lucide-react';

const CleanupTestUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testUsers, setTestUsers] = useState([]);
  const [status, setStatus] = useState('');

  const loadTestUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .like('email', '%@teste.com')
        .order('email');
        
      if (error) {
        console.error('Erro ao carregar usuários:', error);
        setStatus(`Erro ao carregar usuários: ${error.message}`);
        return;
      }
      
      setTestUsers(data || []);
      setStatus(`${data?.length || 0} usuários de teste encontrados.`);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setStatus(`Erro: ${error.message}`);
    }
  };

  const deleteTestUsers = async () => {
    setIsLoading(true);
    setStatus('Excluindo usuários de teste...');
    
    try {
      // Excluir da tabela users
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .like('email', '%@teste.com');
        
      if (deleteError) {
        setStatus(`Erro ao excluir usuários: ${deleteError.message}`);
        setIsLoading(false);
        return;
      }

      setStatus('✅ Usuários de teste excluídos com sucesso!');
      setTestUsers([]);
      
      // Nota: Os usuários na tabela auth.users do Supabase precisam ser excluídos manualmente
      // no painel do Supabase, pois não temos acesso direto via API client
      setTimeout(() => {
        setStatus('✅ Usuários excluídos da tabela users. Para remover completamente, exclua também no painel Authentication do Supabase.');
      }, 2000);
      
    } catch (error) {
      setStatus(`❌ Erro: ${error.message}`);
    }
    
    setIsLoading(false);
  };

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

  useEffect(() => {
    loadTestUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Limpar Usuários de Teste
          </CardTitle>
          <CardDescription>
            Remova os usuários de teste criados anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={deleteTestUsers}
              disabled={isLoading || testUsers.length === 0}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isLoading ? 'Excluindo...' : `Excluir ${testUsers.length} Usuários de Teste`}
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
              <p className="text-sm text-blue-800 whitespace-pre-line">{status}</p>
            </div>
          )}

          {testUsers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Atenção</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Após excluir aqui, você também deve remover os usuários no painel <strong>Authentication</strong> do Supabase 
                    para limpeza completa.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de usuários que serão excluídos */}
      {testUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários de Teste Encontrados ({testUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
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

      {testUsers.length === 0 && status && !status.includes('Erro') && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-green-600 mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Nenhum usuário de teste encontrado
            </h3>
            <p className="text-green-600">
              Todos os usuários de teste foram removidos ou não existem.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">1.</span>
              <p>Use seu usuário admin existente para fazer login</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">2.</span>
              <p>Teste todas as funcionalidades do Dashboard</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">3.</span>
              <p>Use o sistema de registro normal para criar novos usuários quando necessário</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">4.</span>
              <p>Para limpeza completa, remova também os usuários no painel Authentication do Supabase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CleanupTestUsers;