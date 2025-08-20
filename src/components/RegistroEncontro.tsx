import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ArrowLeft, Users, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RegistroEncontroProps {
  onBack: () => void;
}

export function RegistroEncontro({ onBack }: RegistroEncontroProps) {
  const [formData, setFormData] = useState({
    data: "",
    horario: "",
    local: "",
    lider: "",
    tema: "",
    presentes: "",
    observacoes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data || !formData.horario || !formData.local || !formData.lider) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Encontro registrado!",
      description: "O encontro foi salvo com sucesso.",
    });

    // Reset form
    setFormData({
      data: "",
      horario: "",
      local: "",
      lider: "",
      tema: "",
      presentes: "",
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
            <h1 className="text-2xl font-bold text-white">Registrar Encontro</h1>
            <p className="text-white/80">Adicione um novo encontro do grupo de crescimento</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Dados do Encontro
              </CardTitle>
              <CardDescription>
                Preencha as informações do encontro realizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data do Encontro *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => handleChange("data", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="horario">Horário *</Label>
                    <Input
                      id="horario"
                      type="time"
                      value={formData.horario}
                      onChange={(e) => handleChange("horario", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local">Local *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="local"
                      className="pl-10"
                      value={formData.local}
                      onChange={(e) => handleChange("local", e.target.value)}
                      placeholder="Endereço onde foi realizado o encontro"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lider">Líder Responsável *</Label>
                  <Select value={formData.lider} onValueChange={(value) => handleChange("lider", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o líder responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joao-silva">João Silva</SelectItem>
                      <SelectItem value="maria-santos">Maria Santos</SelectItem>
                      <SelectItem value="pedro-oliveira">Pedro Oliveira</SelectItem>
                      <SelectItem value="ana-costa">Ana Costa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tema">Tema da Reunião</Label>
                  <Input
                    id="tema"
                    value={formData.tema}
                    onChange={(e) => handleChange("tema", e.target.value)}
                    placeholder="Ex: A importância da oração"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presentes">Número de Presentes</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="presentes"
                      type="number"
                      className="pl-10"
                      value={formData.presentes}
                      onChange={(e) => handleChange("presentes", e.target.value)}
                      placeholder="Quantas pessoas participaram"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleChange("observacoes", e.target.value)}
                    placeholder="Adicione observações sobre o encontro..."
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
                    Salvar Encontro
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