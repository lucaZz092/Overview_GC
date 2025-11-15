import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Users, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Footer } from "@/components/Footer";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  grupo_crescimento: string | null;
  attendance_count: number;
  leader_name?: string;
  user_id: string;
}

interface AgendaCompletaProps {
  onBack: () => void;
}

export function AgendaCompleta({ onBack }: AgendaCompletaProps) {
  const { profile } = useUserProfile();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGC, setFilterGC] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("upcoming");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [meetings, filterGC, filterPeriod]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);

      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: true });

      if (meetingsError) throw meetingsError;

      if (meetingsData && meetingsData.length > 0) {
        const userIds = [...new Set((meetingsData as any[]).map((m: any) => m.user_id).filter(Boolean))];
        
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        const usersMap = new Map((usersData as any[] || []).map((u: any) => [u.id, u.name]));

        const enrichedMeetings = (meetingsData as any[]).map((meeting: any) => ({
          ...meeting,
          leader_name: usersMap.get(meeting.user_id) || 'Desconhecido'
        }));

        setMeetings(enrichedMeetings);
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.error('Erro ao buscar encontros:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMeetings = () => {
    let filtered = [...meetings];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Filtrar por GC
    if (filterGC !== "all") {
      filtered = filtered.filter(m => m.grupo_crescimento === filterGC);
    }

    // Filtrar por período
    if (filterPeriod === "upcoming") {
      filtered = filtered.filter(m => new Date(m.date) >= now);
    } else if (filterPeriod === "past") {
      filtered = filtered.filter(m => new Date(m.date) < now);
    } else if (filterPeriod === "month") {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      filtered = filtered.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate >= monthStart && meetingDate <= monthEnd;
      });
    }

    setFilteredMeetings(filtered);
  };

  const getUniqueGCs = () => {
    const gcs = meetings
      .map(m => m.grupo_crescimento)
      .filter((gc): gc is string => gc !== null && gc !== undefined);
    return [...new Set(gcs)].sort();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return new Date(dateString) >= now;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getCurrentMonthName = () => {
    return currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-green-700">Agenda Completa</h1>
              <p className="text-gray-600">Todos os encontros programados</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="shadow-soft mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Período
                </label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Próximos</SelectItem>
                    <SelectItem value="past">Realizados</SelectItem>
                    <SelectItem value="month">Mês Específico</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterPeriod === "month" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Mês
                  </label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={previousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm flex-1 text-center capitalize">
                      {getCurrentMonthName()}
                    </span>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Grupo
                </label>
                <Select value={filterGC} onValueChange={setFilterGC}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os grupos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os grupos</SelectItem>
                    {getUniqueGCs().map(gc => (
                      <SelectItem key={gc} value={gc}>{gc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resultados</label>
                <div className="h-10 flex items-center">
                  <Badge variant="secondary" className="text-base">
                    {filteredMeetings.length} encontro(s)
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Encontros */}
        {loading ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Carregando agenda...</p>
            </CardContent>
          </Card>
        ) : filteredMeetings.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum encontro encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMeetings.map((meeting) => (
              <Card 
                key={meeting.id} 
                className={`shadow-soft hover:shadow-strong transition-all duration-200 ${
                  isUpcoming(meeting.date) ? 'border-l-4 border-l-green-500' : 'opacity-75'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{meeting.title}</CardTitle>
                        {isUpcoming(meeting.date) && (
                          <Badge className="bg-green-100 text-green-700">Próximo</Badge>
                        )}
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(meeting.date)}
                          </span>
                          {meeting.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {meeting.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {meeting.attendance_count} pessoas
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {meeting.grupo_crescimento && (
                            <Badge variant="outline">{meeting.grupo_crescimento}</Badge>
                          )}
                          <span className="text-xs">Líder: {meeting.leader_name}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatShortDate(meeting.date)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {meeting.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600">{meeting.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
