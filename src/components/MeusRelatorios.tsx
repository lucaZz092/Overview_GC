import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import React from "react";

interface Relatorio {
  id: string;
  grupo: string;
  data: string;
  resumo: string;
}

const relatoriosMock: Relatorio[] = [
  {
    id: "1",
    grupo: "GC Vila Nova",
    data: "20/08/2025",
    resumo: "Encontro sobre discipulado e integração de novos membros.",
  },
  {
    id: "2",
    grupo: "GC Centro",
    data: "18/08/2025",
    resumo: "Estudo sobre liderança e planejamento de ações sociais.",
  },
  // ...adicione mais relatórios conforme necessário
];

export const MeusRelatorios: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white">
            ←
          </Button>
          <h1 className="text-2xl font-bold text-white">Meus Relatórios</h1>
        </div>
        <div className="container mx-auto px-4 pb-2">
          <p className="text-white/80">Veja os relatórios dos seus grupos de crescimento</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatoriosMock.map((relatorio) => (
            <Card key={relatorio.id} className="shadow-soft hover:shadow-strong transition-all duration-200">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{relatorio.grupo}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {relatorio.data}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="font-semibold">Resumo:</span> {relatorio.resumo}
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
};