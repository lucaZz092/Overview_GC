# Configuração do Supabase - Overview GC

Este guia te ajudará a configurar o Supabase como backend para o sistema de gestão de Grupos de Crescimento.

## 🚀 Passo a Passo da Configuração

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Digite o nome do projeto (ex: "overview-gc")
6. Digite uma senha segura para o banco de dados
7. Escolha uma região próxima (ex: South America - São Paulo)
8. Clique em "Create new project"

### 2. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie a **Project URL** e a **anon public key**
3. No arquivo `.env` na raiz do projeto, substitua:

```env
VITE_SUPABASE_URL=sua_project_url_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**Exemplo:**
```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Executar as Migrações do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em "Run"

Isso criará todas as tabelas, índices, triggers e políticas de segurança necessárias.

### 4. Configurar Autenticação

1. No painel do Supabase, vá em **Authentication** → **Settings**
2. Configure as opções conforme necessário:
   - **Enable email confirmations**: Desabilite para desenvolvimento
   - **Enable phone confirmations**: Mantenha desabilitado
   - **Site URL**: `http://localhost:5173` (para desenvolvimento)

### 5. Testar a Conexão

Execute o projeto e teste o login:

```bash
npm run dev
```

## 📋 Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Perfis de usuários (conectado ao sistema de auth do Supabase)
- **members**: Membros dos grupos de crescimento
- **meetings**: Encontros/reuniões realizadas
- **meeting_attendances**: Controle de presença nos encontros
- **reports**: Relatórios gerados pelo sistema

### Relacionamentos

- `users` → `members` (um usuário pode ter criado vários membros)
- `users` → `meetings` (um usuário pode ter criado várias reuniões)
- `meetings` → `meeting_attendances` (uma reunião tem várias presenças)
- `members` → `meeting_attendances` (um membro pode ter várias presenças)

## 🔒 Segurança (RLS - Row Level Security)

O sistema implementa políticas de segurança que garantem:

- Usuários só podem ver/editar dados que criaram
- Administradores e líderes têm permissões especiais
- Todas as operações são auditadas com timestamps

## 🛠️ Hooks Disponíveis

### Autenticação
- `useAuth()`: Hook principal para autenticação
- `useAuthContext()`: Contexto global de autenticação

### Dados
- `useMembers()`: Listar membros
- `useMember(id)`: Buscar membro específico
- `useCreateMember()`: Criar novo membro
- `useUpdateMember()`: Atualizar membro
- `useDeleteMember()`: Deletar membro
- `useMeetings()`: Listar reuniões
- `useReports()`: Listar relatórios

## 🚀 Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm run preview
```

## 📝 Exemplos de Uso

### Autenticação
```tsx
import { useAuthContext } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuthContext();
  
  const handleLogin = async () => {
    try {
      await signIn('email@example.com', 'password');
    } catch (error) {
      console.error('Erro no login:', error.message);
    }
  };
}
```

### Gerenciar Membros
```tsx
import { useMembers, useCreateMember } from '@/hooks/useSupabase';

function MembersComponent() {
  const { data: members, loading } = useMembers();
  const { mutate: createMember } = useCreateMember();
  
  const handleCreateMember = async () => {
    try {
      await createMember({
        name: 'João Silva',
        email: 'joao@example.com',
        joined_date: '2024-01-01'
      });
    } catch (error) {
      console.error('Erro ao criar membro:', error.message);
    }
  };
}
```

## 🔧 Troubleshooting

### Problema: "Missing Supabase environment variables"
**Solução**: Verifique se as variáveis no `.env` estão corretas e reinicie o servidor.

### Problema: Erro de conexão com o banco
**Solução**: Verifique se a URL do projeto está correta e se o projeto está ativo no Supabase.

### Problema: RLS está bloqueando operações
**Solução**: Verifique se o usuário está autenticado e se as políticas estão configuradas corretamente.

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Políticas RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript)

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request