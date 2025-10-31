import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, UserCheck, Home } from "lucide-react";
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
}

interface GroupInfo {
  gc_code: string;
  gc_name: string;
  location: string | null;
  members_count: number;
  co_leaders: CoLeader[];
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
      const { data: coLeadersData, error: coLeadersError } = await supabase
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

      // Buscar localização do GC (pode vir do perfil do líder ou de uma tabela específica)
      // Por enquanto, vamos usar a localização padrão baseada no nome do GC
      const location = gcNames[profile.grupo_crescimento]?.split(' - ')[1] || 'Não definida';

      setGroupInfo({
        gc_code: profile.grupo_crescimento,
        gc_name: gcNames[profile.grupo_crescimento] || profile.grupo_crescimento,
        location: location,
        members_count: membersData?.length || 0,
        co_leaders: (coLeadersData as CoLeader[]) || [],
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
                          <Badge variant="outline" className="mt-2">
                            Co-líder
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
