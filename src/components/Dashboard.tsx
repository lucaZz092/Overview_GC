import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, TrendingUp, MapPin, Plus, Eye, LogOut, User, Mail, Shield, Calendar as CalendarIcon } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthContext } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

interface DashboardProps {
  userType: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onRoleSelect?: (role: string) => void;
}

export function Dashboard({ userType, onNavigate, onLogout, onRoleSelect }: DashboardProps) {
  const { user } = useAuthContext();
  const { profile, loading, isAdmin, isPastor, isLeader } = useUserProfile();
  
  // Estados para dados reais
  const [meetingsStats, setMeetingsStats] = useState({
    thisMonth: 0,
    total: 0,
    loading: true
  });
  const [membersCount, setMembersCount] = useState(0);

  // Usar o userType escolhido pelo admin, ou o role do perfil se não for admin
  const effectiveRole = (profile?.role === 'admin' && userType) ? userType : profile?.role;

  // Hook para buscar dados reais
  useEffect(() => {
    const fetchRealData = async () => {
      if (!user) return;

      try {
        // Calcular início do mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Query base para encontros
        let meetingsQuery = supabase
          .from('meetings')
          .select('id, date, created_at');

        // Query base para membros
        let membersQuery = supabase
          .from('members')
          .select('id', { count: 'exact' });

        // Filtrar por usuário específico para co-líderes e líderes
        if (effectiveRole === 'co_leader' || effectiveRole === 'leader') {
          meetingsQuery = meetingsQuery.eq('user_id', user.id);
          membersQuery = membersQuery.eq('user_id', user.id);
        }
        // Para pastores e admins, mostrar dados de todos

        // Buscar encontros (executar queries em paralelo)
        const [meetingsResult, membersResult] = await Promise.allSettled([
          meetingsQuery,
          membersQuery
        ]);

        // Processar resultado dos encontros
        if (meetingsResult.status === 'fulfilled') {
          const { data: allMeetings, error: meetingsError } = meetingsResult.value;
          
          if (meetingsError) {
            console.error('Erro ao buscar encontros:', meetingsError);
            setMeetingsStats(prev => ({ ...prev, loading: false }));
          } else {
            const total = allMeetings?.length || 0;
            const thisMonth = allMeetings?.filter(meeting => 
              new Date(meeting.date) >= startOfMonth
            ).length || 0;

            setMeetingsStats({
              thisMonth,
              total,
              loading: false
            });
          }
        } else {
          console.error('Erro ao buscar encontros:', meetingsResult.reason);
          setMeetingsStats(prev => ({ ...prev, loading: false }));
        }

        // Processar resultado dos membros
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

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        setMeetingsStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (user && effectiveRole) {
      fetchRealData();
    }
  }, [user, effectiveRole]);

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
      'gc-vila-nova': 'GC Vila Nova',
      'gc-centro': 'GC Centro',
      'gc-norte': 'GC Norte',
      'gc-sul': 'GC Sul',
      'gc-leste': 'GC Leste',
      'gc-oeste': 'GC Oeste',
      'gc-juventude': 'GC Juventude',
      'gc-casais': 'GC Casais'
    };
    
    return gcNames[gcCode] || gcCode;
  };

  // Componente de dropdown do usuário
  const UserDropdown = () => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getRoleLabel = (role: string) => {
      switch (role) {
        case 'admin': return 'Administrador';
        case 'pastor': return 'Pastor';
        case 'leader': return 'Líder';
        case 'co_leader': return 'Co-líder';
        default: return role;
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
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando Dashboard...</p>
          <p className="text-sm mt-2">User: {user?.email}</p>
          <p className="text-sm">UserType: {userType}</p>
        </div>
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
    if (loading) return "Dashboard";
    
    switch (effectiveRole) {
      case "admin":
        return "Área Administrativa";
      case "pastor":
        return "Área do Pastor";
      case "leader":
        return "Área do Líder";
      case "co_leader":
        return "Área do Co-Líder";
      default:
        return "Dashboard";
    }
  };

  const getUserBadge = () => {
    if (loading) return null;
    
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
    },
    {
      title: "Encontros este Mês",
      value: meetingsStats.loading ? "..." : meetingsStats.thisMonth.toString(),
      icon: Calendar,
      description: "Do seu grupo"
    },
    {
      title: "Membros Ativos",
      value: membersCount.toString(),
      icon: TrendingUp,
      description: "No seu grupo"
    },
    {
      title: "Encontros Total",
      value: meetingsStats.loading ? "..." : meetingsStats.total.toString(),
      icon: MapPin,
      description: "Registrados por você"
    }
  ];

  // Co-líderes têm estatísticas limitadas apenas do seu grupo
  const coLiderStats = [
    {
      title: "Meu Grupo",
      value: formatGCName(profile?.grupo_crescimento),
      icon: Users,
      description: "Grupo que você co-lidera"
    },
    {
      title: "Encontros este Mês",
      value: meetingsStats.loading ? "..." : meetingsStats.thisMonth.toString(),
      icon: Calendar,
      description: "Registrados por você"
    },
    {
      title: "Total de Encontros",
      value: meetingsStats.loading ? "..." : meetingsStats.total.toString(),
      icon: TrendingUp,
      description: "Todos os registros"
    },
    {
      title: "Membros",
      value: membersCount.toString(),
      icon: MapPin,
      description: "No seu grupo"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {coLiderStats.map((stat, index) => (
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
        ) : effectiveRole === "leader" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {liderStats.map((stat, index) => (
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
        ) : effectiveRole === "pastor" ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
              onClick={() => onNavigate("meus-relatorios")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Meus Relatórios
                </CardTitle>
                <CardDescription>
                  Relatórios dos grupos sob sua liderança
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximos Encontros
                </CardTitle>
                <CardDescription>
                  Agenda dos seus grupos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Meus Grupos
                </CardTitle>
                <CardDescription>
                  Gerencie seus grupos de crescimento
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : effectiveRole === "pastor" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card">
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

            <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card">
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

            <Card className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card">
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


          </div>
        ) : null}

        {/* Recent Activity - Filtrada por tipo de usuário */}
        {effectiveRole === "pastor" && (
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
          <Card className="mt-8 shadow-soft">
            <CardHeader>
              <CardTitle>Atividade dos Seus Grupos</CardTitle>
              <CardDescription>
                Últimas ações nos grupos sob sua liderança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Encontro registrado - GC Vila Nova</p>
                    <p className="text-xs text-muted-foreground">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo membro - João Silva (GC Jardins)</p>
                    <p className="text-xs text-muted-foreground">Ontem</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Relatório semanal - GC Centro Norte</p>
                    <p className="text-xs text-muted-foreground">2 dias atrás</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem motivacional para co-líderes */}
        {effectiveRole === "co_leader" && (
          <Card className="mt-8 shadow-soft bg-gradient-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Titulo da mensagem</h3>
                <p className="text-muted-foreground">
                  aqui vai algum aviso ou mensagem. Adicionar alguma funcao para trazer publicacoes do insta da igreja (ultimas 3 ou 4)
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}