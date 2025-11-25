import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, Users, MapPin, X, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

interface RegistroEncontroProps {
  onBack: () => void;
}

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export function RegistroEncontro({ onBack }: RegistroEncontroProps) {
  const [formData, setFormData] = useState({
    data: "",
    local: "",
    lider: "",
    tema: "",
    presentes: "",
    observacoes: ""
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const { profile } = useUserProfile();
  const [leaders, setLeaders] = useState<{ id: string; name: string | null }[]>([]);
  const [leadersLoading, setLeadersLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [openMembersCombobox, setOpenMembersCombobox] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    const loadLeaders = async () => {
      if (!profile?.grupo_crescimento) {
        if (profile) {
          setLeaders([{ id: profile.id, name: profile.name || 'Líder' }]);
          setFormData((prev) => (prev.lider ? prev : { ...prev, lider: profile.id }));
        } else {
          setLeaders([]);
        }
        return;
      }

      setLeadersLoading(true);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role')
          .eq('grupo_crescimento', profile.grupo_crescimento)
          .in('role', ['leader', 'pastor']);

        if (error) {
          throw error;
        }

        const normalized = (data || []).filter(Boolean) as { id: string; name: string | null }[];

        if (normalized.length === 0) {
          const fallbackName = profile.name || 'Líder não informado';
          setLeaders([{ id: profile.id, name: fallbackName }]);
          setFormData((prev) => (prev.lider ? prev : { ...prev, lider: profile.id }));
          return;
        }

        setLeaders(normalized);
        setFormData((prev) => (prev.lider ? prev : { ...prev, lider: normalized[0]?.id || '' }));
      } catch (error: any) {
        console.error('Erro ao carregar líderes do GC:', error);
        toast({
          title: 'Não foi possível carregar os líderes',
          description: error.message || 'Tente novamente mais tarde.',
          variant: 'destructive',
        });

        if (profile) {
          setLeaders([{ id: profile.id, name: profile.name || 'Líder' }]);
          setFormData((prev) => (prev.lider ? prev : { ...prev, lider: profile.id }));
        }
      } finally {
        setLeadersLoading(false);
      }
    };

    loadLeaders();
  }, [profile]);

  // Carregar membros ativos
  useEffect(() => {
    const loadMembers = async () => {
      if (!profile?.grupo_crescimento) return;

      setMembersLoading(true);

      try {
        const { data, error } = await supabase
          .from('members')
          .select('id, name, email, phone, is_active')
          .eq('gc_code', profile.grupo_crescimento)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        setMembers(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar membros:', error);
        toast({
          title: 'Erro ao carregar membros',
          description: error.message || 'Não foi possível carregar a lista de membros.',
          variant: 'destructive',
        });
      } finally {
        setMembersLoading(false);
      }
    };

    loadMembers();
  }, [profile]);

  const selectedLeaderName = useMemo(() => {
    const found = leaders.find((leader) => leader.id === formData.lider);
    return found?.name || '';
  }, [leaders, formData.lider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data || !formData.local || !formData.lider) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para registrar um encontro",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Usar o início do dia selecionado como referência do encontro
      const dateTime = new Date(formData.data);

      if (!selectedLeaderName) {
        toast({
          title: "Selecione o líder responsável",
          description: "É necessário informar o líder responsável pelo encontro.",
          variant: "destructive",
        });
        return;
      }
      
      // Inserir o encontro na tabela meetings
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title: formData.tema || `Encontro do dia ${new Date(formData.data).toLocaleDateString('pt-BR')}`,
          description: formData.observacoes || null,
          date: dateTime.toISOString(),
          location: formData.local,
          attendance_count: selectedMembers.length || (formData.presentes ? parseInt(formData.presentes) : 0),
          notes: `Líder: ${selectedLeaderName}`,
          user_id: user.id
        } as any)
        .select()
        .single();

      if (meetingError) {
        console.error('Erro ao salvar encontro:', meetingError);
        throw new Error(meetingError.message);
      }

      // Inserir presenças dos membros selecionados
      if (selectedMembers.length > 0 && meetingData) {
        const attendances = selectedMembers.map(memberId => ({
          meeting_id: (meetingData as any).id,
          member_id: memberId,
          was_present: true
        }));

        const { error: attendanceError } = await supabase
          .from('meeting_attendances')
          .insert(attendances as any);

        if (attendanceError) {
          console.error('Erro ao salvar presenças:', attendanceError);
          // Não bloqueia o fluxo, apenas avisa
          toast({
            title: "Atenção",
            description: "Encontro salvo, mas houve erro ao registrar algumas presenças.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Encontro registrado!",
        description: `Encontro salvo com ${selectedMembers.length} presença(s) registrada(s)!`,
      });

      // Reset form
      setFormData({
        data: "",
        local: "",
        lider: leaders[0]?.id || "",
        tema: "",
        presentes: "",
        observacoes: ""
      });
      setSelectedMembers([]);
      
    } catch (error: any) {
      console.error('Erro ao registrar encontro:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o encontro. Tente novamente.",
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
                  <Select
                    value={formData.lider}
                    onValueChange={(value) => handleChange("lider", value)}
                    disabled={leadersLoading || leaders.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={leadersLoading ? "Carregando líderes..." : "Selecione o líder responsável"} />
                    </SelectTrigger>
                    <SelectContent>
                      {leaders.map((leader) => (
                        <SelectItem key={leader.id} value={leader.id}>
                          {leader.name || 'Líder sem nome'}
                        </SelectItem>
                      ))}
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
                  <Label>Membros Presentes</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione os membros que participaram do encontro
                  </p>
                  <Popover open={openMembersCombobox} onOpenChange={setOpenMembersCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMembersCombobox}
                        className="w-full justify-between"
                        disabled={membersLoading || members.length === 0}
                      >
                        {membersLoading ? (
                          "Carregando membros..."
                        ) : members.length === 0 ? (
                          "Nenhum membro ativo cadastrado"
                        ) : selectedMembers.length > 0 ? (
                          `${selectedMembers.length} membro(s) selecionado(s)`
                        ) : (
                          "Selecionar membros"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar membro..." />
                        <CommandList>
                          <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                          <CommandGroup>
                            {members.map((member) => {
                              const isSelected = selectedMembers.includes(member.id);
                              return (
                                <CommandItem
                                  key={member.id}
                                  value={member.name}
                                  onSelect={() => {
                                    setSelectedMembers(prev =>
                                      isSelected
                                        ? prev.filter(id => id !== member.id)
                                        : [...prev, member.id]
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {member.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMembers.map(memberId => {
                        const member = members.find(m => m.id === memberId);
                        return member ? (
                          <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                            {member.name}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => setSelectedMembers(prev => prev.filter(id => id !== memberId))}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presentes">Número de Presentes (se não selecionou membros)</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="presentes"
                      type="number"
                      className="pl-10"
                      value={formData.presentes}
                      onChange={(e) => handleChange("presentes", e.target.value)}
                      placeholder="Quantas pessoas participaram"
                      disabled={selectedMembers.length > 0}
                    />
                  </div>
                  {selectedMembers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      O número de presentes será calculado automaticamente pelos membros selecionados
                    </p>
                  )}
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
                    disabled={loading}
                    className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-200 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Salvando...' : 'Salvar Encontro'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  );
}