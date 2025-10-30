import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Plus, Copy, Trash2, Users, Calendar, ArrowLeft } from 'lucide-react';

interface InvitationCode {
  id: string;
  code: string;
  role: 'pastor' | 'leader' | 'co_leader';
  description: string;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

interface InvitationManagerProps {
  onBack: () => void;
}

export function InvitationManager({ onBack }: InvitationManagerProps) {
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form states
  const [newCode, setNewCode] = useState('');
  const [newRole, setNewRole] = useState<'pastor' | 'leader' | 'co_leader'>('co_leader');
  const [newDescription, setNewDescription] = useState('');
  const [newMaxUses, setNewMaxUses] = useState(1);
  const [newExpiresInDays, setNewExpiresInDays] = useState(30);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    console.log('🔍 Buscando códigos de convite...');
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Resultado da busca:', { data, error });

      if (error) throw error;
      setCodes(data || []);
      console.log('✅ Códigos carregados:', data?.length || 0);
    } catch (error: any) {
      console.error('❌ Erro ao buscar códigos:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível carregar os códigos: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testTableExists = async () => {
    console.log('🧪 Testando se a tabela invitation_codes existe...');
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Tabela não existe ou erro:', error);
        toast({
          title: 'Tabela não existe',
          description: 'Execute o schema invitation-codes-schema.sql no Supabase',
          variant: 'destructive',
        });
      } else {
        console.log('✅ Tabela existe! Total de registros:', data);
        toast({
          title: 'Tabela existe!',
          description: 'A tabela invitation_codes está configurada corretamente',
        });
      }
    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
      toast({
        title: 'Erro no teste',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const createCode = async () => {
    if (!newCode.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite um código',
        variant: 'destructive',
      });
      return;
    }

    console.log('🔍 Criando código:', {
      code: newCode.toUpperCase(),
      role: newRole,
      description: newDescription,
      max_uses: newMaxUses,
      expires_in_days: newExpiresInDays
    });

    setCreating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + newExpiresInDays);

      console.log('📅 Data de expiração:', expiresAt.toISOString());

      const { data, error } = await supabase
        .from('invitation_codes')
        .insert({
          code: newCode.toUpperCase(),
          role: newRole,
          description: newDescription,
          max_uses: newMaxUses,
          expires_at: expiresAt.toISOString(),
        })
        .select();

      console.log('📊 Resultado da inserção:', { data, error });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Código criado com sucesso!',
      });

      // Reset form
      setNewCode('');
      setNewDescription('');
      setNewMaxUses(1);
      setNewExpiresInDays(30);
      
      fetchCodes();
    } catch (error: any) {
      console.error('Erro ao criar código:', error);
      toast({
        title: 'Erro',
        description: error.message.includes('duplicate') 
          ? 'Este código já existe' 
          : 'Não foi possível criar o código',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copiado!',
      description: `Código ${code} copiado para a área de transferência`,
    });
  };

  const deactivateCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invitation_codes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Código desativado',
      });

      fetchCodes();
    } catch (error: any) {
      console.error('Erro ao desativar código:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar o código',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pastor':
        return <Badge variant="destructive">Pastor</Badge>;
      case 'leader':
        return <Badge variant="default">Líder</Badge>;
      case 'co_leader':
        return <Badge variant="secondary">Co-Líder</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (code: InvitationCode) => {
    const isExpired = new Date(code.expires_at) < new Date();
    const isExhausted = code.current_uses >= code.max_uses;
    
    if (!code.is_active) {
      return <Badge variant="outline">Inativo</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    if (isExhausted) {
      return <Badge variant="outline">Esgotado</Badge>;
    }
    return <Badge variant="default">Ativo</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando códigos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Códigos de Convite</h1>
              <p className="text-white/80">Gerencie códigos para definir papéis dos usuários</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Criar Novo Código */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Novo Código
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="LIDER-2024"
                />
              </div>
              <div>
                <Label htmlFor="role">Papel</Label>
                <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pastor">🙏 Pastor</SelectItem>
                    <SelectItem value="leader">👑 Líder</SelectItem>
                    <SelectItem value="co_leader">🤝 Co-Líder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Nome do GC</Label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="GC Legacy Renew"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUses">Máximo de Usos</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="expiresIn">Expira em (dias)</Label>
                <Input
                  id="expiresIn"
                  type="number"
                  min="1"
                  value={newExpiresInDays}
                  onChange={(e) => setNewExpiresInDays(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createCode} disabled={creating} className="flex-1">
                {creating ? 'Criando...' : 'Criar Código'}
              </Button>
              <Button onClick={testTableExists} variant="outline">
                🧪 Testar Tabela
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Códigos */}
        <div className="grid gap-4">
          {codes.map((code) => (
            <Card key={code.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono text-lg font-bold">
                        {code.code}
                      </code>
                      {getRoleBadge(code.role)}
                      {getStatusBadge(code)}
                    </div>
                    
                    <p className="text-gray-600 mb-2">{code.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {code.current_uses}/{code.max_uses} usos
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Expira: {new Date(code.expires_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCode(code.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {code.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateCode(code.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {codes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum código de convite criado ainda.</p>
              <p className="text-sm">Crie códigos para permitir que usuários tenham papéis específicos.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}