import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('Testando...');
  const [authStatus, setAuthStatus] = useState('Verificando...');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [dbTest, setDbTest] = useState('Aguardando...');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    console.log('🔍 Iniciando teste de conexão...');
    
    // 1. Teste básico de conexão
    try {
      console.log('📡 Testando conexão básica...');
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Erro na conexão:', error);
        setConnectionStatus(`❌ Erro: ${error.message}`);
      } else {
        console.log('✅ Conexão OK');
        setConnectionStatus('✅ Conectado ao Supabase');
      }
    } catch (err: any) {
      console.error('❌ Erro de conexão:', err);
      setConnectionStatus(`❌ Erro: ${err.message}`);
    }

    // 2. Teste de autenticação
    try {
      console.log('🔐 Testando autenticação...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erro na auth:', error);
        setAuthStatus(`❌ Erro: ${error.message}`);
      } else if (session?.user) {
        console.log('✅ Usuário logado:', session.user.email);
        setAuthStatus(`✅ Logado como: ${session.user.email}`);
        setUserInfo(session.user);
        
        // 3. Teste de busca no banco
        testDatabase(session.user.id);
      } else {
        console.log('⚠️ Não há usuário logado');
        setAuthStatus('⚠️ Não há usuário logado');
      }
    } catch (err: any) {
      console.error('❌ Erro na auth:', err);
      setAuthStatus(`❌ Erro: ${err.message}`);
    }
  };

  const testDatabase = async (userId: string) => {
    try {
      console.log('🗄️ Testando banco de dados...');
      
      // Verificar se existe tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        setDbTest(`❌ Erro na tabela users: ${userError.message}`);
      } else if (userData) {
        console.log('✅ Usuário encontrado no banco:', userData);
        setDbTest(`✅ Usuário encontrado: ${userData.email} (${userData.role})`);
      } else {
        console.log('⚠️ Usuário não encontrado na tabela users');
        setDbTest('⚠️ Usuário não encontrado na tabela users');
      }
    } catch (err: any) {
      console.error('❌ Erro no banco:', err);
      setDbTest(`❌ Erro: ${err.message}`);
    }
  };

  const forceLogin = async () => {
    const email = 'lucacampeao2013@gmail.com';
    const password = prompt('Digite sua senha:');
    
    if (!password) return;

    console.log('🔐 Tentando login forçado...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        alert(`Erro no login: ${error.message}`);
      } else {
        console.log('✅ Login realizado:', data.user?.email);
        alert('Login realizado! Recarregue a página.');
        window.location.reload();
      }
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔧 Teste de Conexão</h1>
          <p className="text-white/80">Verificando conectividade com Supabase</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📡 Conexão Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{connectionStatus}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔐 Status Auth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{authStatus}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🗄️ Banco de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{dbTest}</p>
            </CardContent>
          </Card>
        </div>

        {userInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>👤 Info do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-center mt-8">
          <Button onClick={testConnection} className="bg-white text-blue-600 hover:bg-gray-100">
            🔄 Testar Novamente
          </Button>
          <Button onClick={forceLogin} variant="outline" className="border-white text-white hover:bg-white/10">
            🔐 Login Forçado
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Logs do Console</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Abra o Console do navegador (F12) para ver logs detalhados dos testes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}