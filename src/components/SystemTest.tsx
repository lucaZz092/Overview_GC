import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertTriangle, Users, Calendar, FileText, Database } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function SystemTest() {
  const { user } = useAuthContext();
  const { profile } = useUserProfile();
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runSystemTests = async () => {
    setTesting(true);
    setResults([]);

    try {
      // 1. Teste de Autenticação
      if (user) {
        addResult({
          name: 'Autenticação',
          status: 'success',
          message: 'Usuário autenticado com sucesso',
          details: `ID: ${user.id}, Email: ${user.email}`
        });
      } else {
        addResult({
          name: 'Autenticação',
          status: 'error',
          message: 'Usuário não autenticado'
        });
      }

      // 2. Teste de Perfil
      if (profile) {
        addResult({
          name: 'Perfil do Usuário',
          status: 'success',
          message: `Perfil carregado: ${profile.name}`,
          details: `Role: ${profile.role}, GC: ${profile.grupo_crescimento || 'Não definido'}`
        });
      } else {
        addResult({
          name: 'Perfil do Usuário',
          status: 'warning',
          message: 'Perfil não carregado'
        });
      }

      // 3. Teste de Conexão com Supabase
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);

        if (error) {
          addResult({
            name: 'Conexão Supabase',
            status: 'error',
            message: 'Erro na conexão com Supabase',
            details: error.message
          });
        } else {
          addResult({
            name: 'Conexão Supabase',
            status: 'success',
            message: 'Conexão com Supabase funcionando'
          });
        }
      } catch (err: any) {
        addResult({
          name: 'Conexão Supabase',
          status: 'error',
          message: 'Falha na conexão',
          details: err.message
        });
      }

      // 4. Teste da Tabela Users
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name, email, role, grupo_crescimento')
          .limit(5);

        if (error) {
          addResult({
            name: 'Tabela Users',
            status: 'error',
            message: 'Erro ao acessar tabela users',
            details: error.message
          });
        } else {
          addResult({
            name: 'Tabela Users',
            status: 'success',
            message: `${users?.length || 0} usuários encontrados`,
            details: users?.map(u => `${u.name} (${u.role})`).join(', ') || 'Nenhum usuário'
          });
        }
      } catch (err: any) {
        addResult({
          name: 'Tabela Users',
          status: 'error',
          message: 'Falha ao consultar users',
          details: err.message
        });
      }

      // 5. Teste da Tabela Members
      try {
        const { data: members, error } = await supabase
          .from('members')
          .select('id, name, is_active')
          .limit(5);

        if (error) {
          addResult({
            name: 'Tabela Members',
            status: 'error',
            message: 'Erro ao acessar tabela members',
            details: error.message
          });
        } else {
          const activeMembers = members?.filter(m => m.is_active).length || 0;
          addResult({
            name: 'Tabela Members',
            status: 'success',
            message: `${members?.length || 0} membros (${activeMembers} ativos)`,
            details: members?.map(m => `${m.name} (${m.is_active ? 'Ativo' : 'Inativo'})`).join(', ') || 'Nenhum membro'
          });
        }
      } catch (err: any) {
        addResult({
          name: 'Tabela Members',
          status: 'error',
          message: 'Falha ao consultar members',
          details: err.message
        });
      }

      // 6. Teste da Tabela Meetings
      try {
        const { data: meetings, error } = await supabase
          .from('meetings')
          .select('id, title, date, attendance_count')
          .limit(5);

        if (error) {
          addResult({
            name: 'Tabela Meetings',
            status: 'error',
            message: 'Erro ao acessar tabela meetings',
            details: error.message
          });
        } else {
          const totalAttendance = meetings?.reduce((sum, m) => sum + (m.attendance_count || 0), 0) || 0;
          addResult({
            name: 'Tabela Meetings',
            status: 'success',
            message: `${meetings?.length || 0} encontros (${totalAttendance} participantes total)`,
            details: meetings?.map(m => `${m.title} - ${m.attendance_count} pessoas`).join(', ') || 'Nenhum encontro'
          });
        }
      } catch (err: any) {
        addResult({
          name: 'Tabela Meetings',
          status: 'error',
          message: 'Falha ao consultar meetings',
          details: err.message
        });
      }

      // 7. Teste de Funcionalidades por Role
      if (profile?.role === 'leader') {
        addResult({
          name: 'Funcionalidades de Líder',
          status: 'success',
          message: 'Acesso completo: Dashboard, Relatórios, Cadastros',
          details: 'Pode ver relatórios de co-líderes'
        });
      } else if (profile?.role === 'co_leader') {
        addResult({
          name: 'Funcionalidades de Co-líder',
          status: 'success',
          message: 'Acesso: Dashboard, Cadastros, Encontros',
          details: 'Pode cadastrar membros e registrar encontros'
        });
      } else if (profile?.role === 'admin') {
        addResult({
          name: 'Funcionalidades de Admin',
          status: 'success',
          message: 'Acesso total do sistema',
          details: 'Pode excluir encontros e gerenciar usuários'
        });
      } else {
        addResult({
          name: 'Funcionalidades do Usuário',
          status: 'warning',
          message: `Role não reconhecida: ${profile?.role || 'undefined'}`,
          details: 'Pode ter acesso limitado'
        });
      }

      // 8. Teste do Sistema de Membros Automatizado
      if (profile?.grupo_crescimento) {
        addResult({
          name: 'Sistema de Membros',
          status: 'success',
          message: 'Sistema automatizado configurado',
          details: `Membros serão associados automaticamente ao ${profile.grupo_crescimento}`
        });
      } else {
        addResult({
          name: 'Sistema de Membros',
          status: 'warning',
          message: 'Grupo de crescimento não definido',
          details: 'Usuário precisa ter grupo_crescimento configurado'
        });
      }

      toast({
        title: "Testes concluídos!",
        description: "Verificação do sistema finalizada",
      });

    } catch (error: any) {
      addResult({
        name: 'Sistema Geral',
        status: 'error',
        message: 'Erro crítico no sistema',
        details: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const getIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getBadgeVariant = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Teste Completo do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center mb-4">
            <Button onClick={runSystemTests} disabled={testing}>
              {testing ? 'Testando...' : 'Executar Testes'}
            </Button>
            
            {results.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="default">{successCount} Sucessos</Badge>
                <Badge variant="destructive">{errorCount} Erros</Badge>
                <Badge variant="secondary">{warningCount} Avisos</Badge>
              </div>
            )}
          </div>

          {testing && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Executando testes do sistema...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
          
          {results.map((result, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {getIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.name}</span>
                      <Badge variant={getBadgeVariant(result.status)} className="text-xs">
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}