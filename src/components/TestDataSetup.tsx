import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Users, UserPlus, Calendar, Trash2 } from 'lucide-react';

export function TestDataSetup() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);

  const loadData = async () => {
    try {
      // Carregar usuários
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      setUsers(usersData || []);

      // Carregar encontros
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select(`
          *,
          users!meetings_user_id_fkey(name, email, role)
        `)
        .order('date', { ascending: false });
      
      setMeetings(meetingsData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const createTestUsers = async () => {
    setLoading(true);
    try {
      // Criar líder de teste
      const { data: leaderAuth, error: leaderAuthError } = await supabase.auth.signUp({
        email: 'lider@gc.com',
        password: 'senha123'
      });

      if (leaderAuthError && leaderAuthError.message !== 'User already registered') {
        throw leaderAuthError;
      }

      // Criar co-líder de teste
      const { data: coleaderAuth, error: coleaderAuthError } = await supabase.auth.signUp({
        email: 'colider@gc.com', 
        password: 'senha123'
      });

      if (coleaderAuthError && coleaderAuthError.message !== 'User already registered') {
        throw coleaderAuthError;
      }

      toast({
        title: "Usuários de teste criados!",
        description: "Líder e co-líder foram registrados",
      });

    } catch (error: any) {
      console.error('Erro ao criar usuários:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      loadData();
    }
  };

  const updateUserProfile = async (userId: string, role: string, grupo: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          role: role,
          grupo_crescimento: grupo,
          name: role === 'leader' ? 'João Líder' : 'Maria Co-líder',
          email: role === 'leader' ? 'lider@gc.com' : 'colider@gc.com',
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: `Usuário configurado como ${role}`,
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createTestMeeting = async () => {
    try {
      // Buscar co-líder
      const { data: coleader } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'co_leader')
        .limit(1)
        .single();

      if (!coleader) {
        toast({
          title: "Erro",
          description: "Nenhum co-líder encontrado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('meetings')
        .insert({
          title: `Encontro de Teste - ${new Date().toLocaleDateString()}`,
          description: 'Encontro criado para testar o sistema de relatórios',
          date: new Date().toISOString(),
          location: 'Casa do Co-líder',
          attendance_count: Math.floor(Math.random() * 15) + 5,
          notes: 'Excelente participação, boa discussão sobre discipulado',
          user_id: coleader.id
        });

      if (error) throw error;

      toast({
        title: "Encontro criado!",
        description: "Encontro de teste adicionado",
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearTestData = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os dados de teste?')) return;
    
    try {
      await supabase.from('meetings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      toast({
        title: "Dados limpos!",
        description: "Todos os dados de teste foram removidos",
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configuração de Dados de Teste - Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={createTestUsers} disabled={loading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Usuários de Teste
            </Button>
            
            <Button onClick={createTestMeeting} variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Criar Encontro de Teste
            </Button>
            
            <Button onClick={clearTestData} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Dados de Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="border rounded p-2 text-sm">
                  <div className="font-medium">{user.name || 'Sem nome'}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                  <div className="text-xs">
                    Role: {user.role || 'Não definido'} | 
                    GC: {user.grupo_crescimento || 'Não definido'}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateUserProfile(user.id, 'leader', 'GC Legacy Renew')}
                    >
                      → Líder
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateUserProfile(user.id, 'co_leader', 'GC Legacy Renew')}
                    >
                      → Co-líder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Encontros ({meetings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border rounded p-2 text-sm">
                  <div className="font-medium">{meeting.title}</div>
                  <div className="text-muted-foreground">
                    {new Date(meeting.date).toLocaleDateString()} - {meeting.attendance_count} pessoas
                  </div>
                  <div className="text-xs">
                    Por: {meeting.users?.name || 'Usuário desconhecido'} ({meeting.users?.role})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}