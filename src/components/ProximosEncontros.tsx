import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Book, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Footer } from "@/components/Footer";

interface ProximosEncontrosProps {
  onBack: () => void;
}

interface WeekTheme {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  theme: string;
  description: string;
  gcDays: string[]; // Dias da semana com GC
}

export function ProximosEncontros({ onBack }: ProximosEncontrosProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [weekThemes, setWeekThemes] = useState<WeekTheme[]>([]);

  // Dias sem GC (cultos)
  const noCGDays = ['Quarta-feira', 'Sábado', 'Domingo'];

  useEffect(() => {
    generateWeekThemes();
  }, []);

  const generateWeekThemes = () => {
    const today = new Date();
    const themes: WeekTheme[] = [];

    // Temas exemplo - você pode buscar isso de um banco de dados
    const monthlyThemes = [
      { month: 11, themes: [
        { theme: "Morte de Cristo", description: "Estudo sobre o sacrifício e significado da cruz" },
        { theme: "Ressurreição e Esperança", description: "A vitória sobre a morte e nova vida em Cristo" },
        { theme: "O Espírito Santo", description: "A presença e poder do Espírito em nossas vidas" },
        { theme: "Amor ao Próximo", description: "Vivendo o segundo maior mandamento" },
      ]},
      { month: 12, themes: [
        { theme: "Natal - Encarnação", description: "O significado do nascimento de Jesus" },
        { theme: "Gratidão e Adoração", description: "Encerrando o ano com louvor" },
        { theme: "Propósitos para o Novo Ano", description: "Renovando compromissos com Deus" },
        { theme: "Celebração e Comunhão", description: "A importância da família cristã" },
      ]},
    ];

    // Gerar 8 semanas de temas
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (i * 7));
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Domingo

      const month = weekStart.getMonth() + 1;
      const weekInMonth = Math.floor((weekStart.getDate() - 1) / 7);

      const monthTheme = monthlyThemes.find(t => t.month === month);
      const themeData = monthTheme?.themes[weekInMonth % monthTheme.themes.length] || {
        theme: "Tema a ser definido",
        description: "Aguardando definição do tema semanal"
      };

      // Determinar dias com GC (todos exceto quarta, sábado e domingo)
      const gcDays = ['Segunda-feira', 'Terça-feira', 'Quinta-feira', 'Sexta-feira'];

      themes.push({
        weekNumber: i + 1,
        startDate: weekStart,
        endDate: weekEnd,
        theme: themeData.theme,
        description: themeData.description,
        gcDays: gcDays
      });
    }

    setWeekThemes(themes);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const nextWeek = () => {
    if (currentWeekIndex < weekThemes.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const prevWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const getDayStatus = (dayName: string) => {
    if (noCGDays.includes(dayName)) {
      return { status: 'culto', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    }
    return { status: 'gc', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const currentWeek = weekThemes[currentWeekIndex];

  if (weekThemes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Carregando calendário...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Próximos Encontros</h1>
            <p className="text-gray-600">Calendário de temas semanais dos GCs</p>
          </div>
        </div>

        {/* Controles do Carrossel */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevWeek}
            disabled={currentWeekIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Semana Anterior
          </Button>

          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Semana {currentWeek.weekNumber}
            </Badge>
            <p className="text-sm text-gray-600 mt-1">
              {getMonthYear(currentWeek.startDate)}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={nextWeek}
            disabled={currentWeekIndex === weekThemes.length - 1}
            className="gap-2"
          >
            Próxima Semana
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Card Principal da Semana */}
        <Card className="shadow-strong border-2 border-primary/20">
          <CardHeader className="bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Book className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">{currentWeek.theme}</CardTitle>
                  <CardDescription className="text-white/90 mt-1">
                    {formatDate(currentWeek.startDate)} - {formatDate(currentWeek.endDate)}
                  </CardDescription>
                </div>
              </div>
              <Calendar className="h-12 w-12 opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg text-gray-700 mb-6">
              {currentWeek.description}
            </p>

            {/* Calendário Semanal */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map((day, index) => {
                const dayStatus = getDayStatus(day);
                const date = new Date(currentWeek.startDate);
                date.setDate(currentWeek.startDate.getDate() + index);

                return (
                  <Card key={day} className={`${dayStatus.color} border-2`}>
                    <CardContent className="p-4 text-center">
                      <p className="font-bold text-sm mb-1">{day.slice(0, 3)}</p>
                      <p className="text-2xl font-bold mb-2">
                        {date.getDate()}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${dayStatus.status === 'culto' ? 'bg-purple-200' : 'bg-green-200'}`}
                      >
                        {dayStatus.status === 'culto' ? '⛪ Culto' : '🏠 GC'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Dias com GC */}
          <Card className="shadow-soft bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Clock className="h-5 w-5" />
                Dias com Grupo de Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentWeek.gcDays.map((day) => (
                  <div key={day} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-900">{day}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-green-700 mt-4">
                Todos os encontros seguem o tema da semana
              </p>
            </CardContent>
          </Card>

          {/* Dias com Culto */}
          <Card className="shadow-soft bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Calendar className="h-5 w-5" />
                Dias com Culto (Sem GC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {noCGDays.map((day) => (
                  <div key={day} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-medium text-purple-900">{day}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-purple-700 mt-4">
                Nos dias de culto não há reuniões de GC
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visualização das próximas semanas */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Próximas Semanas</CardTitle>
            <CardDescription>Visão geral dos temas seguintes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekThemes.slice(currentWeekIndex + 1, currentWeekIndex + 4).map((week) => (
                <div 
                  key={week.weekNumber}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setCurrentWeekIndex(week.weekNumber - 1)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Semana {week.weekNumber}</Badge>
                    <div>
                      <p className="font-semibold text-gray-900">{week.theme}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(week.startDate)} - {formatDate(week.endDate)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
