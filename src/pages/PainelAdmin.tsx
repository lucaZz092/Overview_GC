import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Users, Shield, Settings, Database, Trash2, Edit, UserPlus, AlertCircle, CheckCircle2, Mail, Phone, Calendar } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  grupo_crescimento?: string;
  created_at: string;
  email_confirmed_at?: string;
}

interface SystemStats {
  totalUsers: number;
  admins: number;
  pastors: number;
  coordinators: number;
  leaders: number;
  coLeaders: number;
  totalMembers: number;
  totalMeetings: number;
  totalReports: number;
  totalAnnouncements: number;
}

export default function PainelAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadStats()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao carregar usuários:", error);
      throw error;
    }

    setUsers(data || []);
  };

  const loadStats = async () => {
    try {
      // Contar usuários por role
      const { data: usersData } = await supabase.from('users').select('role');
      
      const roleCounts = (usersData as any)?.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      // Contar membros
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      // Contar encontros
      const { count: meetingsCount } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true });

      // Contar relatórios
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      // Contar avisos
      const { count: announcementsCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersData?.length || 0,
        admins: roleCounts?.admin || 0,
        pastors: roleCounts?.pastor || 0,
        coordinators: roleCounts?.coordenador || 0,
        leaders: roleCounts?.leader || 0,
        coLeaders: roleCounts?.co_leader || 0,
        totalMembers: membersCount || 0,
        totalMeetings: meetingsCount || 0,
        totalReports: reportsCount || 0,
        totalAnnouncements: announcementsCount || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const { error } = await (supabase as any)
        .from('users')
        .update({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          phone: editingUser.phone,
          grupo_crescimento: editingUser.grupo_crescimento,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o usuário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Deletar dados relacionados primeiro
      await supabase.from('announcements').delete().eq('created_by', userToDelete.id);
      await supabase.from('reports').delete().eq('author_id', userToDelete.id);
      await supabase.from('meetings').delete().eq('user_id', userToDelete.id);
      await supabase.from('members').delete().eq('leader_id', userToDelete.id);

      // Deletar o usuário da tabela users
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);

      if (userError) throw userError;

      // Tentar deletar da autenticação (pode falhar se não tiver permissão)
      try {
        await supabase.auth.admin.deleteUser(userToDelete.id);
      } catch (authError) {
        console.warn("Não foi possível deletar da autenticação:", authError);
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      loadData();
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      admin: { label: "Admin", variant: "destructive" },
      pastor: { label: "Pastor", variant: "default" },
      coordenador: { label: "Coordenador", variant: "default" },
      leader: { label: "Líder", variant: "secondary" },
      co_leader: { label: "Co-Líder", variant: "outline" },
    };

    const config = roleConfig[role] || { label: role, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Painel Administrativo
          </h1>
          <p className="text-gray-600">Gerencie usuários e configurações do sistema</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Database className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{stats?.admins || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Pastores/Coord</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {(stats?.pastors || 0) + (stats?.coordinators || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Líderes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats?.leaders || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Co-Líderes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats?.coLeaders || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-800">Total de Membros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats?.totalMembers || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-800">Total de Encontros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats?.totalMeetings || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-800">Total de Relatórios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats?.totalReports || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-800">Total de Avisos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats?.totalAnnouncements || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Informação do Sistema</AlertTitle>
              <AlertDescription>
                O painel administrativo permite gerenciar todos os aspectos do sistema.
                Use as abas acima para navegar entre as diferentes áreas de gestão.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Gerenciamento de Usuários */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gerenciamento de Usuários
                    </CardTitle>
                    <CardDescription>
                      Visualize, edite e gerencie todos os usuários do sistema
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Novo Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filtrar por cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os cargos</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="pastor">Pastor</SelectItem>
                      <SelectItem value="coordenador">Coordenador</SelectItem>
                      <SelectItem value="leader">Líder</SelectItem>
                      <SelectItem value="co_leader">Co-Líder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabela de Usuários */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>GC</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cadastro</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="text-gray-600">{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="text-gray-600">
                              {user.grupo_crescimento || "-"}
                            </TableCell>
                            <TableCell>
                              {user.email_confirmed_at ? (
                                <Badge variant="outline" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  className="gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  Editar
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Excluir
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Configure parâmetros gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Em Desenvolvimento</AlertTitle>
                  <AlertDescription>
                    Esta seção está sendo desenvolvida. Em breve você poderá configurar:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Configurações de e-mail</li>
                      <li>Temas e personalização</li>
                      <li>Backup automático</li>
                      <li>Integrações externas</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Informações do Sistema
                </CardTitle>
                <CardDescription>
                  Dados técnicos e manutenção do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Versão do Sistema</h3>
                    <p className="text-gray-600">v1.0.0</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Banco de Dados</h3>
                    <p className="text-gray-600">Supabase PostgreSQL</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Último Backup</h3>
                    <p className="text-gray-600">Não configurado</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Status</h3>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Operacional
                    </Badge>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Manutenção</AlertTitle>
                  <AlertDescription>
                    Para realizar backup manual dos dados, acesse o painel do Supabase.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário abaixo
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-gray-400 mt-2" />
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <div className="flex gap-2">
                  <Phone className="h-5 w-5 text-gray-400 mt-2" />
                  <Input
                    id="edit-phone"
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Cargo</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="leader">Líder</SelectItem>
                    <SelectItem value="co_leader">Co-Líder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(editingUser.role === 'leader' || editingUser.role === 'co_leader') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-gc">Grupo de Crescimento</Label>
                  <Select
                    value={editingUser.grupo_crescimento || ""}
                    onValueChange={(value) => setEditingUser({ ...editingUser, grupo_crescimento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o GC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gc-legacy-faith">GC Legacy Faith</SelectItem>
                      <SelectItem value="gc-legacy-awake">GC Legacy Awake</SelectItem>
                      <SelectItem value="gc-legacy-kairos">GC Legacy Kairós</SelectItem>
                      <SelectItem value="gc-legacy-revival">GC Legacy Revival</SelectItem>
                      <SelectItem value="gc-legacy-chosen">GC Legacy Chosen</SelectItem>
                      <SelectItem value="gc-legacy-overflow">GC Legacy Overflow</SelectItem>
                      <SelectItem value="gc-legacy-rise">GC Legacy Rise</SelectItem>
                      <SelectItem value="gc-legacy-arrow">GC Legacy Arrow</SelectItem>
                      <SelectItem value="gc-legacy-renew">GC Legacy Renew</SelectItem>
                      <SelectItem value="gc-legacy-trinity">GC Legacy Trinity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
              Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
