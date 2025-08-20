import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";


interface LoginProps {
  onLogin: (userType: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !userType) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    // Simulação de login
    toast({
      title: "Login realizado!",
      description: `Bem-vindo, ${userType}!`,
    });
    
    onLogin(userType);
  };

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
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar os grupos de crescimento
            </CardDescription>
          </CardHeader>
          <CardContent>
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

              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Usuário</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co-lider">Co-líder</SelectItem>
                    <SelectItem value="lider">Líder</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-gradient-primary ...">
                    Entrar
                  </Button>
                  <Button onClick={() => navigate("/registro")} className="flex-1 bg-gradient-primary ...">
                    Registrar
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}