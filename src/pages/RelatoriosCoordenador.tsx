import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  MapPin
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Footer } from "@/components/Footer";

interface GCStats {
  gc_name: string;
  total_members: number;
  active_members: number;
  meetings_count: number;
  avg_attendance: number;
  last_meeting: string | null;
}

interface MemberAttendance {
  member_id: string;
  member_name: string;
  gc_name: string;
  total_meetings: number;
  attended_meetings: number;
  attendance_rate: number;
  last_attendance: string | null;
}

interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  location: string;
  attendance_count: number;
  leader_name: string;
  gc_name: string;
  description?: string | null;
  notes?: string | null;
  attendees?: string[];
}

export function RelatoriosCoordenador({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [gcStats, setGcStats] = useState<GCStats[]>([]);
  const [memberAttendance, setMemberAttendance] = useState<MemberAttendance[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<MeetingRecord[]>([]);
  const [activeTab, setActiveTab] = useState("membros");
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGCStats(),
        loadMemberAttendance(),
        loadRecentMeetings()
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGCStats = async () => {
    try {
      // Buscar todos os membros agrupados por GC
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('grupo_crescimento, is_active');

      if (membersError) throw membersError;

      // Buscar todos os encontros com informações do líder
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select(`
          id,
          date,
          attendance_count,
          user_id,
          profiles:user_id (grupo_crescimento)
        `);

      if (meetingsError) throw meetingsError;

      // Agrupar dados por GC
      const gcMap = new Map<string, {
        total: number;
        active: number;
        meetings: any[];
      }>();

      // Processar membros
      membersData?.forEach((member: any) => {
        const gc = member.grupo_crescimento || 'Não definido';
        if (!gcMap.has(gc)) {
          gcMap.set(gc, { total: 0, active: 0, meetings: [] });
        }
        const stats = gcMap.get(gc)!;
        stats.total++;
        if (member.is_active) stats.active++;
      });

      // Processar encontros
      meetingsData?.forEach((meeting: any) => {
        const gc = meeting.profiles?.grupo_crescimento || 'Não definido';
        if (gcMap.has(gc)) {
          gcMap.get(gc)!.meetings.push(meeting);
        }
      });

      // Converter para array de estatísticas
      const stats: GCStats[] = Array.from(gcMap.entries()).map(([gc, data]) => {
        const sortedMeetings = data.meetings.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const totalAttendance = data.meetings.reduce((sum, m) => sum + (m.attendance_count || 0), 0);
        
        return {
          gc_name: gc,
          total_members: data.total,
          active_members: data.active,
          meetings_count: data.meetings.length,
          avg_attendance: data.meetings.length > 0 ? Math.round(totalAttendance / data.meetings.length) : 0,
          last_meeting: sortedMeetings[0]?.date || null
        };
      }).sort((a, b) => a.gc_name.localeCompare(b.gc_name));

      setGcStats(stats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas dos GCs:", error);
    }
  };

  const loadMemberAttendance = async () => {
    try {
      // Buscar todos os membros
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, grupo_crescimento, is_active')
        .eq('is_active', true);

      if (membersError) throw membersError;

      // Buscar todas as presenças com informações do encontro
      const { data: attendancesData, error: attendancesError } = await supabase
        .from('meeting_attendances')
        .select(`
          member_id,
          created_at,
          meetings:meeting_id (
            id,
            date,
            user_id,
            profiles:user_id (grupo_crescimento)
          )
        `);

      if (attendancesError) throw attendancesError;

      // Buscar todos os encontros por GC
      const { data: allMeetingsData, error: allMeetingsError } = await supabase
        .from('meetings')
        .select(`
          id,
          user_id,
          profiles:user_id (grupo_crescimento)
        `);

      if (allMeetingsError) throw allMeetingsError;

      // Agrupar encontros por GC
      const meetingsByGC = new Map<string, string[]>();
      allMeetingsData?.forEach((meeting: any) => {
        const gc = meeting.profiles?.grupo_crescimento || 'Não definido';
        if (!meetingsByGC.has(gc)) {
          meetingsByGC.set(gc, []);
        }
        meetingsByGC.get(gc)!.push(meeting.id);
      });

      // Processar dados de presença por membro
      const attendanceMap = new Map<string, {
        name: string;
        gc: string;
        attendances: string[];
        lastDate: string | null;
      }>();

      membersData?.forEach((member: any) => {
        attendanceMap.set(member.id, {
          name: member.name,
          gc: member.grupo_crescimento || 'Não definido',
          attendances: [],
          lastDate: null
        });
      });

      attendancesData?.forEach((attendance: any) => {
        const memberId = attendance.member_id;
        if (attendanceMap.has(memberId)) {
          const memberData = attendanceMap.get(memberId)!;
          memberData.attendances.push(attendance.meetings?.id);
          
          const attendanceDate = attendance.meetings?.date;
          if (attendanceDate && (!memberData.lastDate || attendanceDate > memberData.lastDate)) {
            memberData.lastDate = attendanceDate;
          }
        }
      });

      // Calcular estatísticas
      const attendance: MemberAttendance[] = Array.from(attendanceMap.entries())
        .map(([memberId, data]) => {
          const gcMeetings = meetingsByGC.get(data.gc) || [];
          const attended = data.attendances.filter(id => id).length;
          const total = gcMeetings.length;
          
          return {
            member_id: memberId,
            member_name: data.name,
            gc_name: data.gc,
            total_meetings: total,
            attended_meetings: attended,
            attendance_rate: total > 0 ? Math.round((attended / total) * 100) : 0,
            last_attendance: data.lastDate
          };
        })
        .sort((a, b) => a.attendance_rate - b.attendance_rate); // Ordenar dos com mais faltas para menos

      setMemberAttendance(attendance);
    } catch (error) {
      console.error("Erro ao carregar dados de presença:", error);
    }
  };

  const loadRecentMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          date,
          location,
          attendance_count,
          description,
          notes,
          user_id,
          profiles:user_id (name, grupo_crescimento)
        `)
        .order('date', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Buscar membros presentes em cada encontro
      const meetingsWithAttendees = await Promise.all(
        (data || []).map(async (meeting: any) => {
          const { data: attendancesData } = await supabase
            .from('meeting_attendances')
            .select(`
              members:member_id (
                name
              )
            `)
            .eq('meeting_id', meeting.id);

          const attendees = attendancesData?.map((attendance: any) => attendance.members?.name).filter(Boolean) || [];

          return {
            id: meeting.id,
            title: meeting.title,
            date: meeting.date,
            location: meeting.location,
            attendance_count: meeting.attendance_count || 0,
            description: meeting.description,
            notes: meeting.notes,
            leader_name: meeting.profiles?.name || 'Desconhecido',
            gc_name: meeting.profiles?.grupo_crescimento || 'Não definido',
            attendees
          };
        })
      );

      setRecentMeetings(meetingsWithAttendees);
    } catch (error) {
      console.error("Erro ao carregar encontros recentes:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (rate >= 60) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Carregando relatórios...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" className="bg-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Relatórios do Coordenador</h1>
              <p className="text-white/80">Controle completo dos GCs</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="membros">
              <Users className="h-4 w-4 mr-2" />
              Membros Ativos
            </TabsTrigger>
            <TabsTrigger value="encontros">
              <Calendar className="h-4 w-4 mr-2" />
              Encontros Registrados
            </TabsTrigger>
            <TabsTrigger value="faltas">
              <AlertCircle className="h-4 w-4 mr-2" />
              Controle de Faltas
            </TabsTrigger>
          </TabsList>

          {/* Tab: Membros Ativos por GC */}
          <TabsContent value="membros" className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Membros Ativos por Grupo de Crescimento
                </CardTitle>
                <CardDescription>
                  Visão geral dos membros cadastrados em cada GC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gcStats.map((gc) => (
                    <Card key={gc.gc_name} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">
                              {gc.gc_name.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </h3>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Total: {gc.total_members} membros</span>
                              <span className="text-green-600 font-medium">
                                Ativos: {gc.active_members}
                              </span>
                              <span className="text-gray-500">
                                Inativos: {gc.total_members - gc.active_members}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-base">
                            {gc.meetings_count} encontros
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span>Média de presença: {gc.avg_attendance} pessoas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>
                              Último encontro: {gc.last_meeting ? formatDate(gc.last_meeting) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>
                              Taxa de atividade: {gc.total_members > 0 
                                ? Math.round((gc.active_members / gc.total_members) * 100) 
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {gcStats.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum grupo de crescimento encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Encontros Registrados */}
          <TabsContent value="encontros" className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Encontros Registrados Recentemente
                </CardTitle>
                <CardDescription>
                  Últimos 20 encontros de todos os GCs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMeetings.map((meeting) => {
                    const isExpanded = expandedMeetingId === meeting.id;
                    return (
                      <Card key={meeting.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{meeting.title}</h4>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(meeting.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {meeting.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {meeting.attendance_count} presentes
                                </span>
                                <Badge variant="outline">{meeting.gc_name}</Badge>
                                <span className="text-xs">Líder: {meeting.leader_name}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedMeetingId(isExpanded ? null : meeting.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Ocultar
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Detalhes
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Detalhes expandidos */}
                          {isExpanded && (
                            <div className="mt-4 space-y-3 pt-3 border-t">
                              {meeting.description && (
                                <div>
                                  <h5 className="text-sm font-medium mb-1 flex items-center gap-1">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Descrição:
                                  </h5>
                                  <p className="text-sm text-muted-foreground pl-5">
                                    {meeting.description}
                                  </p>
                                </div>
                              )}

                              {meeting.notes && (
                                <div>
                                  <h5 className="text-sm font-medium mb-1 flex items-center gap-1">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Observações:
                                  </h5>
                                  <p className="text-sm text-muted-foreground pl-5">
                                    {meeting.notes}
                                  </p>
                                </div>
                              )}

                              {meeting.attendees && meeting.attendees.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                                    <Users className="h-4 w-4 text-primary" />
                                    Membros Presentes ({meeting.attendees.length}):
                                  </h5>
                                  <div className="flex flex-wrap gap-2 pl-5">
                                    {meeting.attendees.map((attendee, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {attendee}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {!meeting.description && !meeting.notes && (!meeting.attendees || meeting.attendees.length === 0) && (
                                <p className="text-sm text-muted-foreground italic">
                                  Nenhum detalhe adicional registrado para este encontro.
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {recentMeetings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum encontro registrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Controle de Faltas */}
          <TabsContent value="faltas" className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Controle de Presença dos Membros
                </CardTitle>
                <CardDescription>
                  Taxa de presença de cada membro nos encontros do seu GC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {memberAttendance.map((member) => (
                    <Card 
                      key={member.member_id} 
                      className={`border-l-4 ${
                        member.attendance_rate >= 80 ? 'border-l-green-500' :
                        member.attendance_rate >= 60 ? 'border-l-yellow-500' :
                        'border-l-red-500'
                      }`}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getAttendanceIcon(member.attendance_rate)}
                              <h4 className="font-semibold">{member.member_name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {member.gc_name}
                              </Badge>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>
                                Presença: {member.attended_meetings} de {member.total_meetings} encontros
                              </span>
                              <span>
                                Última presença: {member.last_attendance 
                                  ? formatDate(member.last_attendance) 
                                  : 'Nunca'}
                              </span>
                            </div>
                          </div>
                          <Badge 
                            className={`text-base font-bold ${getAttendanceColor(member.attendance_rate)}`}
                          >
                            {member.attendance_rate}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {memberAttendance.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum dado de presença disponível
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
