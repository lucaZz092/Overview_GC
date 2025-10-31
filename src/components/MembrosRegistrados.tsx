import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Phone, Mail, MapPin, Calendar } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  is_active: boolean;
  joined_date: string;
  notes: string | null;
  created_at: string;
}

interface MembrosRegistradosProps {
  onBack: () => void;
}

// Função para extrair o grupo das notas (temporário até termos o campo grupo_crescimento)
const extractGroupFromNotes = (notes: string | null): string => {
  if (!notes) return "Não especificado";
  const groupMatch = notes.match(/Grupo:\s*([^,]+)/);
  return groupMatch ? groupMatch[1].trim() : "Não especificado";
};

// Modal de detalhes do membro
const MemberDetailsModal: React.FC<{
  member: Member | null;
  onClose: () => void;
  onToggleStatus: (member: Member) => void;
}> = ({ member, onClose, onToggleStatus }) => {
  if (!member) return null;
  
  const group = extractGroupFromNotes(member.notes);
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{member.name}</h2>
        
        <div className="space-y-3 mb-4">
          {member.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{member.email}</span>
            </div>
          )}
          
          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{member.phone}</span>
            </div>
          )}
          
          {member.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{member.address}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Ingressou em: {new Date(member.joined_date).toLocaleDateString('pt-BR')}</span>
          </div>
          
          <div>
            <strong>Grupo:</strong> {group}
          </div>
          
          <div>
            <strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {member.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          
          {member.notes && (
            <div>
              <strong>Observações:</strong>
              <p className="text-sm text-muted-foreground mt-1">{member.notes}</p>
            </div>
          )}
        </div>
        
        <Button 
          variant={member.is_active ? "destructive" : "default"}
          className="w-full"
          onClick={() => onToggleStatus(member)}
        >
          {member.is_active ? 'Inativar Membro' : 'Ativar Membro'}
        </Button>
      </div>
    </div>
  );
};

export const MembrosRegistrados: React.FC<MembrosRegistradosProps> = ({ onBack }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  // Carregar membros do Supabase
  const loadMembers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar membros:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar membros",
          variant: "destructive",
        });
        return;
      }


      setMembers(data || []);
      
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Problema ao carregar membros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Alternar status do membro (ativo/inativo)
  const handleToggleStatus = async (member: Member) => {
    try {
      const newStatus = !member.is_active;
      
      const { error } = await (supabase
        .from('members') as any)
        .update({ is_active: newStatus })
        .eq('id', member.id);

      if (error) {
        console.error('❌ Erro ao alterar status:', error);
        toast({
          title: "Erro",
          description: "Falha ao alterar status do membro",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status alterado!",
        description: `${member.name} foi ${newStatus ? 'ativado' : 'inativado'} com sucesso.`,
      });

      // Recarregar membros
      await loadMembers();
      setSelectedMember(null);
      
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Problema ao alterar status",
        variant: "destructive",
      });
    }
  };

  // Carregar membros quando o componente for montado
  useEffect(() => {
    if (user) {
      loadMembers();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando membros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Membros do Grupo de Crescimento</h1>
        </div>
        <div className="container mx-auto px-4 pb-2">
          <p className="text-white/80">
            {members.length > 0 
              ? `${members.length} membro${members.length !== 1 ? 's' : ''} cadastrado${members.length !== 1 ? 's' : ''}`
              : 'Nenhum membro cadastrado ainda'
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhum membro cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece cadastrando o primeiro membro do seu grupo de crescimento.
            </p>
            <Button onClick={onBack} variant="outline">
              Voltar ao Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => {
              const group = extractGroupFromNotes(member.notes);
              return (
                <Card key={member.id} className="shadow-soft hover:shadow-strong transition-all duration-200">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {member.email || member.phone || 'Sem contato'}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div>
                        <span className="font-semibold">Grupo:</span> {group}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Desde: {new Date(member.joined_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedMember(member)}
                    >
                      Visualizar Detalhes
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <MemberDetailsModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}