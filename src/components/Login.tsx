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
import BlurText from "@/components/ui/blur-text";
import TextType from "@/components/ui/text-type";


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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
        .single() as { data: { role: string } | null; error: any };

      if (error || !userData) {
        console.error('Erro ao buscar role do usuário:', error);
        setLoading(false);
        return;
      }

      const userRole = userData.role || 'co_leader';
      
      if (userRole === 'admin') {
        setShowRoleSelection(true);
        return;
      }

      // Login normal para não-admins
      onLogin(userRole || 'co_leader');
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

  const handleForgotPassword = async () => {
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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


  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BlurText
            text="GC Overview"
            delay={100}
            animateBy="words"
            direction="top"
            className="text-4xl font-bold text-white mb-2 justify-center"
          />
          <TextType 
            text={["Sistema de Gestão", "Grupos de Crescimento", "Bem-vindo!"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-white/80 text-lg min-h-[28px]"
          />
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

                <div className="space-y-3">
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
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
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

            {showForgotPassword && !showRoleSelection && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  Digite seu email para receber um link de redefinição de senha
                </p>
                <Button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar Email de Redefinição"}
                </Button>
                <Button 
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  variant="outline"
                  className="w-full mt-2"
                  disabled={loading}
                >
                  Cancelar
                </Button>
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