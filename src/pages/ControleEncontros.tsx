import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, AlertCircle, Calendar, Users, Clock, ArrowLeft, Search, Mail, Phone } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GCStatus {
  gc_code: string;
  gc_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  co_leader_name?: string;
  co_leader_email?: string;
  last_meeting_date?: string;
  days_since_last_meeting?: number;
  total_meetings: number;
  status: 'up_to_date' | 'warning' | 'critical';
}

interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  gc_code: string;
  registered_by_name: string;
  registered_by_role: string;
  created_at: string;
}

interface ControleEncontrosProps {
  onBack: () => void;
}

export function ControleEncontros({ onBack }: ControleEncontrosProps) {
  const [gcStatuses, setGcStatuses] = useState<GCStatus[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("7"); // dias

  const gcList = [
    { code: "gc-legacy-faith", name: "GC Legacy Faith" },
    { code: "gc-legacy-awake", name: "GC Legacy Awake" },
    { code: "gc-legacy-kairos", name: "GC Legacy Kairós" },
    { code: "gc-legacy-revival", name: "GC Legacy Revival" },
    { code: "gc-legacy-chosen", name: "GC Legacy Chosen" },
    { code: "gc-legacy-overflow", name: "GC Legacy Overflow" },
    { code: "gc-legacy-rise", name: "GC Legacy Rise" },
    { code: "gc-legacy-arrow", name: "GC Legacy Arrow" },
    { code: "gc-legacy-renew", name: "GC Legacy Renew" },
    { code: "gc-legacy-trinity", name: "GC Legacy Trinity" },
  ];

  useEffect(() => {
    loadData();
  }, [filterPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadGCStatuses(), loadRecentMeetings()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de controle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGCStatuses = async () => {
    try {
      const statusList: GCStatus[] = [];

      for (const gc of gcList) {
        // Buscar líderes do GC
        const { data: leaders } = await supabase
          .from('users')
          .select('name, email, phone, role')
          .eq('grupo_crescimento', gc.code)
          .in('role', ['leader', 'co_leader']);

        const leader = (leaders as any)?.find((l: any) => l.role === 'leader');
        const coLeader = (leaders as any)?.find((l: any) => l.role === 'co_leader');

        // Buscar último encontro do GC
        const { data: lastMeeting } = await supabase
          .from('meetings')
          .select('date')
          .eq('gc_code', gc.code)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        // Contar total de encontros
        const { count: totalMeetings } = await supabase
          .from('meetings')
          .select('*', { count: 'exact', head: true })
          .eq('gc_code', gc.code);

        // Calcular dias desde o último encontro
        let daysSinceLastMeeting = null;
        let status: 'up_to_date' | 'warning' | 'critical' = 'critical';

        if (lastMeeting && (lastMeeting as any)?.date) {
          const lastDate = new Date((lastMeeting as any).date);
          const today = new Date();
          daysSinceLastMeeting = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysSinceLastMeeting <= 7) {
            status = 'up_to_date';
          } else if (daysSinceLastMeeting <= 14) {
            status = 'warning';
          } else {
            status = 'critical';
          }
        }

        statusList.push({
          gc_code: gc.code,
          gc_name: gc.name,
          leader_name: (leader as any)?.name || 'Sem líder cadastrado',
          leader_email: (leader as any)?.email || '',
          leader_phone: (leader as any)?.phone || '',
          co_leader_name: (coLeader as any)?.name,
          co_leader_email: (coLeader as any)?.email,
          last_meeting_date: lastMeeting && (lastMeeting as any)?.date,
          days_since_last_meeting: daysSinceLastMeeting,
          total_meetings: totalMeetings || 0,
          status: status,
        });
      }

      setGcStatuses(statusList);
    } catch (error) {
      console.error("Erro ao carregar status dos GCs:", error);
    }
  };

  const loadRecentMeetings = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(filterPeriod));

      const { data: meetings, error } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          date,
          gc_code,
          user_id,
          created_at
        `)
        .gte('date', daysAgo.toISOString())
        .order('date', { ascending: false });

      if (error) throw error;

      // Enriquecer com dados do usuário
      const enrichedMeetings: MeetingRecord[] = [];
      
      for (const meeting of (meetings as any) || []) {
        const { data: user } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', meeting.user_id)
          .single();

        enrichedMeetings.push({
          id: meeting.id,
          title: meeting.title,
          date: meeting.date,
          gc_code: meeting.gc_code,
          registered_by_name: user && (user as any)?.name || 'Usuário desconhecido',
          registered_by_role: user && (user as any)?.role || '',
          created_at: meeting.created_at,
        });
      }

      setRecentMeetings(enrichedMeetings);
    } catch (error) {
      console.error("Erro ao carregar encontros recentes:", error);
    }
  };

  const getStatusBadge = (status: 'up_to_date' | 'warning' | 'critical') => {
    const config = {
      up_to_date: { label: "Em dia", variant: "default" as const, icon: CheckCircle2, color: "text-green-600" },
      warning: { label: "Atenção", variant: "secondary" as const, icon: AlertCircle, color: "text-yellow-600" },
      critical: { label: "Atrasado", variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
    };

    const { label, variant, icon: Icon, color } = config[status];
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
        {label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleNames: Record<string, string> = {
      leader: "Líder",
      co_leader: "Co-Líder",
      pastor: "Pastor",
      coordenador: "Coordenador",
      admin: "Admin",
    };
    return roleNames[role] || role;
  };

  const getGCName = (gcCode: string) => {
    const gc = gcList.find(g => g.code === gcCode);
    return gc?.name || gcCode;
  };

  const filteredGCs = gcStatuses.filter(gc => {
    const matchesSearch = gc.gc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gc.leader_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || gc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Estatísticas gerais
  const stats = {
    total: gcStatuses.length,
    upToDate: gcStatuses.filter(gc => gc.status === 'up_to_date').length,
    warning: gcStatuses.filter(gc => gc.status === 'warning').length,
    critical: gcStatuses.filter(gc => gc.status === 'critical').length,
    totalMeetings: gcStatuses.reduce((sum, gc) => sum + gc.total_meetings, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar className="h-10 w-10 text-primary" />
            Controle de Encontros
          </h1>
          <p className="text-gray-600">
            Acompanhe o registro de encontros de todos os Grupos de Crescimento
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de GC's</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-800">Em Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.upToDate}</div>
              <p className="text-xs text-green-700 mt-1">Registraram nos últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-800">Atenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.warning}</div>
              <p className="text-xs text-yellow-700 mt-1">8-14 dias sem registro</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-800">Atrasados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
              <p className="text-xs text-red-700 mt-1">Mais de 14 dias sem registro</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Encontros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalMeetings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        {stats.critical > 0 && (
          <Alert className="mb-6 border-red-300 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Atenção Necessária!</AlertTitle>
            <AlertDescription className="text-red-700">
              <strong>{stats.critical}</strong> grupo(s) está(ão) há mais de 14 dias sem registrar encontros.
              Entre em contato com os líderes responsáveis.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="status" className="gap-2">
              <Users className="h-4 w-4" />
              Status dos GC's
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <Clock className="h-4 w-4" />
              Registros Recentes
            </TabsTrigger>
          </TabsList>

          {/* Aba: Status dos GC's */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status de Registro por Grupo de Crescimento</CardTitle>
                <CardDescription>
                  Visualize quando foi o último encontro registrado de cada GC
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por GC ou líder..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="up_to_date">Em dia</SelectItem>
                      <SelectItem value="warning">Atenção</SelectItem>
                      <SelectItem value="critical">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabela */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>GC</TableHead>
                        <TableHead>Líder</TableHead>
                        <TableHead>Co-Líder</TableHead>
                        <TableHead>Último Encontro</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGCs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                            Nenhum GC encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredGCs.map((gc) => (
                          <TableRow key={gc.gc_code}>
                            <TableCell className="font-semibold">{gc.gc_name}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{gc.leader_name}</p>
                                {gc.leader_email && (
                                  <p className="text-xs text-gray-500">{gc.leader_email}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {gc.co_leader_name ? (
                                <div>
                                  <p className="font-medium">{gc.co_leader_name}</p>
                                  {gc.co_leader_email && (
                                    <p className="text-xs text-gray-500">{gc.co_leader_email}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {gc.last_meeting_date ? (
                                new Date(gc.last_meeting_date).toLocaleDateString('pt-BR')
                              ) : (
                                <span className="text-red-500">Nenhum registro</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {gc.days_since_last_meeting !== null ? (
                                <span className={
                                  gc.days_since_last_meeting <= 7 ? "text-green-600 font-semibold" :
                                  gc.days_since_last_meeting <= 14 ? "text-yellow-600 font-semibold" :
                                  "text-red-600 font-semibold"
                                }>
                                  {gc.days_since_last_meeting} dias
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{gc.total_meetings} encontros</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(gc.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {gc.leader_email && (
                                  <a
                                    href={`mailto:${gc.leader_email}`}
                                    className="text-primary hover:text-primary/80"
                                    title={`Email: ${gc.leader_email}`}
                                  >
                                    <Mail className="h-4 w-4" />
                                  </a>
                                )}
                                {gc.leader_phone && (
                                  <a
                                    href={`tel:${gc.leader_phone}`}
                                    className="text-primary hover:text-primary/80"
                                    title={`Telefone: ${gc.leader_phone}`}
                                  >
                                    <Phone className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Registros Recentes */}
          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Encontros Registrados Recentemente</CardTitle>
                    <CardDescription>
                      Visualize todos os encontros registrados no período selecionado
                    </CardDescription>
                  </div>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="14">Últimos 14 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="60">Últimos 60 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>GC</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Registrado por</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Quando</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentMeetings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            Nenhum encontro registrado no período selecionado
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentMeetings.map((meeting) => (
                          <TableRow key={meeting.id}>
                            <TableCell className="font-medium">
                              {new Date(meeting.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{getGCName(meeting.gc_code)}</Badge>
                            </TableCell>
                            <TableCell>{meeting.title}</TableCell>
                            <TableCell>{meeting.registered_by_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getRoleBadge(meeting.registered_by_role)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(meeting.created_at).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(meeting.created_at).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
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
