import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";

interface Member {
  id: string;
  nome: string;
  email: string;
  grupo: string;
  status: string;
}

interface MembrosRegistradosProps {
  onBack: () => void;
}

const mockMembers: Member[] = [
  { id: "1", nome: "Maria Silva", email: "maria@email.com", grupo: "GC Vila Nova", status: "Ativo" },
  { id: "2", nome: "João Souza", email: "joao@email.com", grupo: "GC Centro", status: "Ativo" },
  { id: "3", nome: "Ana Lima", email: "ana@email.com", grupo: "GC Jardins", status: "Inativo" },
  // ...adicione mais membros conforme necessário
];

export const MembrosRegistrados: React.FC<MembrosRegistradosProps> = ({ onBack }) => {
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
          <p className="text-white/80">Visualize todos os membros cadastrados</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMembers.map((member) => (
            <Card key={member.id} className="shadow-soft hover:shadow-strong transition-all duration-200">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{member.nome}</CardTitle>
                  <CardDescription className="text-xs">{member.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="font-semibold">Grupo:</span> {member.grupo}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Status:</span> {member.status}
                </div>
                <Button variant="outline" className="w-full mt-2">
                  Visualizar Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
/*

FUTURAS MELHORIAS:

- Botao visualizar detalhes
  - Dentro dele aparece as infos cadastradas e opção de inativar

- Automatizar para aparecer automaticamente quando o membro é cadastrado

*/