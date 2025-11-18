import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Edit, Trash2, Megaphone, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_roles: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  author_name?: string;
}

interface AnnouncementInsert {
  title: string;
  content: string;
  target_roles: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at: string | null;
  is_active: boolean;
  created_by: string;
}

interface AvisosProps {
  onBack: () => void;
}

export function Avisos({ onBack }: AvisosProps) {
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'all'>('active'); // Novo filtro

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_roles: [] as string[],
    priority: "normal" as 'low' | 'normal' | 'high' | 'urgent',
    expires_at: "",
    is_active: true,
  });

  const roleOptions = [
    { value: "leader", label: "Líderes" },
    { value: "co_leader", label: "Co-Líderes" },
  ];

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      console.log('📢 Avisos: Iniciando carregamento de avisos...');
      
      const { data: announcementsData, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Avisos: Erro ao buscar avisos:', error);
        console.error('Detalhes:', { message: error.message, details: error.details, code: error.code });
        throw error;
      }

      console.log('📊 Avisos: Avisos encontrados:', announcementsData?.length || 0);

      // Buscar nomes dos autores
      if (announcementsData && announcementsData.length > 0) {
        const authorIds = [...new Set((announcementsData as any[]).map((a: any) => a.created_by).filter(Boolean))];
        console.log('👤 Avisos: Buscando nomes de', authorIds.length, 'autores...');
        
        const { data: authorsData, error: authorsError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', authorIds);

        if (authorsError) throw authorsError;

        const authorsMap = new Map((authorsData as any[])?.map((u: any) => [u.id, u.name]) || []);

        const enrichedAnnouncements = (announcementsData as any[]).map((announcement: any) => ({
          ...announcement,
          author_name: authorsMap.get(announcement.created_by) || 'Desconhecido'
        }));

        setAnnouncements(enrichedAnnouncements);
        console.log('✅ Avisos: Carregados com sucesso');
      } else {
        setAnnouncements([]);
        console.log('ℹ️ Avisos: Nenhum aviso encontrado');
      }
    } catch (error: any) {
      console.error('💥 Avisos: Erro fatal ao carregar avisos:', error);
      toast({
        title: "Erro ao carregar avisos",
        description: error.message || "Verifique se a tabela 'announcements' foi criada no Supabase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e conteúdo",
        variant: "destructive",
      });
      return;
    }

    if (formData.target_roles.length === 0) {
      toast({
        title: "Destinatários obrigatórios",
        description: "Selecione pelo menos um grupo de destinatários",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSave: AnnouncementInsert = {
        title: formData.title,
        content: formData.content,
        target_roles: formData.target_roles,
        priority: formData.priority,
        expires_at: formData.expires_at || null,
        is_active: formData.is_active,
        created_by: profile?.id || '',
      };

      console.log('💾 Avisos: Tentando salvar aviso...', { 
        editing: !!editingId, 
        data: dataToSave 
      });

      if (editingId) {
        console.log('✏️ Avisos: Atualizando aviso existente:', editingId);
        const { error } = await (supabase as any)
          .from('announcements')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) {
          console.error('❌ Avisos: Erro ao atualizar:', error);
          throw error;
        }

        console.log('✅ Avisos: Aviso atualizado com sucesso');
        toast({
          title: "Aviso atualizado!",
          description: "O aviso foi atualizado com sucesso",
        });
      } else {
        console.log('➕ Avisos: Criando novo aviso...');
        const { error, data } = await (supabase as any)
          .from('announcements')
          .insert([dataToSave])
          .select();

        if (error) {
          console.error('❌ Avisos: Erro ao criar:', error);
          throw error;
        }

        console.log('✅ Avisos: Aviso criado com sucesso:', data);
        toast({
          title: "Aviso criado!",
          description: "O aviso foi publicado com sucesso",
        });
      }

      resetForm();
      loadAnnouncements();
    } catch (error: any) {
      console.error('Erro ao salvar aviso:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast({
        title: "Erro ao salvar aviso",
        description: error.message || error.details || "Não foi possível salvar o aviso. Verifique se a tabela foi criada no Supabase.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_roles: announcement.target_roles,
      priority: announcement.priority,
      expires_at: announcement.expires_at || "",
      is_active: announcement.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este aviso?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Aviso excluído",
        description: "O aviso foi removido com sucesso",
      });

      loadAnnouncements();
    } catch (error: any) {
      console.error('Erro ao excluir aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o aviso",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      target_roles: [],
      priority: "normal",
      expires_at: "",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

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
              <h1 className="text-3xl font-bold text-white">Avisos e Comunicados</h1>
              <p className="text-white/80">Gerencie as mensagens para líderes e co-líderes</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-primary hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancelar' : 'Novo Aviso'}
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="shadow-strong mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                {editingId ? 'Editar Aviso' : 'Criar Novo Aviso'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Atualize as informações do aviso' : 'Publique um novo aviso para líderes e co-líderes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título do aviso"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Escreva a mensagem completa..."
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Destinatários *</Label>
                    <div className="space-y-2">
                      {roleOptions.map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={role.value}
                            checked={formData.target_roles.includes(role.value)}
                            onCheckedChange={() => toggleRole(role.value)}
                          />
                          <label
                            htmlFor={role.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {role.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expires_at" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Data de Expiração (opcional)
                    </Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para não expirar
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                      />
                      <label
                        htmlFor="is_active"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Aviso ativo
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Atualizar Aviso' : 'Publicar Aviso'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filtro de Visualização */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'active' ? 'default' : 'outline'}
            onClick={() => setViewMode('active')}
            className={viewMode === 'active' ? '' : 'bg-white'}
          >
            Avisos Ativos
            <Badge variant="secondary" className="ml-2">
              {announcements.filter(a => a.is_active && !isExpired(a.expires_at)).length}
            </Badge>
          </Button>
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            onClick={() => setViewMode('all')}
            className={viewMode === 'all' ? '' : 'bg-white'}
          >
            Histórico Completo
            <Badge variant="secondary" className="ml-2">
              {announcements.length}
            </Badge>
          </Button>
        </div>

        {/* Lista de Avisos */}
        {loading ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Carregando avisos...</p>
            </CardContent>
          </Card>
        ) : announcements.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum aviso publicado ainda</p>
              <Button 
                onClick={() => setShowForm(true)} 
                variant="outline" 
                className="mt-4"
              >
                Criar Primeiro Aviso
              </Button>
            </CardContent>
          </Card>
        ) : (() => {
          const filteredAnnouncements = announcements.filter((announcement) => {
            if (viewMode === 'active') {
              // Mostrar apenas ativos e não expirados
              return announcement.is_active && !isExpired(announcement.expires_at);
            }
            // Mostrar todos no histórico
            return true;
          });

          if (filteredAnnouncements.length === 0) {
            return (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {viewMode === 'active' 
                      ? 'Nenhum aviso ativo no momento'
                      : 'Nenhum aviso no histórico'}
                  </p>
                </CardContent>
              </Card>
            );
          }

          return (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={`shadow-soft ${!announcement.is_active || isExpired(announcement.expires_at) ? 'opacity-60 bg-gray-50' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {getPriorityLabel(announcement.priority)}
                        </Badge>
                        {!announcement.is_active && (
                          <Badge variant="outline" className="bg-gray-100">Inativo</Badge>
                        )}
                        {isExpired(announcement.expires_at) && (
                          <Badge variant="outline" className="bg-red-100 text-red-700">Expirado</Badge>
                        )}
                      </div>
                      <CardDescription className="space-y-1">
                        <p>Publicado por: {announcement.author_name}</p>
                        <p>Em: {formatDate(announcement.created_at)}</p>
                        {announcement.expires_at && (
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expira em: {formatDate(announcement.expires_at)}
                          </p>
                        )}
                        <div className="flex gap-1 mt-2">
                          {announcement.target_roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {roleOptions.find(r => r.value === role)?.label || role}
                            </Badge>
                          ))}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-700">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          );
        })()}
      </div>
      <Footer />
    </div>
  );
}
