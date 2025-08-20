import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RegistroMembroProps {
  onBack: () => void;
}

export function RegistroMembro({ onBack }: RegistroMembroProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    grupo: "",
    dataNascimento: "",
    estadoCivil: "",
    observacoes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone || !formData.grupo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Membro cadastrado!",
      description: "O membro foi adicionado com sucesso.",
    });

    // Reset form
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      grupo: "",
      dataNascimento: "",
      estadoCivil: "",
      observacoes: ""
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Cadastrar Membro</h1>
            <p className="text-white/80">Adicione um novo membro ao grupo de crescimento</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Dados do Membro
              </CardTitle>
              <CardDescription>
                Preencha as informações do novo membro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    placeholder="Digite o nome completo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefone"
                        className="pl-10"
                        value={formData.telefone}
                        onChange={(e) => handleChange("telefone", e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endereco"
                      className="pl-10"
                      value={formData.endereco}
                      onChange={(e) => handleChange("endereco", e.target.value)}
                      placeholder="Rua, número, bairro, cidade"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grupo">Grupo de Crescimento *</Label>
                  <Select value={formData.grupo} onValueChange={(value) => handleChange("grupo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vila-nova">GC Vila Nova</SelectItem>
                      <SelectItem value="centro">GC Centro</SelectItem>
                      <SelectItem value="jardim-america">GC Jardim América</SelectItem>
                      <SelectItem value="santa-cruz">GC Santa Cruz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => handleChange("dataNascimento", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estadoCivil">Estado Civil</Label>
                    <Select value={formData.estadoCivil} onValueChange={(value) => handleChange("estadoCivil", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleChange("observacoes", e.target.value)}
                    placeholder="Informações adicionais sobre o membro..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onBack}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-200 shadow-soft"
                  >
                    Cadastrar Membro
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}