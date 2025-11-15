import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Calendar, TrendingUp, Award, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Footer } from "@/components/Footer";

interface GCStats {
  name: string;
  membersCount: number;
  meetingsCount: number;
  avgAttendance: number;
  leaderName: string;
  isActive: boolean;
}

interface GlobalStats {
  totalMembers: number;
  activeMembers: number;
  totalGroups: number;
  totalMeetings: number;
  avgAttendance: number;
}

interface GestaoGeralProps {
  onBack: () => void;
}

export function GestaoGeral({ onBack }: GestaoGeralProps) {
  const { profile } = useUserProfile();
  const [gcStats, setGcStats] = useState<GCStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalGroups: 0,
    totalMeetings: 0,
    avgAttendance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Buscar todos os membros
      const { data: membersData } = await supabase
        .from('members')
        .select('*');

      // Buscar todos os encontros
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select('*');

      // Buscar todos os líderes
      const { data: leadersData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['leader', 'pastor', 'coordenador']);

      // Calcular estatísticas globais
      const totalMembers = membersData?.length || 0;
      const activeMembers = membersData?.filter((m: any) => m.is_active).length || 0;
      const totalMeetings = meetingsData?.length || 0;
      const avgAttendance = totalMeetings > 0
        ? Math.round((meetingsData as any[]).reduce((sum: number, m: any) => sum + (m.attendance_count || 0), 0) / totalMeetings)
        : 0;

      // Agrupar por GC
      const gcMap = new Map<string, any>();

      // Adicionar membros por GC
      (membersData as any[] || []).forEach((member: any) => {
        const gc = member.grupo_crescimento || 'Sem Grupo';
        if (!gcMap.has(gc)) {
          gcMap.set(gc, {
            name: gc,
            membersCount: 0,
            meetingsCount: 0,
            totalAttendance: 0,
            leaderName: 'A definir',
            isActive: true
          });
        }
        gcMap.get(gc).membersCount++;
      });

      // Adicionar encontros por GC
      (meetingsData as any[] || []).forEach((meeting: any) => {
        const gc = meeting.grupo_crescimento || 'Sem Grupo';
        if (gcMap.has(gc)) {
          const gcData = gcMap.get(gc);
          gcData.meetingsCount++;
          gcData.totalAttendance += meeting.attendance_count || 0;
        }
      });

      // Adicionar líderes
      (leadersData as any[] || []).forEach((leader: any) => {
        const gc = leader.grupo_crescimento;
        if (gc && gcMap.has(gc)) {
          gcMap.get(gc).leaderName = leader.name;
        }
      });

      // Calcular média de presença por GC
      const gcStatsArray = Array.from(gcMap.values()).map(gc => ({
        ...gc,
        avgAttendance: gc.meetingsCount > 0
          ? Math.round(gc.totalAttendance / gc.meetingsCount)
          : 0
      })).sort((a, b) => b.membersCount - a.membersCount);

      setGlobalStats({
        totalMembers,
        activeMembers,
        totalGroups: gcStatsArray.length,
        totalMeetings,
        avgAttendance
      });

      setGcStats(gcStatsArray);

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-white">Gestão Geral</h1>
              <p className="text-white/80">Visão completa de todos os grupos</p>
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Carregando estatísticas...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Estatísticas Globais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card className="shadow-soft bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total de Membros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{globalStats.totalMembers}</div>
                  <p className="text-xs text-blue-100 mt-1">
                    {globalStats.activeMembers} ativos
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Grupos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{globalStats.totalGroups}</div>
                  <p className="text-xs text-purple-100 mt-1">
                    GCs ativos
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Encontros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{globalStats.totalMeetings}</div>
                  <p className="text-xs text-indigo-100 mt-1">
                    Total realizados
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Presença Média
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{globalStats.avgAttendance}</div>
                  <p className="text-xs text-violet-100 mt-1">
                    pessoas/encontro
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Taxa de Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {globalStats.totalMembers > 0 
                      ? Math.round((globalStats.activeMembers / globalStats.totalMembers) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-blue-100 mt-1">
                    membros ativos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs de Visualização */}
            <Tabs defaultValue="groups" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto">
                <TabsTrigger value="groups">Por Grupo</TabsTrigger>
                <TabsTrigger value="ranking">Ranking</TabsTrigger>
              </TabsList>

              <TabsContent value="groups" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {gcStats.map((gc) => (
                    <Card key={gc.name} className="shadow-soft hover:shadow-strong transition-all duration-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{gc.name}</CardTitle>
                            <CardDescription>
                              <span className="text-sm">Líder: {gc.leaderName}</span>
                            </CardDescription>
                          </div>
                          {gc.isActive && (
                            <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">Membros</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {gc.membersCount}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">Encontros</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {gc.meetingsCount}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-sm">Presença Média</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {gc.avgAttendance}
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <Button variant="ghost" size="sm">
                              Ver Detalhes
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ranking" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ranking por Membros */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Mais Membros
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[...gcStats]
                          .sort((a, b) => b.membersCount - a.membersCount)
                          .slice(0, 5)
                          .map((gc, index) => (
                            <div key={gc.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  index === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-blue-50 text-blue-600'
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{gc.name}</div>
                                  <div className="text-xs text-gray-500">{gc.leaderName}</div>
                                </div>
                              </div>
                              <Badge variant="secondary">{gc.membersCount}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ranking por Encontros */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Mais Encontros
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[...gcStats]
                          .sort((a, b) => b.meetingsCount - a.meetingsCount)
                          .slice(0, 5)
                          .map((gc, index) => (
                            <div key={gc.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  index === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-purple-50 text-purple-600'
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{gc.name}</div>
                                  <div className="text-xs text-gray-500">{gc.leaderName}</div>
                                </div>
                              </div>
                              <Badge variant="secondary">{gc.meetingsCount}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ranking por Presença */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Melhor Presença
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[...gcStats]
                          .filter(gc => gc.meetingsCount > 0)
                          .sort((a, b) => b.avgAttendance - a.avgAttendance)
                          .slice(0, 5)
                          .map((gc, index) => (
                            <div key={gc.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  index === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-green-50 text-green-600'
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{gc.name}</div>
                                  <div className="text-xs text-gray-500">{gc.leaderName}</div>
                                </div>
                              </div>
                              <Badge variant="secondary">{gc.avgAttendance}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
