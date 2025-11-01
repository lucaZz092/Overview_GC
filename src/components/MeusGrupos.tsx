import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, UserCheck, Home, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";

interface CoLeader {
  id: string;
  name: string;
  email: string | null;
  meetings_count: number;
  last_meeting_date: string | null;
}

interface GroupActivity {
  total_meetings: number;
  meetings_this_month: number;
  meetings_this_week: number;
  average_attendance: number;
  total_attendance: number;
  active_members: number;
}

interface RecentActivity {
  id: string;
  type: 'meeting' | 'member' | 'report';
  description: string;
  gc_name: string;
  timestamp: Date;
  user_name?: string;
}

interface GroupInfo {
  gc_code: string;
  gc_name: string;
  location: string | null;
  members_count: number;
  co_leaders: CoLeader[];
  activity: GroupActivity;
  recent_activities: RecentActivity[];
}

interface MeusGruposProps {
  onBack: () => void;
}

export function MeusGrupos({ onBack }: MeusGruposProps) {
  const { user } = useAuthContext();
  const { profile } = useUserProfile();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const gcNames: { [key: string]: string } = {
    'gc1': 'GC 1 - Águas Claras',
    'gc2': 'GC 2 - Taguatinga',
    'gc3': 'GC 3 - Ceilândia',
    'gc4': 'GC 4 - Samambaia',
    'gc5': 'GC 5 - Recanto das Emas',
    'gc6': 'GC 6 - Gama',
    'gc7': 'GC 7 - Santa Maria',
    'gc8': 'GC 8 - Planaltina',
    'gc9': 'GC 9 - Brazlândia',
    'gc10': 'GC 10 - Núcleo Bandeirante',
    'gc11': 'GC 11 - Riacho Fundo',
    'gc12': 'GC 12 - São Sebastião',
  };

  useEffect(() => {
    if (user && profile) {
      loadGroupInfo();
    }
  }, [user, profile]);

  const loadGroupInfo = async () => {
    try {
      setLoading(true);

      if (!profile?.grupo_crescimento) {
        toast({
          title: "Erro",
          description: "Você não está associado a nenhum GC",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Buscar co-líderes do mesmo GC
      const { data: coLeadersProfiles, error: coLeadersError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('grupo_crescimento', profile.grupo_crescimento)
        .eq('role', 'co_leader');

      if (coLeadersError) throw coLeadersError;

      // Buscar quantidade de membros cadastrados no GC
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('gc_code', profile.grupo_crescimento)
        .eq('status', 'active');

      if (membersError) throw membersError;

      // Buscar todos os encontros do GC
      const { data: allMeetings, error: meetingsError } = await supabase
        .from('meetings')
        .select('id, date, attendance_count, user_id')
        .eq('gc_code', profile.grupo_crescimento)
        .order('date', { ascending: false }) as { data: { id: string; date: string; attendance_count: number | null; user_id: string }[] | null; error: any };

      if (meetingsError) throw meetingsError;

      // Calcular estatísticas de atividade
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());

      const meetingsThisMonth = allMeetings?.filter(m => 
        new Date(m.date) >= firstDayOfMonth
      ) || [];

      const meetingsThisWeek = allMeetings?.filter(m => 
        new Date(m.date) >= firstDayOfWeek
      ) || [];

      // Calcular média de presença
      const totalAttendance = allMeetings?.reduce((sum, m) => sum + (m.attendance_count || 0), 0) || 0;
      const averageAttendance = allMeetings?.length ? Math.round(totalAttendance / allMeetings.length) : 0;

      // Buscar atividade de cada co-líder
      const coLeadersWithActivity: CoLeader[] = await Promise.all(
        (coLeadersProfiles || []).map(async (coLeader: any) => {
          const { data: leaderMeetings } = await supabase
            .from('meetings')
            .select('id, date')
            .eq('user_id', coLeader.id)
            .order('date', { ascending: false }) as { data: { id: string; date: string }[] | null };

          return {
            ...coLeader,
            meetings_count: leaderMeetings?.length || 0,
            last_meeting_date: leaderMeetings?.[0]?.date || null,
          };
        })
      );

      // Buscar localização do GC
      const location = gcNames[profile.grupo_crescimento]?.split(' - ')[1] || 'Não definida';

      // Buscar atividades recentes de TODOS os GCs (para líderes)
      const recentActivities: RecentActivity[] = [];

      // Buscar encontros recentes de TODOS os GCs
      const { data: allRecentMeetings } = await supabase
        .from('meetings')
        .select('id, date, gc_code, user_id')
        .order('date', { ascending: false })
        .limit(10) as { data: { id: string; date: string; gc_code: string; user_id: string }[] | null };

      // Adicionar encontros recentes
      if (allRecentMeetings) {
        for (const meeting of allRecentMeetings) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', meeting.user_id)
            .single() as { data: { name: string } | null };

          recentActivities.push({
            id: `meeting-${meeting.id}`,
            type: 'meeting',
            description: 'Encontro registrado',
            gc_name: gcNames[meeting.gc_code] || meeting.gc_code,
            timestamp: new Date(meeting.date),
            user_name: userData?.name || 'Usuário',
          });
        }
      }

      // Buscar membros recentes de TODOS os GCs
      const { data: recentMembers } = await supabase
        .from('members')
        .select('id, name, created_at, gc_code')
        .order('created_at', { ascending: false })
        .limit(10) as { data: { id: string; name: string; created_at: string; gc_code: string }[] | null };

      if (recentMembers) {
        for (const member of recentMembers) {
          recentActivities.push({
            id: `member-${member.id}`,
            type: 'member',
            description: `Novo membro - ${member.name}`,
            gc_name: gcNames[member.gc_code] || member.gc_code,
            timestamp: new Date(member.created_at),
          });
        }
      }

      // Ordenar por data mais recente
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      console.log('📊 Atividades Recentes:', recentActivities.slice(0, 10));
      console.log('📊 Total de atividades:', recentActivities.length);

      setGroupInfo({
        gc_code: profile.grupo_crescimento,
        gc_name: gcNames[profile.grupo_crescimento] || profile.grupo_crescimento,
        location: location,
        members_count: membersData?.length || 0,
        co_leaders: coLeadersWithActivity,
        activity: {
          total_meetings: allMeetings?.length || 0,
          meetings_this_month: meetingsThisMonth.length,
          meetings_this_week: meetingsThisWeek.length,
          average_attendance: averageAttendance,
          total_attendance: totalAttendance,
          active_members: membersData?.length || 0,
        },
        recent_activities: recentActivities.slice(0, 10), // Últimas 10 atividades
      });

    } catch (error: any) {
      console.error('Erro ao carregar informações do grupo:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Carregando informações do grupo...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma informação de grupo encontrada.</p>
              <Button onClick={onBack} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Grupos</h1>
            <p className="text-gray-600">Informações sobre o GC que você lidera</p>
          </div>
        </div>

        {/* Card Principal do GC */}
        <Card className="shadow-strong border-2 border-primary/20">
          <CardHeader className="bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Home className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">{groupInfo.gc_name}</CardTitle>
                  <CardDescription className="text-white/80">
                    Grupo de Crescimento
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {groupInfo.gc_code.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Localização */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <MapPin className="h-5 w-5" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-700">
                    {groupInfo.location || 'Não definida'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Região de atuação do GC
                  </p>
                </CardContent>
              </Card>

              {/* Membros Cadastrados */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Users className="h-5 w-5" />
                    Membros Cadastrados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-700">
                    {groupInfo.members_count}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {groupInfo.members_count === 1 ? 'Membro ativo' : 'Membros ativos'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Card de Atividades Recentes */}
        <Card className="shadow-soft border-2 border-yellow-200">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Atividade dos Seus Grupos
            </CardTitle>
            <CardDescription>
              Últimas ações nos grupos sob sua liderança
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupInfo.recent_activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma atividade recente registrada.</p>
                <p className="text-sm mt-2">As atividades aparecerão aqui quando os co-líderes registrarem encontros ou novos membros.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupInfo.recent_activities.map((activity) => {
                  const getTimeAgo = (date: Date) => {
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);

                    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
                    if (diffHours < 24) return `Há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
                    if (diffDays === 1) return 'Ontem';
                    if (diffDays < 7) return `${diffDays} dias atrás`;
                    return date.toLocaleDateString('pt-BR');
                  };

                  const getIcon = () => {
                    switch (activity.type) {
                      case 'meeting':
                        return <Calendar className="h-5 w-5 text-blue-600" />;
                      case 'member':
                        return <Users className="h-5 w-5 text-green-600" />;
                      case 'report':
                        return <BarChart3 className="h-5 w-5 text-purple-600" />;
                      default:
                        return <Calendar className="h-5 w-5 text-gray-600" />;
                    }
                  };

                  const getBgColor = () => {
                    switch (activity.type) {
                      case 'meeting':
                        return 'bg-blue-50 border-blue-200';
                      case 'member':
                        return 'bg-green-50 border-green-200';
                      case 'report':
                        return 'bg-purple-50 border-purple-200';
                      default:
                        return 'bg-gray-50 border-gray-200';
                    }
                  };

                  return (
                    <Card key={activity.id} className={`${getBgColor()} border hover:shadow-md transition-shadow`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {activity.description}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {activity.gc_name}
                                </p>
                                {activity.user_name && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Por: {activity.user_name}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                {getTimeAgo(activity.timestamp)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Co-Líderes */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Co-Líderes do Grupo
            </CardTitle>
            <CardDescription>
              {groupInfo.co_leaders.length === 0 
                ? 'Nenhum co-líder cadastrado neste GC'
                : `${groupInfo.co_leaders.length} ${groupInfo.co_leaders.length === 1 ? 'co-líder' : 'co-líderes'} cadastrado(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupInfo.co_leaders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Ainda não há co-líderes cadastrados neste grupo.</p>
                <p className="text-sm mt-1">
                  Entre em contato com o pastor para adicionar co-líderes.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupInfo.co_leaders.map((coLeader) => (
                  <Card key={coLeader.id} className="bg-gray-50 border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {coLeader.name}
                          </h4>
                          {coLeader.email && (
                            <p className="text-sm text-gray-600 truncate">
                              {coLeader.email}
                            </p>
                          )}
                          <div className="mt-3 space-y-1">
                            <Badge variant="outline">
                              Co-líder
                            </Badge>
                            <div className="text-xs text-gray-500 mt-2">
                              <p>📅 {coLeader.meetings_count} encontro(s) registrado(s)</p>
                              {coLeader.last_meeting_date && (
                                <p className="mt-1">
                                  Último: {new Date(coLeader.last_meeting_date).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Atividade do Grupo */}
        <Card className="shadow-strong border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Atividade do Grupo
            </CardTitle>
            <CardDescription>
              Dados reais preenchidos pelos co-líderes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Total de Encontros */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium mb-1">Total de Encontros</p>
                      <p className="text-3xl font-bold text-blue-900">{groupInfo.activity.total_meetings}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-blue-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Encontros este Mês */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium mb-1">Este Mês</p>
                      <p className="text-3xl font-bold text-green-900">{groupInfo.activity.meetings_this_month}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-green-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Encontros esta Semana */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium mb-1">Esta Semana</p>
                      <p className="text-3xl font-bold text-purple-900">{groupInfo.activity.meetings_this_week}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-purple-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Média de Presença */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 font-medium mb-1">Média de Presença</p>
                      <p className="text-3xl font-bold text-orange-900">{groupInfo.activity.average_attendance}</p>
                    </div>
                    <BarChart3 className="h-10 w-10 text-orange-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Total de Presenças */}
              <Card className="bg-teal-50 border-teal-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-teal-700 font-medium mb-1">Total de Presenças</p>
                      <p className="text-3xl font-bold text-teal-900">{groupInfo.activity.total_attendance}</p>
                    </div>
                    <Users className="h-10 w-10 text-teal-300" />
                  </div>
                </CardContent>
              </Card>

              {/* Membros Ativos */}
              <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-700 font-medium mb-1">Membros Ativos</p>
                      <p className="text-3xl font-bold text-indigo-900">{groupInfo.activity.active_members}</p>
                    </div>
                    <Users className="h-10 w-10 text-indigo-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análise de Performance */}
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Análise de Performance
              </h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/70 p-3 rounded">
                  <p className="text-gray-600">Taxa de Frequência:</p>
                  <p className="text-lg font-bold text-gray-900">
                    {groupInfo.activity.active_members > 0 
                      ? Math.round((groupInfo.activity.average_attendance / groupInfo.activity.active_members) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="bg-white/70 p-3 rounded">
                  <p className="text-gray-600">Média por Semana:</p>
                  <p className="text-lg font-bold text-gray-900">
                    {groupInfo.activity.total_meetings > 0 
                      ? (groupInfo.activity.total_meetings / 4).toFixed(1)
                      : 0} encontros
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Informações Adicionais */}
        <Card className="shadow-soft bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle>📊 Resumo do Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="font-medium">Código do GC:</span>
                <Badge variant="secondary">{groupInfo.gc_code.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="font-medium">Nome do Grupo:</span>
                <span className="text-gray-700">{groupInfo.gc_name}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="font-medium">Total de Co-Líderes:</span>
                <Badge>{groupInfo.co_leaders.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="font-medium">Total de Membros:</span>
                <Badge>{groupInfo.members_count}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
