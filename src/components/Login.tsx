import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";


interface LoginProps {
  onLogin: (userType: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { user } = await signIn(email, password);
      
      // Verificar se é admin
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar role do usuário:', error);
      }

      const userRole = userData?.role || 'co_leader';
      
      console.log('🔍 Login Debug:');
      console.log('  User Role from DB:', userRole);
      console.log('  Is Admin?', userRole === 'admin');
      console.log('  UserData:', userData);
      
      // FORÇAR exibição da tela de admin para teste
      if (user?.email === 'lucacampeao2013@gmail.com') {
        console.log('🔴 FORÇANDO tela de admin para teste');
        setIsAdmin(true);
        setShowRoleSelection(true);
        setLoading(false);
        return;
      }
      
      if (userRole === 'admin') {
        console.log('✅ Usuário é admin - mostrando seleção de papel');
        setIsAdmin(true);
        setShowRoleSelection(true);
        setLoading(false);
        return;
      }

      console.log('📝 Login normal - não é admin');
      toast({
        title: "Login realizado!",
        description: `Bem-vindo, ${user?.email}!`,
      });
      
      onLogin(userRole);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = "Credenciais inválidas";
      
      if (error.message?.includes('email not confirmed')) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada (inclusive spam).";
        setShowResendConfirmation(true);
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email ou senha incorretos";
        setShowResendConfirmation(false);
      } else if (error.message) {
        errorMessage = error.message;
        setShowResendConfirmation(false);
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast({
        title: "Erro",
        description: "Selecione um papel para continuar",
        variant: "destructive",
      });
      return;
    }

    console.log('🎭 Admin escolheu papel:', selectedRole);

    toast({
      title: "Login realizado!",
      description: `Entrando como ${getRoleDisplayName(selectedRole)}`,
    });
    
    onLogin(selectedRole);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'pastor': return 'Pastor';
      case 'leader': return 'Líder';
      case 'co_leader': return 'Co-Líder';
      default: return role;
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Digite seu email primeiro",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada",
      });
      setShowResendConfirmation(false);
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debug do estado da tela
  console.log('🖥️ Login Screen State:', {
    showRoleSelection,
    isAdmin,
    selectedRole,
    loading
  });

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            GC Overview
          </h1>
          <p className="text-white/80">
            Sistema de Gestão de Grupos de Crescimento
          </p>
        </div>

        <Card className="shadow-strong border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {showRoleSelection ? 'Escolha seu Papel' : 'Entrar'}
            </CardTitle>
            <CardDescription>
              {showRoleSelection 
                ? 'Como administrador, selecione o papel para esta sessão'
                : 'Acesse sua conta para gerenciar os grupos de crescimento'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showRoleSelection ? (
              <form onSubmit={handleLogin} className="space-y-4">
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
                    placeholder="Sua senha"
                  />
                </div>

                <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-primary ..." 
                      disabled={loading}
                    >
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => navigate("/registro")} 
                      className="flex-1 bg-gradient-primary ..."
                      disabled={loading}
                    >
                      Registrar
                    </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-green-700">
                    👋 Bem-vindo, Administrador!
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Escolha o papel que deseja usar nesta sessão
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Selecione seu papel</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pastor">🙏 Pastor</SelectItem>
                      <SelectItem value="leader">👑 Líder</SelectItem>
                      <SelectItem value="co_leader">🤝 Co-Líder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setShowRoleSelection(false);
                      setSelectedRole("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleRoleSelection}
                    className="flex-1 bg-gradient-primary ..."
                    disabled={!selectedRole}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {showResendConfirmation && !showRoleSelection && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  Não recebeu o email de confirmação?
                </p>
                <Button 
                  type="button"
                  onClick={handleResendConfirmation}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  disabled={loading}
                >
                  {loading ? "Reenviando..." : "Reenviar Email de Confirmação"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}