import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ExternalLink, Clock, CheckCircle } from "lucide-react";

interface RegistroProps {
  onRegister: (userType: string) => void;
}

export function RegistroUser({ onRegister }: RegistroProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userGC, setUserGC] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeInfo, setCodeInfo] = useState<any>(null);
  const [codeLoading, setCodeLoading] = useState(true);
  
  const { signUp } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  useEffect(() => {
    if (code) {
      validateCode(code);
    } else {
      setCodeLoading(false);
    }
  }, [code]);

  const validateCode = async (codeValue: string) => {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', codeValue)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Código inválido",
          description: "O link de convite é inválido ou já foi utilizado.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se não expirou
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (expiresAt < now) {
        toast({
          title: "Código expirado",
          description: "O link de convite expirou. Solicite um novo link.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se não excedeu o número de usos
      if (data.current_uses >= data.max_uses) {
        toast({
          title: "Código já utilizado",
          description: "Este link de convite já foi utilizado o número máximo de vezes.",
          variant: "destructive",
        });
        return;
      }

      // Código válido
      setCodeInfo(data);
      setUserType(data.role);
      
      toast({
        title: "Link válido!",
        description: `Você será registrado como ${getRoleDisplayName(data.role)}.`,
      });
    } catch (error: any) {
      console.error('Erro ao validar código:', error);
      toast({
        title: "Erro",
        description: "Não foi possível validar o link de convite.",
        variant: "destructive",
      });
    } finally {
      setCodeLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'pastor': return 'Pastor';
      case 'leader': return 'Líder';
      case 'co_leader': return 'Co-Líder';
      default: return role;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pastor':
        return <Badge variant="destructive" className="ml-2">🙏 Pastor</Badge>;
      case 'leader':
        return <Badge variant="default" className="ml-2">👑 Líder</Badge>;
      case 'co_leader':
        return <Badge variant="secondary" className="ml-2">🤝 Co-Líder</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">{role}</Badge>;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!nome || !email || !password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!code && !userType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de usuário",
        variant: "destructive",
      });
      return;
    }

    // Validar GC para co-líderes e líderes
    const currentRole = code ? codeInfo?.role : userType;
    if ((currentRole === 'co_leader' || currentRole === 'leader') && !userGC) {
      toast({
        title: "Erro",
        description: "Selecione o Grupo de Crescimento que você " + 
                    (currentRole === 'co_leader' ? 'co-lidera' : 'lidera'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Registrar no Supabase Auth
      const authResult = await signUp(email, password);
      
      if (!authResult || !authResult.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Se tem código, processar o código
      let finalRole = userType;
      if (code && codeInfo) {
        // Incrementar uso do código
        const { error: updateError } = await supabase
          .from('invitation_codes')
          .update({
            current_uses: codeInfo.current_uses + 1,
            used_by: authResult.user.id,
            used_at: new Date().toISOString()
          })
          .eq('id', codeInfo.id);

        if (updateError) {
          throw new Error('Erro ao processar código de convite: ' + updateError.message);
        }

        finalRole = codeInfo.role;
      }

      // Atualizar perfil do usuário
      const updateData: any = {
        name: nome,
        role: finalRole,
      };

      // Adicionar grupo_crescimento apenas para co-líderes e líderes
      if ((finalRole === 'co_leader' || finalRole === 'leader') && userGC) {
        updateData.grupo_crescimento = userGC;
      }

      const { error: profileError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', authResult.user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        // Não falhar o registro por causa do perfil
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Bem-vindo, ${nome}! Verifique seu email para ativar a conta.`,
      });

      // Aguardar um pouco antes de redirecionar
      setTimeout(() => {
        onRegister(finalRole);
      }, 2000);

    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (codeLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Validando link de convite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            GC Overview
          </h1>
          <p className="text-white/80">
            {code ? 'Complete seu cadastro através do convite' : 'Cadastre-se para acessar o sistema de Grupos de Crescimento'}
          </p>
        </div>

        {/* Code Info Card */}
        {codeInfo && (
          <Card className="shadow-strong border-0 bg-green-50/95 backdrop-blur-sm mb-4">
            <CardContent className="pt-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Link de convite válido</span>
                {getRoleBadge(codeInfo.role)}
              </div>
              <div className="text-center mt-2 text-sm text-green-700">
                <Clock className="h-4 w-4 inline mr-1" />
                Expira em: {new Date(codeInfo.expires_at).toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-strong border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              {code ? <ExternalLink className="h-6 w-6 mr-2" /> : null}
              Registrar
            </CardTitle>
            <CardDescription>
              {code ? 'Complete os dados para finalizar seu cadastro' : 'Crie sua conta para gerenciar os grupos de crescimento'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua melhor senha"
                />
              </div>

              {!code && (
                <div className="space-y-2">
                  <Label htmlFor="userType">Tipo de Usuário</Label>
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="co_leader">Co-líder</SelectItem>
                      <SelectItem value="leader">Líder</SelectItem>
                      <SelectItem value="pastor">Pastor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Campo de GC só aparece para co-líderes e líderes */}
              {((code && codeInfo && (codeInfo.role === 'co_leader' || codeInfo.role === 'leader')) || 
                (!code && (userType === 'co_leader' || userType === 'leader'))) && (
                <div className="space-y-2">
                  <Label htmlFor="userGC">
                    {userType === 'co_leader' || (codeInfo && codeInfo.role === 'co_leader') 
                      ? 'Selecione o GC que você co-lidera' 
                      : 'Selecione o GC que você lidera'}
                  </Label>
                  <Select value={userGC} onValueChange={setUserGC}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha seu Grupo de Crescimento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gc-legacy-faith">GC Legacy Faith</SelectItem>
                      <SelectItem value="gc-legacy-awake">GC Legacy Awake</SelectItem>
                      <SelectItem value="gc-legacy-kairos">GC Legacy Kairós</SelectItem>
                      <SelectItem value="gc-legacy-revival">GC Legacy Revival</SelectItem>
                      <SelectItem value="gc-legacy-chosen">GC Legacy Chosen</SelectItem>
                      <SelectItem value="gc-legacy-overflow">GC Legacy Overflow</SelectItem>
                      <SelectItem value="gc-legacy-rise">GC Legacy Rise</SelectItem>
                      <SelectItem value="gc-vila-nova">GC Vila Nova</SelectItem>
                      <SelectItem value="gc-centro">GC Centro</SelectItem>
                      <SelectItem value="gc-norte">GC Norte</SelectItem>
                      <SelectItem value="gc-sul">GC Sul</SelectItem>
                      <SelectItem value="gc-leste">GC Leste</SelectItem>
                      <SelectItem value="gc-oeste">GC Oeste</SelectItem>
                      <SelectItem value="gc-juventude">GC Juventude</SelectItem>
                      <SelectItem value="gc-casais">GC Casais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {code && codeInfo && (
                <div className="space-y-2">
                  <Label htmlFor="userType">Tipo de Usuário</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Você será registrado como:</span>
                      {getRoleBadge(codeInfo.role)}
                    </div>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary hover:scale-105 transition-all duration-200 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>

              {code && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    ⚡ Cadastro via link de convite
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}