import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, TrendingUp, MapPin, Mail, Phone, UserCheck, Bell, AlertCircle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Footer } from "@/components/Footer";

interface MeuGrupoProps {
  onBack: () => void;
}

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  attendance_count: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  expires_at: string | null;
}

export function MeuGrupo({ onBack }: MeuGrupoProps) {
  const { user } = useAuthContext();
  const { profile } = useUserProfile();
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({
    membersActive: 0,
    meetingsThisMonth: 0,
    meetingsTotal: 0,
    averageAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const announcementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGroupData = async () => {
      if (!profile?.grupo_crescimento) return;

      setLoading(true);

      try {
        // Carregar membros
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .eq('grupo_crescimento', profile.grupo_crescimento)
          .eq('is_active', true)
          .order('name');

        if (membersError) throw membersError;

        setMembers(membersData || []);

        // Carregar encontros
        const { data: meetingsData, error: meetingsError } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user?.id)
          .order('date', { ascending: false })
          .limit(10) as { data: Meeting[] | null, error: any };

        if (meetingsError) throw meetingsError;

        setMeetings(meetingsData || []);

        // Carregar avisos ativos
        const userRole = profile.role;
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .or(`target_roles.cs.{${userRole}}`)
          .order('created_at', { ascending: false }) as { data: Announcement[] | null, error: any };

        if (!announcementsError) {
          const activeAnnouncements = (announcementsData || []).filter(announcement => {
            if (!announcement.expires_at) return true;
            return new Date(announcement.expires_at) > new Date();
          });
          setAnnouncements(activeAnnouncements);
        }

        // Calcular estatísticas
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const meetingsThisMonth = (meetingsData || []).filter(
          m => new Date(m.date) >= startOfMonth
        ).length;

        const totalAttendance = (meetingsData || []).reduce(
          (sum, m) => sum + (m.attendance_count || 0), 0
        );
        const avgAttendance = meetingsData?.length 
          ? Math.round(totalAttendance / meetingsData.length) 
          : 0;

        setStats({
          membersActive: membersData?.length || 0,
          meetingsThisMonth,
          meetingsTotal: meetingsData?.length || 0,
          averageAttendance: avgAttendance
        });

      } catch (error: any) {
        console.error('Erro ao carregar dados do grupo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [profile, user]);

  const formatGCName = (gcCode?: string | null) => {
    if (!gcCode) return "Não definido";
    return gcCode
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const scrollToAnnouncements = () => {
    announcementsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {formatGCName(profile?.grupo_crescimento)}
              </h1>
              <p className="text-white/80">Detalhes do seu grupo de crescimento</p>
            </div>
          </div>
          
          {/* Botão de Avisos */}
          {announcements.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToAnnouncements}
              className="text-white hover:bg-white/10 relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Avisos
              <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
                {announcements.length}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Membros Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.membersActive}</div>
              <p className="text-xs text-muted-foreground">
                Cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Encontros este Mês
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.meetingsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Registrados este mês
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Encontros
              </CardTitle>
              <MapPin className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.meetingsTotal}</div>
              <p className="text-xs text-muted-foreground">
                Todos os encontros
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Presença Média
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageAttendance}</div>
              <p className="text-xs text-muted-foreground">
                Pessoas por encontro
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Membros */}
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Membros Ativos ({members.length})
              </CardTitle>
              <CardDescription>
                Membros cadastrados no seu grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Carregando...</p>
              ) : members.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum membro cadastrado ainda
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {member.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </span>
                            )}
                            {member.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">Ativo</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Últimos Encontros */}
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Últimos Encontros ({meetings.length})
              </CardTitle>
              <CardDescription>
                Encontros recentes do seu grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Carregando...</p>
              ) : meetings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum encontro registrado ainda
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {meetings.map((meeting) => (
                    <div 
                      key={meeting.id} 
                      className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{meeting.title}</h4>
                        <Badge variant="outline">
                          {meeting.attendance_count || 0} presentes
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(meeting.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {meeting.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seção de Avisos */}
        {announcements.length > 0 && (
          <div ref={announcementsRef} className="mt-8">
            <Card className="shadow-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Avisos Importantes ({announcements.length})
                </CardTitle>
                <CardDescription>
                  Comunicados da liderança para você
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{announcement.title}</CardTitle>
                              <Badge variant={getPriorityColor(announcement.priority)}>
                                {getPriorityLabel(announcement.priority)}
                              </Badge>
                            </div>
                            <CardDescription>
                              Publicado em {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                              {announcement.expires_at && (
                                <> • Válido até {new Date(announcement.expires_at).toLocaleDateString('pt-BR')}</>
                              )}
                            </CardDescription>
                          </div>
                          {announcement.priority === 'urgent' && (
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
