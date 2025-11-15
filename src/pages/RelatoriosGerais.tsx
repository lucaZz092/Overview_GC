import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, Filter, Search, Download, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Footer } from "@/components/Footer";

interface Report {
  id: string;
  title: string;
  content: string;
  type: 'monthly' | 'weekly' | 'annual' | 'custom';
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  user_id: string;
  author_name?: string;
  author_gc?: string;
}

interface RelatoriosGeraisProps {
  onBack: () => void;
}

export function RelatoriosGerais({ onBack }: RelatoriosGeraisProps) {
  const { profile } = useUserProfile();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filterType, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Buscar relatórios com informações do autor
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Buscar informações dos autores
      if (reportsData && reportsData.length > 0) {
        const userIds = [...new Set((reportsData as any[]).map((r: any) => r.user_id).filter(Boolean))];
        
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, grupo_crescimento')
          .in('id', userIds);

        if (usersError) throw usersError;

        const usersMap = new Map((usersData as any[])?.map((u: any) => [u.id, u]) || []);

        const enrichedReports = (reportsData as any[]).map((report: any) => ({
          ...report,
          author_name: usersMap.get(report.user_id)?.name || 'Desconhecido',
          author_gc: usersMap.get(report.user_id)?.grupo_crescimento || null
        }));

        setReports(enrichedReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Filtrar por tipo
    if (filterType !== "all") {
      filtered = filtered.filter(r => r.type === filterType);
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(term) ||
        r.content.toLowerCase().includes(term) ||
        r.author_name?.toLowerCase().includes(term) ||
        r.author_gc?.toLowerCase().includes(term)
      );
    }

    setFilteredReports(filtered);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      monthly: 'Mensal',
      weekly: 'Semanal',
      annual: 'Anual',
      custom: 'Personalizado'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      monthly: 'bg-blue-100 text-blue-700',
      weekly: 'bg-green-100 text-green-700',
      annual: 'bg-purple-100 text-purple-700',
      custom: 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => setSelectedReport(null)}
            variant="outline"
            className="mb-6 bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>

          <Card className="shadow-strong">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{selectedReport.title}</CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(selectedReport.type)}>
                        {getTypeLabel(selectedReport.type)}
                      </Badge>
                      {selectedReport.author_gc && (
                        <Badge variant="outline">{selectedReport.author_gc}</Badge>
                      )}
                    </div>
                    <p className="text-sm">Por: {selectedReport.author_name}</p>
                    <p className="text-sm">Criado em: {formatDate(selectedReport.created_at)}</p>
                    {selectedReport.period_start && selectedReport.period_end && (
                      <p className="text-sm">
                        Período: {formatDate(selectedReport.period_start)} a {formatDate(selectedReport.period_end)}
                      </p>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {selectedReport.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" className="bg-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Relatórios Gerais</h1>
              <p className="text-white/80">Todos os relatórios da igreja</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="shadow-soft mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </label>
                <Input
                  placeholder="Título, autor, grupo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Tipo de Relatório
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="annual">Anual</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resultados</label>
                <div className="h-10 flex items-center">
                  <Badge variant="secondary" className="text-base">
                    {filteredReports.length} relatório(s)
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Relatórios */}
        {loading ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Carregando relatórios...</p>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum relatório encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReports.map((report) => (
              <Card 
                key={report.id} 
                className="shadow-soft hover:shadow-strong transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{report.title}</CardTitle>
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getTypeColor(report.type)}>
                            {getTypeLabel(report.type)}
                          </Badge>
                          {report.author_gc && (
                            <Badge variant="outline">{report.author_gc}</Badge>
                          )}
                          <span className="text-xs">Por: {report.author_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(report.created_at)}
                          </span>
                          {report.period_start && report.period_end && (
                            <span>
                              Período: {formatDate(report.period_start)} - {formatDate(report.period_end)}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {report.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
