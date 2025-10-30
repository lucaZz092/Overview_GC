import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, TrendingUp, MapPin, Plus, Eye, LogOut, Link } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthContext } from "@/contexts/AuthContext";
import { LinkGenerator } from "@/components/LinkGenerator";

interface DashboardProps {
  userType: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onRoleSelect?: (role: string) => void;
}

export function Dashboard({ userType, onNavigate, onLogout, onRoleSelect }: DashboardProps) {
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const { user } = useAuthContext();
  const { profile, loading, isAdmin, isPastor, isLeader } = useUserProfile();

  // Usar o userType escolhido pelo admin, ou o role do perfil se não for admin
  const effectiveRole = (profile?.role === 'admin' && userType) ? userType : profile?.role;

  // Debug para entender o que está acontecendo
  console.log('🔍 Dashboard Debug:');
  console.log('  User Email:', user?.email);
  console.log('  UserType:', userType);
  console.log('  Profile Role:', profile?.role);
  console.log('  Loading:', loading);
  console.log('  Effective Role:', effectiveRole);
  console.log('  Full Profile:', profile);

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
                  onClick={() => {
                    console.log('🎭 Admin escolheu: pastor');
                    onRoleSelect?.('pastor');
                  }}
                  className="w-full bg-gradient-primary text-lg py-6"
                >
                  🙏 Pastor
                </Button>
                
                <Button 
                  onClick={() => {
                    console.log('🎭 Admin escolheu: leader');
                    onRoleSelect?.('leader');
                  }}
                  className="w-full bg-gradient-primary text-lg py-6"
                  variant="outline"
                >
                  👑 Líder
                </Button>
                
                <Button 
                  onClick={() => {
                    console.log('🎭 Admin escolheu: co_leader');
                    onRoleSelect?.('co_leader');
                  }}
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
      title: "Grupos Ativos",
      value: "28",
      icon: Users,
      description: "Grupos de crescimento ativos"
    },
    {
      title: "Encontros este Mês",
      value: "112",
      icon: Calendar,
      description: "Reuniões realizadas"
    },
    {
      title: "Membros Total",
      value: "350",
      icon: TrendingUp,
      description: "Pessoas alcançadas"
    },
    {
      title: "Regiões",
      value: "8",
      icon: MapPin,
      description: "Áreas de atuação"
    }
  ];

  // Estatísticas específicas para líderes e pastores
  const liderStats = [
    {
      title: "Meus Grupos",
      value: "3",
      icon: Users,
      description: "Grupos sob sua liderança"
    },
    {
      title: "Encontros este Mês",
      value: "12",
      icon: Calendar,
      description: "Dos seus grupos"
    },
    {
      title: "Membros Ativos",
      value: "42",
      icon: TrendingUp,
      description: "Nos seus grupos"
    },
    {
      title: "Região Norte",
      value: "1",
      icon: MapPin,
      description: "Área de responsabilidade"
    }
  ];

  // Co-líderes têm estatísticas limitadas apenas do seu grupo
  const coLiderStats = [
    {
      title: "Meu Grupo",
      value: "GC Vila Nova",
      icon: Users,
      description: "Grupo que você co-lidera"
    },
    {
      title: "Encontros Registrados",
      value: "8",
      icon: Calendar,
      description: "Este mês"
    }
  ];

  // Se deve mostrar o gerador de links
  if (showLinkGenerator) {
    return <LinkGenerator onBack={() => setShowLinkGenerator(false)} />;
  }

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
            <span className="text-white/80 text-sm">{user?.email}</span>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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

            <Card 
              className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer bg-gradient-card"
              onClick={() => setShowLinkGenerator(true)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  Links de Convite
                </CardTitle>
                <CardDescription>
                  Gere links temporários para novos usuários
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