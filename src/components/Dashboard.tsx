import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, TrendingUp, MapPin, Plus, Eye, LogOut, User, Mail, Shield, Calendar as CalendarIcon, Megaphone, Settings } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthContext } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { Footer } from "@/components/Footer";

type SupportedRole = 'admin' | 'pastor' | 'coordenador' | 'leader' | 'co_leader';

const normalizeRole = (rawRole?: string | null): SupportedRole | undefined => {
  if (!rawRole) return undefined;

  const normalized = rawRole
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  switch (normalized) {
    case 'admin':
      return 'admin';
    case 'pastor':
      return 'pastor';
    case 'coordenador':
    case 'coordinator':
      return 'coordenador';
    case 'leader':
    case 'lider':
      return 'leader';
    case 'co_leader':
    case 'co_lider':
    case 'coleader':
    case 'colider':
      return 'co_leader';
    default:
      return undefined;
  }
};

interface DashboardProps {
  userType: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onRoleSelect?: (role: string) => void;
}

interface LeaderActivityEntry {
  id: string;
  title: string;
  date: string;
  location: string | null;
  attendance_count: number | null;
  user_id: string;
  user_name: string;
  gc_code: string | null;
}

export function Dashboard({ userType, onNavigate, onLogout, onRoleSelect }: DashboardProps) {
  const { user } = useAuthContext();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  
  // Estados para dados reais
  const [meetingsStats, setMeetingsStats] = useState({
    thisMonth: 0,
    total: 0,
    loading: true
  });
  const [membersCount, setMembersCount] = useState(0);
  const [leaderActivities, setLeaderActivities] = useState<LeaderActivityEntry[]>([]);
  const [leaderActivitiesLoading, setLeaderActivitiesLoading] = useState(false);
  const [leaderActivitiesError, setLeaderActivitiesError] = useState<string | null>(null);

  const normalizedProfileRole = normalizeRole(profile?.role);
  const normalizedUserType = normalizeRole(userType);
  const effectiveRole: SupportedRole = normalizedProfileRole === 'admin' && normalizedUserType
    ? normalizedUserType
    : (normalizedProfileRole ?? normalizedUserType ?? 'co_leader');

  // Usar o userType escolhido pelo admin, ou o role do perfil se não for admin
  // Hook para buscar dados reais
  useEffect(() => {
    const fetchRealData = async () => {
      if (!user || !effectiveRole) {
        return;
      }

      try {
        setMeetingsStats((prev) => ({ ...prev, loading: true }));

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let meetingsQuery = supabase
          .from('meetings')
          .select('id, date, created_at, user_id');

        let membersQuery = supabase
          .from('members')
          .select('id', { count: 'exact' });

        const relevantUserIdsSet = new Set<string>();
        const userNameMap = new Map<string, string>();
        const userGroupMap = new Map<string, string | null>();

        relevantUserIdsSet.add(user.id);
        userNameMap.set(user.id, profile?.name || 'Você');
        userGroupMap.set(user.id, profile?.grupo_crescimento || null);

        if (effectiveRole === 'leader') {
          setLeaderActivitiesLoading(true);
          setLeaderActivitiesError(null);

          if (profile?.grupo_crescimento) {
            const { data: relatedProfiles, error: relatedProfilesError } = await supabase
              .from('profiles')
              .select('id, name, grupo_crescimento, role')
              .eq('grupo_crescimento', profile.grupo_crescimento);

            if (relatedProfilesError) {
              throw relatedProfilesError;
            }

            (relatedProfiles || []).forEach((person: any) => {
              relevantUserIdsSet.add(person.id);
              userNameMap.set(person.id, person.name || 'Co-líder');
              userGroupMap.set(person.id, person.grupo_crescimento);
            });
          }

          const relevantUserIds = Array.from(relevantUserIdsSet);

          meetingsQuery = meetingsQuery.in('user_id', relevantUserIds);

          if (profile?.grupo_crescimento) {
            membersQuery = membersQuery.in('gc_code', [profile.grupo_crescimento]);
          } else {
            membersQuery = membersQuery.eq('user_id', user.id);
          }

          const { data: recentMeetings, error: recentMeetingsError } = await supabase
            .from('meetings')
            .select('id, title, date, location, attendance_count, user_id')
            .in('user_id', relevantUserIds)
            .order('date', { ascending: false })
            .limit(8);

          if (recentMeetingsError) {
            throw recentMeetingsError;
          }

          const formattedActivities: LeaderActivityEntry[] = (recentMeetings || []).map((meeting: any) => ({
            id: meeting.id,
            title: meeting.title || 'Encontro registrado',
            date: meeting.date,
            location: meeting.location ?? null,
            attendance_count: meeting.attendance_count ?? null,
            user_id: meeting.user_id,
            user_name: userNameMap.get(meeting.user_id) || 'Co-líder',
            gc_code: userGroupMap.get(meeting.user_id) ?? null,
          }));

          setLeaderActivities(formattedActivities);
        } else {
          if (effectiveRole === 'co_leader') {
            meetingsQuery = meetingsQuery.eq('user_id', user.id);
            membersQuery = membersQuery.eq('user_id', user.id);
          }
          setLeaderActivities([]);
          setLeaderActivitiesError(null);
          setLeaderActivitiesLoading(false);
        }

        const [meetingsResult, membersResult] = await Promise.allSettled([
          meetingsQuery,
          membersQuery,
        ]);

        if (meetingsResult.status === 'fulfilled') {
          const { data: allMeetings, error: meetingsError } = meetingsResult.value;

          if (meetingsError) {
            console.error('Erro ao buscar encontros:', meetingsError);
            setMeetingsStats((prev) => ({ ...prev, loading: false }));
          } else {
            const total = allMeetings?.length || 0;
            const thisMonth = (allMeetings as any[] || []).filter((meeting: any) =>
              new Date(meeting.date) >= startOfMonth
            ).length || 0;

            setMeetingsStats({
              thisMonth,
              total,
              loading: false,
            });
          }
        } else {
          console.error('Erro ao buscar encontros:', meetingsResult.reason);
          setMeetingsStats((prev) => ({ ...prev, loading: false }));
        }

        if (membersResult.status === 'fulfilled') {
          const { count: membersTotal, error: membersError } = membersResult.value;

          if (membersError) {
            console.error('Erro ao buscar membros:', membersError);
          } else {
            setMembersCount(membersTotal || 0);
          }
        } else {
          console.error('Erro ao buscar membros:', membersResult.reason);
        }
      } catch (error: any) {
        console.error('Erro ao buscar dados do dashboard:', error);
        setMeetingsStats((prev) => ({ ...prev, loading: false }));

        if (effectiveRole === 'leader') {
          setLeaderActivities([]);
          setLeaderActivitiesError(error.message || 'Não foi possível carregar os encontros.');
        }
      } finally {
        if (effectiveRole === 'leader') {
          setLeaderActivitiesLoading(false);
        }
      }
    };

    fetchRealData();
  }, [user, effectiveRole, profile?.grupo_crescimento, profile?.name]);

  // Função para formatar o nome do GC para exibição
  const formatGCName = (gcCode: string | undefined) => {
    if (!gcCode) return "Não definido";
    
    const gcNames: { [key: string]: string } = {
      'gc-legacy-faith': 'GC Legacy Faith',
      'gc-legacy-awake': 'GC Legacy Awake', 
      'gc-legacy-kairos': 'GC Legacy Kairós',
      'gc-legacy-revival': 'GC Legacy Revival',
      'gc-legacy-chosen': 'GC Legacy Chosen',
      'gc-legacy-overflow': 'GC Legacy Overflow',
      'gc-legacy-rise': 'GC Legacy Rise',
      'gc-legacy-arrow': 'GC Legacy Arrow',
      'gc-legacy-renew': 'GC Legacy Renew',
      'gc-legacy-trinity': 'GC Legacy Trinity',
    };
    
    return gcNames[gcCode] || gcCode;
  };

  const formatMeetingDateTime = (isoDate: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(isoDate));
    } catch (error) {
      console.error('Erro ao formatar data de encontro:', error);
      return 'Data indisponível';
    }
  };

  const getRelativeTimeLabel = (isoDate: string) => {
    const eventDate = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - eventDate.getTime();

    if (Number.isNaN(diffMs)) {
      return '';
    }

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 60) {
      return `Há ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    }

    if (diffHours < 24) {
      return `Há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    }

    if (diffDays === 1) {
      return 'Ontem';
    }

    if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    }

    return eventDate.toLocaleDateString('pt-BR');
  };

  // Componente de dropdown do usuário
  const UserDropdown = () => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getRoleLabel = (role: string) => {
      const normalized = normalizeRole(role) ?? normalizeRole(normalizedUserType) ?? normalizeRole(profile?.role);

      switch (normalized) {
        case 'admin':
          return 'Administrador';
        case 'pastor':
          return 'Pastor';
        case 'coordenador':
          return 'Coordenador';
        case 'leader':
          return 'Líder';
        case 'co_leader':
          return 'Co-líder';
        default:
          return role;
      }
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/10 p-2"
          >
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel>Informações do Usuário</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{profile?.name || 'Nome não definido'}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  {getRoleLabel(effectiveRole)}
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              
              {profile?.grupo_crescimento && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{formatGCName(profile.grupo_crescimento)}</span>
                </div>
              )}
              
              {profile?.created_at && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Membro desde {formatDate(profile.created_at)}</span>
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onLogout}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Se ainda estiver carregando e não tiver dados, mostrar loading
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando Perfil...</p>
        </div>
      </div>
    );
  }

  // Se deu erro ao carregar o perfil
  if (profileError) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-lg border-red-500">
          <CardHeader>
            <CardTitle className="text-red-700">🚨 Erro ao Carregar Perfil</CardTitle>
            <CardDescription>Não foi possível carregar as informações do seu perfil. Tente recarregar a página.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600"><strong>Detalhes do erro:</strong> {profileError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 w-full">
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se é admin mas não escolheu papel nesta sessão, mostrar seleção
  if (profile?.role === 'admin' && !userType) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
             👑 Área Administrativa
            </h1>
            <p className="text-white/80">
              Escolha o papel para esta sessão
            </p>
          </div>

          <Card className="shadow-strong border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-700">
                👋 Bem-vindo, Administrador!
              </CardTitle>
              <CardDescription>
                Como você deseja acessar o sistema hoje?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  onClick={() => onRoleSelect('pastor')}
                  className="w-full bg-gradient-primary text-lg py-6"
                >
                  🙏 Pastor
                </Button>
                
                <Button 
                  onClick={() => onRoleSelect('coordenador')}
                  className="w-full bg-gradient-primary text-lg py-6"
                  variant="outline"
                >
                  📊 Coordenador
                </Button>
                
                <Button 
                  onClick={() => onRoleSelect('leader')}
                  className="w-full bg-gradient-primary text-lg py-6"
                  variant="outline"
                >
                  👑 Líder
                </Button>
                
                <Button 
                  onClick={() => onRoleSelect('co_leader')}
                  className="w-full bg-gradient-primary text-lg py-6"
                  variant="outline"
                >
                  🤝 Co-Líder
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={onLogout}
                  variant="ghost"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Se não tiver perfil, mostrar erro
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h2 className="text-2xl font-bold mb-4">⚠️ Perfil não encontrado</h2>
          <p className="mb-4">Não foi possível carregar seu perfil do banco de dados.</p>
          <p className="text-sm mb-2">User: {user?.email}</p>
          <p className="text-sm mb-4">UserType: {userType}</p>
          <div className="bg-white/10 p-4 rounded-lg text-left">
            <p className="font-bold mb-2">Possíveis causas:</p>
            <p>• Schema do banco não foi executado</p>
            <p>• Usuário não existe na tabela public.users</p>
            <p>• Problema de conexão com Supabase</p>
          </div>
          <Button 
            onClick={onLogout}
            className="mt-4"
            variant="outline"
          >
            Fazer logout e tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const getWelcomeMessage = () => {
    if (profileLoading) return "Dashboard";
    
    switch (effectiveRole) {
      case "admin":
        return "Área Administrativa";
      case "pastor":
        return "Área do Pastor";
      case "coordenador":
        return "Área do Coordenador";
      case "leader":
        return "Área do Líder";
      case "co_leader":
        return "Área do Co-Líder";
      default:
        return "Dashboard";
    }
  };

  const getUserBadge = () => {
    if (profileLoading) return null;
    
    const roleToShow = effectiveRole;
    const isActingAsAdmin = profile?.role === 'admin';
    
    switch (roleToShow) {
      case "admin":
        return <Badge variant="destructive">Administrador</Badge>;
      case "pastor":
        return (
          <div className="flex gap-2">
            <Badge variant="destructive">Pastor</Badge>
            {isActingAsAdmin && <Badge variant="outline" className="text-xs">Admin</Badge>}
          </div>
        );
      case "coordenador":
        return (
          <div className="flex gap-2">
            <Badge variant="destructive">Coordenador</Badge>
            {isActingAsAdmin && <Badge variant="outline" className="text-xs">Admin</Badge>}
          </div>
        );
      case "leader":
        return (
          <div className="flex gap-2">
            <Badge variant="default">Líder</Badge>
            {isActingAsAdmin && <Badge variant="outline" className="text-xs">Admin</Badge>}
          </div>
        );
      case "co_leader":
        return (
          <div className="flex gap-2">
            <Badge variant="secondary">Co-Líder</Badge>
            {isActingAsAdmin && <Badge variant="outline" className="text-xs">Admin</Badge>}
          </div>
        );
      default:
        return <Badge variant="outline">Usuário</Badge>;
    }
  };

  // Estatísticas específicas para pastores (visão geral completa)
  const pastorStats = [
    {
      title: "Total de Encontros",
      value: meetingsStats.loading ? "..." : meetingsStats.total.toString(),
      icon: Calendar,
      description: "Registrados no sistema"
    },
    {
      title: "Encontros este Mês",
      value: meetingsStats.loading ? "..." : meetingsStats.thisMonth.toString(),
      icon: TrendingUp,
      description: "Reuniões realizadas"
    },
    {
      title: "Total de Membros",
      value: membersCount.toString(),
      icon: Users,
      description: "Cadastrados no sistema"
    },
    {
      title: "Usuários Ativos",
      value: "---", // Pode implementar depois
      icon: MapPin,
      description: "Líderes e co-líderes"
    }
  ];

  // Estatísticas específicas para líderes e pastores
  const liderStats = [
    {
      title: "Meu Grupo Principal",
      value: formatGCName(profile?.grupo_crescimento),
      icon: Users,
      description: "Grupo que você lidera"
    }
  ];

  // Co-líderes têm estatísticas limitadas apenas do seu grupo
  const coLiderStats = [
    {
      title: "Meu Grupo",
      value: formatGCName(profile?.grupo_crescimento),
      icon: Users,
      description: "Grupo que você co-lidera"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Overview - GC</h1>
            <p className="text-white/80">{getWelcomeMessage()}</p>
            {profile && (
              <p className="text-white/60 text-sm">Bem-vindo, {profile.name}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {getUserBadge()}
            <UserDropdown />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid - Específico para cada tipo de usuário */}
        {effectiveRole === "co_leader" ? (
          <div className="flex justify-center mb-8">
            {coLiderStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card 
                  key={index}
                  className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer hover:scale-105 w-full max-w-md"
                  onClick={() => onNavigate('meu-grupo')}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <IconComponent className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                    <p className="text-xs text-primary mt-2">
                      Clique para ver detalhes →
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : effectiveRole === "leader" ? (
          <div className="flex justify-center mb-8">
            {liderStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card 
                  key={index}
                  className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer hover:scale-105 w-full max-w-md"
                  onClick={() => onNavigate('meu-grupo')}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <IconComponent className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                    <p className="text-xs text-primary mt-2">
                      Clique para ver detalhes →
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : effectiveRole === "pastor" || effectiveRole === "coordenador" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {pastorStats.map((stat, index) => (
              <Card key={index} className="shadow-soft hover:shadow-strong transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Action Cards - Interface simplificada para co-líderes */}
        {effectiveRole === "co_leader" ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Suas Funcionalidades</h2>
              <p className="text-muted-foreground">Gerencie o seu grupo de crescimento</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card" 
                    onClick={() => onNavigate("registro-encontro")}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Registrar Encontro</CardTitle>
                  <CardDescription>
                    Adicione um novo encontro do seu grupo de crescimento
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
                    onClick={() => onNavigate("encontros-registrados")}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Ver Encontros</CardTitle>
                  <CardDescription>
                    Visualize todos os encontros registrados
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
                    onClick={() => onNavigate("registro-membro")}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Cadastrar Membro</CardTitle>
                  <CardDescription>
                    Adicione novos membros ao grupo de crescimento
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
                    onClick={() => onNavigate("membro-registrado")}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Membros Cadastrados</CardTitle>
                  <CardDescription>
                    Visualize os membros cadastrados no seu GC
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
          
        ) : effectiveRole === "leader" ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Suas Funcionalidades</h2>
              <p className="text-muted-foreground">Gerencie os grupos de crescimento sob sua liderança</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card" 
                    onClick={() => onNavigate("registro-encontro")}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Registrar Encontro</CardTitle>
                  <CardDescription>
                    Adicione um novo encontro dos seus grupos
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
                    onClick={() => onNavigate("encontros-registrados")}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Ver Encontros</CardTitle>
                  <CardDescription>
                    Visualize todos os encontros registrados
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
                    onClick={() => onNavigate("registro-membro")}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Cadastrar Membro</CardTitle>
                  <CardDescription>
                    Adicione novos membros aos grupos
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
                    onClick={() => onNavigate("membro-registrado")}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Membros Cadastrados</CardTitle>
                  <CardDescription>
                    Visualize os membros cadastrados
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
                onClick={() => onNavigate("proximos-encontros")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Próximos Encontros</CardTitle>
                  <CardDescription>
                    Agenda dos seus grupos
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
                onClick={() => onNavigate("meus-grupos")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Meus Grupos</CardTitle>
                  <CardDescription>
                    Gerencie seus grupos de crescimento
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : effectiveRole === "pastor" || effectiveRole === "coordenador" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card 
              className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
              onClick={() => onNavigate("relatorios-gerais")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Relatórios Gerais
                </CardTitle>
                <CardDescription>
                  Relatórios de todos os grupos da igreja
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
              onClick={() => onNavigate("agenda-completa")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Agenda Completa
                </CardTitle>
                <CardDescription>
                  Todos os encontros programados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
              onClick={() => onNavigate("gestao-geral")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Gestão Geral
                </CardTitle>
                <CardDescription>
                  Supervisão de todos os grupos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
              onClick={() => onNavigate("avisos")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Avisos e Comunicados
                </CardTitle>
                <CardDescription>
                  Gerenciar mensagens para líderes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
              onClick={() => onNavigate("controle-encontros")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Controle de Encontros
                </CardTitle>
                <CardDescription>
                  Acompanhe os registros de todos os GC's
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : null}

        {/* Admin Panel - Exclusivo para Admin */}
        {normalizedProfileRole === "admin" && (
          <div className="mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-red-600">Área Administrativa</h2>
              <p className="text-muted-foreground">Acesso exclusivo para administradores do sistema</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Card 
                className="shadow-strong hover:shadow-xl transition-all duration-200 cursor-pointer bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:scale-105"
                onClick={() => onNavigate("painel-admin")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-red-800">Painel Administrativo</CardTitle>
                  <CardDescription className="text-red-700">
                    Gerencie usuários, visualize estatísticas e configure o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex justify-center gap-4 text-sm text-red-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Gerenciar Usuários</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Estatísticas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Activity - Filtrada por tipo de usuário */}
        {(effectiveRole === "pastor" || effectiveRole === "coordenador") && (
          <Card className="mt-8 shadow-soft">
            <CardHeader>
              <CardTitle>Atividade Recente - Todos os Grupos</CardTitle>
              <CardDescription>
                Últimas ações realizadas em toda a igreja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Encontro registrado - Grupo Vila Nova</p>
                    <p className="text-xs text-muted-foreground">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo membro cadastrado - Maria Silva (Grupo Centro)</p>
                    <p className="text-xs text-muted-foreground">Ontem</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Relatório mensal gerado - Região Sul</p>
                    <p className="text-xs text-muted-foreground">3 dias atrás</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {effectiveRole === "leader" && (
          <Card className="mt-8 overflow-hidden shadow-strong border border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Calendar className="h-5 w-5" />
                    Encontros Registrados
                  </CardTitle>
                  <CardDescription className="text-primary/70">
                    Histórico recente dos encontros registrados por você e seus co-líderes
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-white/80 text-primary border-primary/40">
                  {leaderActivitiesLoading ? 'Carregando...' : `${leaderActivities.length} registro${leaderActivities.length === 1 ? '' : 's'}`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="bg-white/60 backdrop-blur-sm p-6">
              {leaderActivitiesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="h-24 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse"
                    />
                  ))}
                </div>
              ) : leaderActivitiesError ? (
                <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-600">
                  {leaderActivitiesError}
                </div>
              ) : leaderActivities.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-base font-medium">Nenhum encontro registrado ainda.</p>
                  <p className="mt-2 text-sm">
                    Utilize a opção <strong>“Registrar Encontro”</strong> para documentar as reuniões e acompanhar todo o histórico aqui.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => onNavigate("registro-encontro")}>
                    Registrar novo encontro
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-1 bottom-1 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
                  <div className="space-y-6">
                    {leaderActivities.map((activity, index) => (
                      <div key={activity.id} className="relative pl-12">
                        <span className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-lg">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <div className="rounded-xl border border-primary/10 bg-gradient-to-r from-white via-white to-primary/5 p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-base font-semibold text-gray-900">{activity.title}</p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-2 rounded-full bg-primary/5 px-2 py-1">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  {formatMeetingDateTime(activity.date)}
                                </span>
                                {activity.location && (
                                  <span className="flex items-center gap-2 rounded-full bg-primary/5 px-2 py-1">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {activity.location}
                                  </span>
                                )}
                                {typeof activity.attendance_count === 'number' && (
                                  <span className="flex items-center gap-2 rounded-full bg-primary/5 px-2 py-1">
                                    <Users className="h-4 w-4 text-primary" />
                                    {activity.attendance_count} participante{activity.attendance_count === 1 ? '' : 's'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="whitespace-nowrap bg-white/80 text-primary border-primary/30">
                              {getRelativeTimeLabel(activity.date)}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-primary" />
                              Responsável: {activity.user_name}
                            </span>
                            {activity.gc_code && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5 text-primary" />
                                GC: {formatGCName(activity.gc_code)}
                              </span>
                            )}
                          </div>
                        </div>
                        {index !== leaderActivities.length - 1 && (
                          <div className="absolute left-5 top-[calc(100%+4px)] h-4 w-px bg-primary/20" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Avisos para líderes e co-líderes */}
        {(effectiveRole === "leader" || effectiveRole === "co_leader") && (
          <AnnouncementsSection role={effectiveRole} />
        )}
      </div>
      <Footer />
    </div>
  );
}

// Componente para exibir avisos
function AnnouncementsSection({ role }: { role: string }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, [role]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      console.log('📢 Dashboard: Carregando avisos para papel:', role);
      
      // Buscar todos os avisos ativos
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (error) {
        console.error('❌ Dashboard: Erro ao buscar avisos:', error);
        throw error;
      }

      console.log('📊 Dashboard: Avisos encontrados:', data?.length || 0);

      // Filtrar avisos que incluem o papel atual nos target_roles
      const filteredData = (data as any[])?.filter((announcement: any) => 
        announcement.target_roles && announcement.target_roles.includes(role)
      ) || [];

      console.log('🔍 Dashboard: Avisos filtrados para', role, ':', filteredData.length);

      // Ordenar por prioridade e data
      const sortedData = filteredData.sort((a: any, b: any) => {
        const priorityOrder: any = { urgent: 4, high: 3, normal: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setAnnouncements(sortedData.slice(0, 3));
      console.log('✅ Dashboard: Avisos carregados com sucesso');
    } catch (error) {
      console.error('💥 Dashboard: Erro fatal ao carregar avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-red-500">🔴</span>;
      case 'high':
        return <span className="text-orange-500">🟠</span>;
      default:
        return <span className="text-blue-500">🔵</span>;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Importante';
      case 'normal': return 'Normal';
      case 'low': return 'Informativo';
      default: return 'Normal';
    }
  };

  if (loading) {
    return (
      <Card className="mt-8 shadow-soft bg-gradient-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">Carregando avisos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="mt-8 shadow-soft bg-gradient-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">📢 Avisos e Comunicados</h3>
            <p className="text-muted-foreground">
              Nenhum aviso no momento. Fique atento às atualizações da liderança!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        📢 Avisos e Comunicados
      </h3>
      {announcements.map((announcement) => (
        <Card 
          key={announcement.id} 
          className="shadow-soft bg-gradient-card border-l-4"
          style={{
            borderLeftColor: 
              announcement.priority === 'urgent' ? '#ef4444' : 
              announcement.priority === 'high' ? '#f97316' : 
              '#3b82f6'
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityIcon(announcement.priority)}
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={
                      announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }
                  >
                    {getPriorityLabel(announcement.priority)}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {new Date(announcement.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}