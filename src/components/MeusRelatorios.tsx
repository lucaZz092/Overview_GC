import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, ArrowLeft, User, MapPin, Clock, FileText, TrendingUp, BarChart3 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface MeetingWithUser {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  attendance_count: number;
  notes: string | null;
  created_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
}

interface CoLeaderStats {
  user_id: string;
  user_name: string;
  user_email: string;
  total_meetings: number;
  total_attendance: number;
  meetings: MeetingWithUser[];
}

export const MeusRelatorios: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuthContext();
  const { profile, isLeader } = useUserProfile();
  const [coLeadersStats, setCoLeadersStats] = useState<CoLeaderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoLeader, setSelectedCoLeader] = useState<CoLeaderStats | null>(null);

  // Carregar dados dos co-líderes e seus encontros
  const loadCoLeadersData = async () => {
    if (!user || !profile?.grupo_crescimento || !isLeader) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar co-líderes do mesmo GC
      const { data: coLeaders, error: coLeadersError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('grupo_crescimento', profile.grupo_crescimento)
        .eq('role', 'co_leader')
        .eq('is_active', true);

      if (coLeadersError) {
        console.error('❌ Erro ao buscar co-líderes:', coLeadersError);
        toast({
          title: "Erro",
          description: "Falha ao carregar co-líderes",
          variant: "destructive",
        });
        return;
      }

      if (!coLeaders || coLeaders.length === 0) {
        console.log('ℹ️ Nenhum co-líder encontrado no GC:', profile.grupo_crescimento);
        setCoLeadersStats([]);
        return;
      }

      console.log('✅ Co-líderes encontrados:', coLeaders);

      // Para cada co-líder, buscar seus encontros
      const coLeadersWithStats: CoLeaderStats[] = [];

      for (const coLeader of coLeaders as any[]) {
        const { data: meetings, error: meetingsError } = await supabase
          .from('meetings')
          .select(`
            id, title, description, date, location, 
            attendance_count, notes, created_at, user_id
          `)
          .eq('user_id', coLeader.id)
          .order('date', { ascending: false });

        if (meetingsError) {
          console.error(`❌ Erro ao buscar encontros do co-líder ${coLeader.name}:`, meetingsError);
          continue;
        }

        const meetingsWithUser: MeetingWithUser[] = (meetings || []).map((meeting: any) => ({
          ...meeting,
          user_name: coLeader.name,
          user_email: coLeader.email,
          user_role: coLeader.role
        }));

        const totalAttendance = meetingsWithUser.reduce((sum, meeting) => sum + (meeting.attendance_count || 0), 0);

        coLeadersWithStats.push({
          user_id: coLeader.id,
          user_name: coLeader.name,
          user_email: coLeader.email,
          total_meetings: meetingsWithUser.length,
          total_attendance: totalAttendance,
          meetings: meetingsWithUser
        });
      }

      console.log('✅ Estatísticas dos co-líderes:', coLeadersWithStats);
      setCoLeadersStats(coLeadersWithStats);

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Problema ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadCoLeadersData();
    }
  }, [profile, user]);

  // Se não for líder, mostrar mensagem de acesso restrito
  if (!isLeader) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-primary border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Meus Relatórios</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Esta funcionalidade está disponível apenas para líderes.
              </p>
              <Button onClick={onBack} variant="outline">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-primary border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Meus Relatórios</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando relatórios...</p>
          </div>
        </div>
      </div>
    );
  }

  // Modal de detalhes do co-líder
  if (selectedCoLeader) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-primary border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedCoLeader(null)} 
              className="text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Relatório - {selectedCoLeader.user_name}
              </h1>
              <p className="text-white/80">{selectedCoLeader.user_email}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Estatísticas resumidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Encontros</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedCoLeader.total_meetings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedCoLeader.total_attendance}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média por Encontro</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedCoLeader.total_meetings > 0 
                    ? Math.round(selectedCoLeader.total_attendance / selectedCoLeader.total_meetings)
                    : 0
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de encontros */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Encontros Registrados</h2>
            
            {selectedCoLeader.meetings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {selectedCoLeader.user_name} ainda não registrou nenhum encontro
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {selectedCoLeader.meetings.map((meeting) => (
                  <Card key={meeting.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{meeting.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(meeting.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(meeting.date).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                            {meeting.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {meeting.location}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {meeting.attendance_count} participantes
                        </Badge>
                      </div>
                    </CardHeader>
                    {(meeting.description || meeting.notes) && (
                      <CardContent>
                        {meeting.description && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground font-medium mb-1">Descrição:</p>
                            <p className="text-sm">{meeting.description}</p>
                          </div>
                        )}
                        {meeting.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Observações:</p>
                            <p className="text-sm">{meeting.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Meus Relatórios</h1>
            <p className="text-white/80">
              Relatórios dos co-líderes do {profile?.grupo_crescimento}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {coLeadersStats.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                Nenhum Co-líder Encontrado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Não há co-líderes ativos registrados no {profile?.grupo_crescimento} ou eles ainda não registraram encontros.
              </p>
              <Button onClick={onBack} variant="outline">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coLeadersStats.map((coLeaderStat) => (
              <Card 
                key={coLeaderStat.user_id} 
                className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedCoLeader(coLeaderStat)}
              >
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{coLeaderStat.user_name}</CardTitle>
                    <CardDescription className="text-xs">
                      {coLeaderStat.user_email}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Encontros:</span>
                      <Badge variant="outline">{coLeaderStat.total_meetings}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Participantes:</span>
                      <Badge variant="outline">{coLeaderStat.total_attendance}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Média:</span>
                      <Badge variant="outline">
                        {coLeaderStat.total_meetings > 0 
                          ? Math.round(coLeaderStat.total_attendance / coLeaderStat.total_meetings)
                          : 0
                        }
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};