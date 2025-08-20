import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";


interface RegistroProps {
  onRegister: (userType: string) => void;
}

export function RegistroUser({ onRegister }: RegistroProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userGC, setUserGC] = useState("")
  const [userType, setUserType] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !password || !userGC || !userType) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    // Simulação de registro
    toast({
      title: "Cadastro realizado!",
      description: `Bem-vindo, ${nome}!`,
    });

    onRegister(userType);
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
            <CardTitle className="text-2xl">Registrar</CardTitle>
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
              
              <div className="space-y-2">
                <Label htmlFor="userType">Selecione o seu GC</Label>
                <Select value={userGC} onValueChange={setUserGC}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gc-faith">GC Legacy Faith</SelectItem>
                    <SelectItem value="gc-awake">GC Legacy Awake</SelectItem>
                    <SelectItem value="gc-kairos">GC Legacy Kairós</SelectItem>
                    <SelectItem value="gc-revival">GC Legacy Revival</SelectItem>
                    <SelectItem value="gc-chosen">GC Legacy Chosen</SelectItem>
                    <SelectItem value="gc-overflow">GC Legacy Overflow</SelectItem>
                    <SelectItem value="gc-rise">GC Legacy Rise</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
              >
                Registrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}