import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Copy, Plus, Clock, Users, ArrowLeft, ExternalLink } from 'lucide-react';

interface InvitationCode {
  id: string;
  code: string;
  role: 'pastor' | 'leader' | 'co_leader';
  created_at: string;
  expires_at: string;
  used_by: string | null;
  used_at: string | null;
  is_active: boolean;
  description: string | null;
  max_uses: number;
  current_uses: number;
}

interface LinkGeneratorProps {
  onBack: () => void;
}

export function LinkGenerator({ onBack }: LinkGeneratorProps) {
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchCodes();
    // Auto-refresh a cada 30 segundos para mostrar expiração
    const interval = setInterval(fetchCodes, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCodes(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar códigos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async (role: 'pastor' | 'leader' | 'co_leader') => {
    setGenerating(role);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar código único
      const code = `${role.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

      const { data, error } = await supabase
        .from('invitation_codes')
        .insert([{
          code,
          role,
          description: `Link temporário para ${role} (expira em 30min)`,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          max_uses: 1,
          current_uses: 0,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Copiar link automaticamente
      const link = `${window.location.origin}/registro?code=${code}`;
      await navigator.clipboard.writeText(link);

      toast({
        title: 'Link gerado com sucesso!',
        description: `Link copiado para a área de transferência. Válido por 30 minutos.`,
      });

      fetchCodes();
    } catch (error: any) {
      console.error('Erro ao gerar link:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível gerar o link',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/registro?code=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copiado!',
      description: 'Link copiado para a área de transferência',
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pastor':
        return <Badge variant="destructive">🙏 Pastor</Badge>;
      case 'leader':
        return <Badge variant="default">👑 Líder</Badge>;
      case 'co_leader':
        return <Badge variant="secondary">🤝 Co-Líder</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (code: InvitationCode) => {
    const now = new Date();
    const expiresAt = new Date(code.expires_at);
    const isExpired = expiresAt < now;
    const isUsed = code.current_uses >= code.max_uses;

    if (isUsed) {
      return <Badge variant="outline">✅ Utilizado</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive">⏰ Expirado</Badge>;
    }
    
    // Calcular tempo restante
    const timeLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
    if (timeLeft < 5) {
      return <Badge variant="destructive">⚠️ {timeLeft}min</Badge>;
    }
    if (timeLeft < 15) {
      return <Badge variant="outline">⏰ {timeLeft}min</Badge>;
    }
    return <Badge variant="default">🟢 {timeLeft}min</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Links de Convite</h1>
              <p className="text-white/80">Gere links temporários para novos usuários</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Botões para Gerar Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🙏</span>
                </div>
                <h3 className="text-lg font-semibold">Pastor</h3>
                <p className="text-sm text-gray-600">Acesso completo ao sistema</p>
              </div>
              <Button 
                onClick={() => generateLink('pastor')}
                disabled={generating === 'pastor'}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {generating === 'pastor' ? 'Gerando...' : 'Gerar Link'}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👑</span>
                </div>
                <h3 className="text-lg font-semibold">Líder</h3>
                <p className="text-sm text-gray-600">Gerencia grupos e relatórios</p>
              </div>
              <Button 
                onClick={() => generateLink('leader')}
                disabled={generating === 'leader'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {generating === 'leader' ? 'Gerando...' : 'Gerar Link'}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold">Co-Líder</h3>
                <p className="text-sm text-gray-600">Auxilia na gestão do grupo</p>
              </div>
              <Button 
                onClick={() => generateLink('co_leader')}
                disabled={generating === 'co_leader'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {generating === 'co_leader' ? 'Gerando...' : 'Gerar Link'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Links Gerados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Links Recentes (últimos 50)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {codes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ExternalLink className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum link gerado ainda.</p>
                <p className="text-sm">Clique nos botões acima para gerar links de convite.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {codes.map((code) => (
                  <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getRoleBadge(code.role)}
                        {getStatusBadge(code)}
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Criado: {formatDate(code.created_at)}</p>
                        <p>Expira: {formatDate(code.expires_at)}</p>
                        <p>Código: {code.code}</p>
                        {code.used_at && (
                          <p className="text-green-600">Usado: {formatDate(code.used_at)}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {code.current_uses < code.max_uses && new Date(code.expires_at) > new Date() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(code.code)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Como funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>Clique em "Gerar Link"</strong> para criar um convite para o papel desejado</p>
            <p>• <strong>Link é copiado automaticamente</strong> para sua área de transferência</p>
            <p>• <strong>Compartilhe o link</strong> com a pessoa que deve se registrar</p>
            <p>• <strong>Links expiram em 30 minutos</strong> por segurança</p>
            <p>• <strong>Cada link pode ser usado apenas uma vez</strong></p>
            <p>• <strong>Pessoa registra automaticamente</strong> com o papel correto</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}