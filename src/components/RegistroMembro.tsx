import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

interface RegistroMembroProps {
  onBack: () => void;
}

export function RegistroMembro({ onBack }: RegistroMembroProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    dataNascimento: "",
    estadoCivil: "",
    observacoes: ""
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const { profile } = useUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (nome e telefone)",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar um membro",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.grupo_crescimento) {
      toast({
        title: "Erro",
        description: "Seu perfil precisa ter um grupo de crescimento associado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Preparar os dados do membro para inserção
      const memberData = {
        name: formData.nome,
        email: formData.email || null,
        phone: formData.telefone,
        birth_date: formData.dataNascimento || null,
        address: formData.endereco || null,
        joined_date: new Date().toISOString().split('T')[0], // Data atual
        notes: `Grupo: ${profile.grupo_crescimento}${formData.estadoCivil ? `, Estado Civil: ${formData.estadoCivil}` : ''}${formData.observacoes ? `, Observações: ${formData.observacoes}` : ''}`,
        user_id: user.id,
        is_active: true
      };



      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select();

      if (error) {
        console.error('❌ Erro ao cadastrar membro:', error);
        toast({
          title: "Erro ao cadastrar",
          description: `Falha ao salvar membro: ${error.message}`,
          variant: "destructive",
        });
        return;
      }



      toast({
        title: "Membro cadastrado!",
        description: `${formData.nome} foi adicionado com sucesso ao ${profile.grupo_crescimento}.`,
      });

      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        dataNascimento: "",
        estadoCivil: "",
        observacoes: ""
      });

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um problema ao cadastrar o membro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            <p className="text-white/80">
              Adicione um novo membro ao {profile?.grupo_crescimento || "seu grupo de crescimento"}
            </p>
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
                Preencha as informações do novo membro. O grupo será automaticamente definido como {profile?.grupo_crescimento || "seu GC"}.
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
                  <Label>Grupo de Crescimento</Label>
                  <div className="p-3 bg-muted/50 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {profile?.grupo_crescimento || "Carregando..."}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      O membro será automaticamente associado ao seu grupo
                    </p>
                  </div>
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
                    disabled={loading}
                  >
                    {loading ? "Cadastrando..." : "Cadastrar Membro"}
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