# 📊 Overview GC - Documentação do Projeto

## 📋 Sobre o Projeto
Sistema de gestão para Grupos de Crescimento (GC) desenvolvido com React, TypeScript, Tailwind CSS e Supabase como backend. O sistema permite o controle completo de membros, reuniões, presenças e relatórios.

---

## 🛠️ Stack Tecnológica

### **Frontend:**
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes de interface
- **React Router DOM** - Roteamento
- **React Query** - Gerenciamento de estado servidor
- **Lucide React** - Ícones

### **Backend:**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Supabase Auth** - Autenticação
- **Row Level Security (RLS)** - Segurança de dados

---

## 🏗️ Estrutura do Projeto

```
Overview_GC/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes base (Shadcn)
│   │   ├── Login.tsx       # Tela de login
│   │   ├── Register.tsx    # Tela de registro
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   ├── ProtectedRoute.tsx # Proteção de rotas
│   │   └── ...             # Outros componentes
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.ts      # Hook de autenticação
│   │   ├── useSupabase.ts  # Hooks para dados
│   │   └── useUserProfile.ts # Hook para perfil do usuário
│   ├── contexts/           # Contextos React
│   │   └── AuthContext.tsx # Contexto de autenticação
│   ├── lib/                # Utilitários
│   │   └── supabase.ts     # Cliente Supabase
│   ├── types/              # Tipos TypeScript
│   │   └── database.ts     # Tipos do banco de dados
│   └── pages/              # Páginas principais
│       ├── Index.tsx       # Página inicial
│       └── NotFound.tsx    # Página 404
├── supabase-schema.sql     # Schema do banco de dados
├── create-admin-user.sql   # Script para criar admin
├── SUPABASE-SETUP.md      # Guia de configuração Supabase
├── AUTHENTICATION-SETUP.md # Guia de autenticação
└── package.json           # Dependências
```

---

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais:**

#### **1. users**
- Estende `auth.users` do Supabase
- Campos: `id`, `email`, `name`, `role`, `is_active`
- Roles: `admin`, `leader`, `member`

#### **2. members**
- Gestão de membros dos grupos
- Campos: `id`, `name`, `email`, `phone`, `birth_date`, `address`, `joined_date`, `notes`

#### **3. meetings**
- Registro de encontros/reuniões
- Campos: `id`, `title`, `description`, `date`, `location`, `attendance_count`

#### **4. meeting_attendances**
- Controle de presença nos encontros
- Relaciona `meetings` e `members`
- Campos: `meeting_id`, `member_id`, `attended`, `notes`

#### **5. reports**
- Sistema de relatórios
- Campos: `id`, `title`, `content`, `type`, `period_start`, `period_end`

---

## 🔐 Sistema de Autenticação

### **Funcionalidades Implementadas:**
- ✅ **Login com email/senha** - Autenticação via Supabase Auth
- ✅ **Registro de usuários** - Com validação de dados
- ✅ **Logout funcional** - Limpa sessão
- ✅ **Rotas protegidas** - Componente ProtectedRoute
- ✅ **Estados de loading** - Feedback visual
- ✅ **Controle de sessão** - Persistent login

### **Sistema de Roles:**
- 🔴 **Admin**: Acesso total, pode gerenciar tudo
- 🔵 **Leader**: Pode gerenciar membros e reuniões
- ⚪ **Member**: Acesso básico de visualização

### **Segurança:**
- **Row Level Security (RLS)** habilitado
- **Políticas por role** de usuário
- **Validação de entrada** em todos os formulários
- **Tokens JWT** para sessões

---

## 🎨 Interface de Usuário

### **Componentes Principais:**

#### **1. Login (src/components/Login.tsx)**
- Formulário de autenticação
- Validação de campos obrigatórios
- Feedback de erros
- Link para registro

#### **2. Register (src/components/Register.tsx)**
- Formulário de cadastro
- Validação de senha (mínimo 6 caracteres)
- Confirmação de senha
- Criação automática de perfil

#### **3. Dashboard (src/components/Dashboard.tsx)**
- Interface principal pós-login
- Badges de role do usuário
- Estatísticas por tipo de usuário
- Menu de navegação

#### **4. ProtectedRoute (src/components/ProtectedRoute.tsx)**
- Proteção de rotas
- Redirect para login se não autenticado
- Loading state durante verificação

### **Design System:**
- **Cores**: Gradientes azul/roxo para headers
- **Tipografia**: Font system padrão
- **Componentes**: Shadcn/ui para consistência
- **Responsivo**: Mobile-first approach

---

## 🔧 Hooks Personalizados

### **1. useAuth (src/hooks/useAuth.ts)**
```typescript
const { user, session, loading, signIn, signUp, signOut } = useAuth();
```
- Gerencia estado de autenticação
- Listener de mudanças de sessão
- Métodos de login/registro/logout

### **2. useUserProfile (src/hooks/useUserProfile.ts)**
```typescript
const { profile, loading, isAdmin, isLeader, isMember } = useUserProfile();
```
- Busca dados do perfil do usuário
- Helpers para verificar roles
- Cache do perfil

### **3. useSupabase (src/hooks/useSupabase.ts)**
Hooks para operações CRUD:
```typescript
// Membros
const { data: members } = useMembers();
const { mutate: createMember } = useCreateMember();
const { mutate: updateMember } = useUpdateMember();

// Reuniões
const { data: meetings } = useMeetings();
const { mutate: createMeeting } = useCreateMeeting();

// Relatórios
const { data: reports } = useReports();
const { mutate: createReport } = useCreateReport();
```

---

## 📱 Funcionalidades por Componente

### **✅ Implementadas e Funcionais:**

#### **Autenticação:**
- [x] Login com email/senha
- [x] Registro de novos usuários
- [x] Logout
- [x] Proteção de rotas
- [x] Controle de sessão
- [x] Sistema de roles

#### **Dashboard:**
- [x] Interface principal
- [x] Badges de role
- [x] Header com informações do usuário
- [x] Menu de navegação
- [x] Estatísticas básicas

#### **Infraestrutura:**
- [x] Cliente Supabase configurado
- [x] Hooks personalizados
- [x] Tipos TypeScript
- [x] Contextos React
- [x] Roteamento

### **🚧 Parcialmente Implementadas:**

#### **Gestão de Membros:**
- [x] Hooks para CRUD
- [x] Tipos de dados
- [ ] Interface de listagem
- [ ] Formulários de criação/edição
- [ ] Filtros e busca

#### **Gestão de Reuniões:**
- [x] Hooks para CRUD
- [x] Schema do banco
- [ ] Interface de listagem
- [ ] Formulário de criação
- [ ] Controle de presença

#### **Relatórios:**
- [x] Hooks básicos
- [x] Schema do banco
- [ ] Interface de criação
- [ ] Templates de relatórios
- [ ] Exportação

### **❌ Não Implementadas:**

#### **Funcionalidades Avançadas:**
- [ ] Dashboard com gráficos
- [ ] Notificações
- [ ] Import/Export de dados
- [ ] Histórico de atividades
- [ ] Configurações avançadas

#### **Melhorias de UX:**
- [ ] Temas dark/light
- [ ] Personalização de perfil
- [ ] Foto de perfil
- [ ] Preferências do usuário

---

## 🚀 Como Usar o Projeto

### **1. Configuração Inicial:**
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Editar .env com suas chaves do Supabase
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave

# Executar o schema SQL no Supabase
# Copiar conteúdo de supabase-schema.sql para SQL Editor
```

### **2. Desenvolvimento:**
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acesso: http://localhost:8080
```

### **3. Primeiro Uso:**
1. Registrar conta admin: `admin@gcoverview.com`
2. Executar script: `create-admin-user.sql`
3. Fazer login e testar funcionalidades

---

## 📊 Status Atual do Projeto

### **📈 Progresso Geral: ~60%**

#### **✅ Completo (100%):**
- Configuração do projeto
- Sistema de autenticação
- Estrutura do banco de dados
- Hooks e tipos TypeScript
- Interface básica

#### **🚧 Em Progresso (60%):**
- Dashboard funcional
- Componentes de UI
- Gestão de dados

#### **⏳ Pendente (0%):**
- Interfaces de CRUD completas
- Relatórios avançados
- Funcionalidades extras

---

## 🎯 Próximos Passos

### **Prioridade Alta:**
1. **Completar interface de membros** - Listagem, criação, edição
2. **Sistema de reuniões** - Interface completa com presença
3. **Dashboard com dados reais** - Estatísticas do banco

### **Prioridade Média:**
1. **Sistema de relatórios** - Templates e geração
2. **Melhorias de UX** - Loading states, validações
3. **Filtros e busca** - Para todas as listagens

### **Prioridade Baixa:**
1. **Funcionalidades extras** - Notificações, temas
2. **Otimizações** - Performance, SEO
3. **Testes** - Unit tests, E2E tests

---

## 📝 Notas Técnicas

### **Padrões Utilizados:**
- **Componentes funcionais** com hooks
- **TypeScript strict mode** para tipagem
- **Custom hooks** para lógica reutilizável
- **Context API** para estado global
- **Atomic design** para componentes

### **Considerações de Segurança:**
- RLS habilitado em todas as tabelas
- Validação client-side e server-side
- Tokens JWT com expiração
- HTTPS obrigatório em produção

### **Performance:**
- React Query para cache de dados
- Lazy loading de componentes
- Otimização de bundle com Vite
- CSS-in-JS evitado para performance

---

## 🤝 Contribuição

### **Como contribuir:**
1. Fork do repositório
2. Criar branch para feature
3. Seguir padrões de código existentes
4. Testar funcionalidades
5. Criar Pull Request

### **Estrutura de commits:**
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: mudanças de estilo
refactor: refatoração de código
```

---

## 📞 Contato e Suporte

**Desenvolvedor:** Lucas  
**Email:** admin@gcoverview.com  
**Projeto:** Overview GC - Sistema de Gestão de Grupos de Crescimento

---

*Última atualização: 29 de outubro de 2025*