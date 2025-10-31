import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Users } from "lucide-react";
import { Footer } from "@/components/Footer";

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
  
  const { signUp } = useAuth();



  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !password || !userType) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if ((userType === 'co_leader' || userType === 'leader') && !userGC) {
      toast({
        title: "Erro",
        description: "Selecione o Grupo de Crescimento que você " + 
                    (userType === 'co_leader' ? 'co-lidera' : 'lidera'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const authResult = await signUp(email, password);
      
      if (!authResult || !authResult.user) {
        throw new Error('Erro ao criar usuário');
      }

      const updateData: any = {
        name: nome,
        role: userType,
      };

      if ((userType === 'co_leader' || userType === 'leader') && userGC) {
        updateData.grupo_crescimento = userGC;
      }

      const { error: profileError } = await (supabase
        .from('users') as any)
        .update(updateData)
        .eq('id', authResult.user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
      }

      toast({
        title: "Cadastro realizado!",
        description: "Sua conta foi criada com sucesso. Faça login para acessar o sistema.",
      });

      onRegister(userType);
      
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

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            GC Overview
          </h1>
          <p className="text-white/80">
            Cadastre-se para acessar o sistema de Grupos de Crescimento
          </p>
        </div>

        <Card className="shadow-strong border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <Users className="h-6 w-6 mr-2" />
              Registrar
            </CardTitle>
            <CardDescription>
              Crie sua conta para gerenciar os grupos de crescimento
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
                  required
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Usuário</Label>
                <Select value={userType} onValueChange={setUserType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co_leader">Co-líder</SelectItem>
                    <SelectItem value="leader">Líder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(userType === 'co_leader' || userType === 'leader') && (
                <div className="space-y-2">
                  <Label htmlFor="userGC">
                    {userType === 'co_leader' 
                      ? 'Selecione o GC que você co-lidera' 
                      : 'Selecione o GC que você lidera'}
                  </Label>
                  <Select value={userGC} onValueChange={setUserGC} required>
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary hover:scale-105 transition-all duration-200 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  ✨ Cadastro direto no sistema
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pastores: contate o administrador para criação da conta
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        <Footer />
      </div>
    </div>
  );
}