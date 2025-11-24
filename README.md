# 📊 Overview GC - Sistema de Gestão de Grupos de Crescimento

Sistema completo para gerenciamento de **Grupos de Crescimento (GC's)** de igrejas, com controle hierárquico de usuários, gestão de membros, registro de encontros, relatórios gerenciais e sistema de comunicação interna.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação e Permissões
- **Autenticação via Supabase** sem necessidade de confirmação de e-mail
- **Hierarquia de cargos**: Admin → Pastor/Coordenador → Líder → Co-Líder
- **Permissões personalizadas** por nível de acesso
- **Validação de senha forte** (8+ caracteres, maiúscula, número, símbolo)
- **Confirmação de senha** no cadastro com visualização toggle
- **Proteção de rotas** baseada em roles
- **Painel Administrativo** completo para gestão de usuários

### 👥 Gestão de Membros
- Cadastro completo de membros dos GC's
- Vinculação de membros a grupos específicos
- Histórico de participação em encontros
- Visualização filtrada por grupo e líder

### 📅 Registro e Controle de Encontros
- Registro detalhado de encontros dos GC's
- **Controle de presença** com lista de membros
- Informações de data, horário, local e observações
- Histórico completo de encontros por grupo
- **Líderes podem registrar encontros** dos seus grupos
- **Sistema de Controle de Encontros** com indicadores de status:
  - 🟢 Verde: Encontro registrado nos últimos 7 dias (em dia)
  - 🟡 Amarelo: Encontro registrado entre 8-14 dias (atenção)
  - 🔴 Vermelho: Mais de 14 dias sem registro (crítico)
- Botões rápidos de contato (email/telefone) para líderes
- Filtros por período e busca por GC
- Estatísticas de encontros registrados

### 📈 Relatórios e Dashboard

#### Para Líderes e Co-Líderes:
- Dashboard com estatísticas do próprio GC
- Visualização de encontros registrados
- Lista de membros cadastrados
- Acesso aos próprios relatórios

#### Para Pastores e Coordenadores:
- **Relatórios Gerais**: Visualização de todos os relatórios da igreja com filtros
- **Agenda Completa**: Calendário unificado de todos os encontros programados
- **Controle de Encontros**: Sistema semáforo para monitorar registros de todos os GC's
- **Gestão Geral**: Dashboard executivo com:
  - Estatísticas globais (membros, grupos, encontros, frequência)
  - Breakdown por GC com métricas individuais
  - Rankings por desempenho (membros, encontros, presença)
  - Análise comparativa entre grupos

#### Para Administradores:
- **Painel Administrativo** completo com 4 abas:
  - **Overview**: Estatísticas gerais do sistema (usuários, membros, GCs, encontros)
  - **Usuários**: CRUD completo (criar, editar, visualizar, deletar)
  - **Configurações**: Configurações do sistema (em desenvolvimento)
  - **Sistema**: Informações técnicas e logs
- Criação de usuários com validação de campos obrigatórios
- Busca e filtros por cargo, GC, status
- Gerenciamento de permissões por hierarquia

### 📢 Sistema de Avisos e Comunicados
- **Criação de avisos** por pastores e coordenadores
- **Segmentação por público-alvo** (líderes, co-líderes ou ambos)
- **Níveis de prioridade**: Baixa, Normal, Alta, Urgente
- **Data de expiração** configurável
- **Histórico completo** de avisos publicados
- Visualização automática no dashboard dos destinatários
- Filtros: avisos ativos vs. histórico completo

---

## 🚀 Tecnologias Utilizadas

### **Frontend**
- **[React 18](https://react.dev/)** - Framework UI com componentes funcionais
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática e segurança
- **[Vite](https://vitejs.dev/)** - Build tool moderna e rápida
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Shadcn/UI](https://ui.shadcn.com/)** - Componentes acessíveis e customizáveis
- **[React Router DOM](https://reactrouter.com/)** - Roteamento client-side
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones moderna
- **[Sonner](https://sonner.emilkowal.ski/)** - Sistema de notificações toast

### **Backend**
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service completo
  - **PostgreSQL** - Banco de dados relacional
  - **Auth** - Sistema de autenticação integrado
  - **Row Level Security (RLS)** - Segurança a nível de linha
  - **Real-time subscriptions** - Atualizações em tempo real
  - **Storage** - Armazenamento de arquivos
- **SQL Triggers e Functions** - Lógica de negócio no banco

### **Ferramentas de Desenvolvimento**
- **[ESLint](https://eslint.org/)** - Linter para qualidade de código
- **[PostCSS](https://postcss.org/)** - Processador CSS
- **Git & GitHub** - Controle de versão e colaboração

---

## 📂 Estrutura do Projeto

```
Overview_GC/
├── public/                      # Arquivos estáticos
│   └── robots.txt              # Configuração para crawlers
│
├── src/
│   ├── components/             # Componentes React
│   │   ├── ui/                # Componentes base do Shadcn/UI
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (40+ componentes)
│   │   │
│   │   ├── Dashboard.tsx      # Dashboard principal com cards por role
│   │   ├── Login.tsx          # Página de login
│   │   ├── RegistroEncontro.tsx    # Formulário de registro de encontros
│   │   ├── RegistroMembro.tsx      # Formulário de cadastro de membros
│   │   ├── RegistroUser.tsx        # Formulário de cadastro de usuários
│   │   ├── MembrosRegistrados.tsx  # Lista de membros cadastrados
│   │   ├── MeusRelatorios.tsx      # Relatórios do líder
│   │   └── Footer.tsx              # Rodapé padrão
│   │
│   ├── pages/                  # Páginas da aplicação
│   │   ├── Index.tsx          # Página principal com roteamento
│   │   ├── NotFound.tsx       # Página 404
│   │   ├── RelatoriosGerais.tsx    # Relatórios globais (Pastor/Coord)
│   │   ├── AgendaCompleta.tsx      # Calendário completo (Pastor/Coord)
│   │   ├── GestaoGeral.tsx         # Dashboard executivo (Pastor/Coord)
│   │   ├── Avisos.tsx              # Gestão de avisos (Pastor/Coord)
│   │   ├── PainelAdmin.tsx         # Painel administrativo (Admin)
│   │   ├── ControleEncontros.tsx   # Controle semáforo (Pastor/Coord/Líder)
│   │   └── RegistroUser.tsx        # Cadastro público de usuários
│   │
│   ├── hooks/                  # Hooks customizados
│   │   ├── use-mobile.tsx     # Hook para detecção de mobile
│   │   ├── use-toast.ts       # Hook para notificações
│   │   └── useUserProfile.ts  # Hook para dados do usuário autenticado
│   │
│   ├── contexts/               # Contextos React
│   │   └── AuthContext.tsx    # Contexto de autenticação global
│   │
│   ├── lib/                    # Bibliotecas e utilitários
│   │   ├── supabase.ts        # Cliente Supabase configurado
│   │   └── utils.ts           # Funções utilitárias (cn, etc)
│   │
│   ├── App.tsx                # Componente raiz com rotas protegidas
│   ├── main.tsx               # Entry point React
│   ├── index.css              # Estilos globais + Tailwind
│   ├── App.css                # Estilos específicos do App
│   └── vite-env.d.ts          # Tipagens do Vite
│
├── Scripts SQL/                # Scripts de banco de dados e utilitários
│   ├── add_coordenador_role.sql          # Adiciona cargo de coordenador
│   ├── create_announcements_table.sql    # Cria tabela de avisos
│   ├── fix_role_constraint.sql           # Corrige constraint de cargos
│   ├── add_phone_column.sql              # Adiciona coluna phone
│   ├── fix_users_rls_policies.sql        # Políticas RLS simplificadas
│   ├── create_user_admin_function.sql    # Função para criar usuários
│   ├── atualizar_usuario_existente.sql   # Atualiza usuário via SQL
│   ├── desabilitar_confirmacao_email.sql # Confirma emails existentes
│   └── VERIFICAR_TABELA_ANNOUNCEMENTS.md # Guia de verificação
│
├── components.json             # Configuração Shadcn/UI
├── tailwind.config.ts         # Configuração Tailwind
├── tsconfig.json              # Configuração TypeScript
├── vite.config.ts             # Configuração Vite
├── package.json               # Dependências e scripts
├── eslint.config.js           # Configuração ESLint
├── postcss.config.js          # Configuração PostCSS
└── README.md                  # Este arquivo
```

### 📊 Estrutura do Banco de Dados (Supabase)

```sql
-- Tabelas principais
auth.users                    # Usuários autenticados (Supabase Auth)
├── id (UUID)
├── email
├── created_at
└── ...

public.users                  # Dados complementares dos usuários
├── id (UUID) → auth.users(id)
├── name
├── role (admin|pastor|coordenador|leader|co_leader)
├── email
├── phone
└── created_at

public.profiles (VIEW)        # View para unir auth.users + public.users

public.members                # Membros dos GC's
├── id (UUID)
├── name
├── email
├── phone
├── gc_code                   # Código do GC
├── leader_id → users(id)     # Líder responsável
├── is_active
└── created_at

public.meetings               # Encontros registrados
├── id (UUID)
├── title
├── date
├── location
├── notes
├── gc_code
├── user_id → users(id)       # Quem registrou
└── created_at

public.meeting_attendances    # Presenças nos encontros
├── id (UUID)
├── meeting_id → meetings(id)
├── member_id → members(id)
├── was_present (boolean)
└── created_at

public.reports                # Relatórios dos líderes
├── id (UUID)
├── title
├── content
├── type (weekly|monthly|special)
├── priority (low|normal|high|urgent)
├── gc_code
├── author_id → users(id)
└── created_at

public.announcements          # Avisos e comunicados
├── id (UUID)
├── title
├── content
├── target_roles (TEXT[])     # Array: ['leader', 'co_leader']
├── priority (low|normal|high|urgent)
├── expires_at
├── is_active
├── created_by → users(id)
├── created_at
└── updated_at
```


---

## ⚙️ Configuração e Instalação

### 📋 Pré-requisitos

- **Node.js** 18+ e npm/bun instalados
- Conta no **[Supabase](https://supabase.com)** (gratuita)
- **Git** instalado

### 🔹 1. Clonar o Repositório

```bash
git clone https://github.com/lucaZz092/Overview_GC.git
cd Overview_GC
```

### 🔹 2. Instalar Dependências

```bash
# Usando npm
npm install

# Ou usando bun (mais rápido)
bun install
```

### 🔹 3. Configurar Supabase

#### 3.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a **URL do projeto** e a **anon key**

#### 3.2 Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

#### 3.3 Executar Scripts SQL

No painel do Supabase, vá em **SQL Editor** e execute os scripts na ordem:

1. **Estrutura básica**: Crie as tabelas `users`, `members`, `meetings`, `meeting_attendances`, `reports`
2. **Adicionar coordenador**: Execute `add_coordenador_role.sql`
3. **Sistema de avisos**: Execute `create_announcements_table.sql`

#### 3.4 Configurar Autenticação

No Supabase Dashboard:
1. Vá em **Authentication → Settings → Email Auth**
2. **Desabilite** "Enable email confirmations" (confirmação automática desativada)
3. Ative **Email** como provider em **Authentication → Providers**
4. Em **URL Configuration**, adicione:
   - Site URL: `http://localhost:5173` (dev) ou sua URL de produção

#### 3.5 Confirmar Emails Existentes (Opcional)

Se já possui usuários cadastrados que precisam ser confirmados:
1. Execute o script `desabilitar_confirmacao_email.sql` no SQL Editor
2. Isso confirmará todos os emails pendentes no sistema

### 🔹 4. Scripts SQL de Configuração

Execute os scripts SQL na seguinte ordem no **SQL Editor** do Supabase:

1. **`fix_role_constraint.sql`** - Adiciona 'coordinator' aos cargos aceitos
2. **`add_phone_column.sql`** - Adiciona coluna de telefone (se necessário)
3. **`fix_users_rls_policies.sql`** - Políticas RLS simplificadas sem recursão
4. **`desabilitar_confirmacao_email.sql`** - Confirma emails existentes
5. **`create_user_admin_function.sql`** - Função para criação de usuários (opcional)

### 🔹 5. Executar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

O app estará disponível em: **http://localhost:5173**

---

## 🎯 Como Usar

### Primeiro Acesso

1. **Cadastre o primeiro usuário** através do formulário de registro
2. Faça login no sistema (sem necessidade de confirmação de e-mail)
3. O primeiro usuário cadastrado tem privilégios administrativos

### 📋 Hierarquia e Permissões por Cargo

#### 🛡️ Administrador (Admin)
**Acesso Total ao Sistema**
- ✅ **Painel Administrativo**: Gerenciamento completo de usuários
  - Criar novos usuários (qualquer cargo)
  - Editar informações de usuários existentes
  - Deletar usuários (com cascata de dados relacionados)
  - Visualizar estatísticas do sistema
- ✅ **Troca de Papel**: Pode assumir qualquer cargo via dropdown para testar funcionalidades
- ✅ **Acesso Universal**: Todas as funcionalidades de Pastor, Coordenador, Líder e Co-Líder
- ✅ **Gestão de Dados**: Acesso completo a relatórios, membros e encontros de todos os GC's
- ✅ **Configurações**: Gerenciamento de configurações globais do sistema

#### 🙏 Pastor / Coordenador
**Visão Executiva e Gerenciamento Global**
- ✅ **Dashboard Executivo**: Métricas e estatísticas de toda a igreja
  - Total de membros, GC's ativos, encontros realizados
  - Taxa de presença média
  - Rankings de desempenho por GC
  - Gráficos e análises comparativas
- ✅ **Relatórios Gerais**: Visualização de todos os relatórios da igreja com filtros avançados
- ✅ **Agenda Completa**: Calendário unificado com todos os encontros programados
- ✅ **Controle de Encontros**: 
  - Monitoramento semáforo (verde/amarelo/vermelho)
  - Identificação de GC's sem registro recente
  - Contato direto com líderes (email/telefone)
  - Estatísticas de registros por período
- ✅ **Sistema de Avisos**: 
  - Criar avisos para líderes, co-líderes ou ambos
  - Definir prioridade (baixa, normal, alta, urgente)
  - Configurar data de expiração
  - Gerenciar histórico de avisos
- ✅ **Gestão de GC's**: Visualização detalhada de cada grupo com breakdown de métricas
- 🚫 **Não pode**: Criar/editar/deletar usuários (somente Admin)

#### 👔 Líder
**Gestão Operacional dos Grupos de Crescimento**
- ✅ **Registrar Encontros**: Criação e edição de encontros dos seus GC's
  - Definir data, horário, local
  - Adicionar observações e tópicos abordados
  - Controle de presença individual
- ✅ **Ver Encontros**: Histórico completo de encontros registrados
- ✅ **Cadastrar Membros**: Adicionar novos membros aos seus GC's
  - Nome, email, telefone
  - Dados de contato e observações
- ✅ **Membros Registrados**: Visualizar lista completa de membros
  - Editar informações
  - Marcar como ativo/inativo
  - Histórico de presença
- ✅ **Meus Relatórios**: Criar e visualizar relatórios periódicos
  - Relatórios semanais, mensais ou especiais
  - Definir prioridade e tipo
- ✅ **Próximos Encontros**: Agenda dos encontros futuros
- ✅ **Meus Grupos**: Visualizar todos os GC's sob sua responsabilidade
- ✅ **Controle de Encontros**: Monitorar status dos registros dos seus GC's
- ✅ **Avisos**: Visualizar avisos direcionados a líderes
- 🚫 **Não pode**: 
  - Acessar dados de outros líderes/GC's
  - Criar usuários ou gerenciar permissões
  - Ver relatórios globais ou dashboard executivo

#### 🤝 Co-Líder
**Apoio Operacional ao Líder**
- ✅ **Registrar Encontros**: Criação de encontros do seu GC específico
  - Mesmas funcionalidades do líder, mas limitado a 1 GC
- ✅ **Ver Encontros**: Histórico do seu grupo
- ✅ **Cadastrar Membros**: Adicionar membros ao seu GC
- ✅ **Membros Registrados**: Gerenciar membros do grupo
- ✅ **Meus Relatórios**: Criar relatórios do seu GC
- ✅ **Próximos Encontros**: Agenda do grupo
- ✅ **Meu Grupo**: Visualizar dados do GC atribuído
- ✅ **Avisos**: Visualizar avisos direcionados a co-líderes
- 🚫 **Não pode**: 
  - Gerenciar múltiplos GC's
  - Acessar dados de outros grupos
  - Acessar funcionalidades administrativas ou executivas

### 🔄 Fluxo de Trabalho Recomendado

1. **Admin cria usuários** via Painel Administrativo
2. **Líderes e Co-Líderes cadastram membros** nos seus GC's
3. **Registram encontros** semanais com controle de presença
4. **Criam relatórios periódicos** (semanal/mensal)
5. **Pastor/Coordenador monitora** via Dashboard Executivo e Controle de Encontros
6. **Pastor/Coordenador publica avisos** para comunicação rápida
7. **Líderes visualizam avisos** e tomam ações necessárias

---

## 🔒 Segurança e RLS (Row Level Security)

O sistema utiliza **Row Level Security** do Supabase para garantir que:

- ✅ Usuários só veem dados dos seus próprios GC's
- ✅ Líderes têm acesso apenas aos grupos sob sua responsabilidade
- ✅ Pastores/Coordenadores veem dados globais
- ✅ Avisos são filtrados por cargo automaticamente
- ✅ Políticas SQL impedem acesso não autorizado

### Exemplo de Policy RLS

```sql
-- Líderes só veem membros dos seus GC's
CREATE POLICY "Leaders see only their members"
  ON public.members
  FOR SELECT
  USING (
    leader_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'pastor', 'coordenador')
    )
  );
```

---

## 🎨 Personalização e Tema

O projeto usa um sistema de cores baseado em **CSS Variables**:

```css
/* src/index.css */
:root {
  --primary: 252 75% 60%;        /* Roxo principal */
  --secondary: 240 75% 65%;      /* Azul secundário */
  --accent: 335 75% 65%;         /* Rosa/Magenta */
  --background: 0 0% 100%;       /* Branco */
  --foreground: 222.2 47.4% 11.2%; /* Texto escuro */
}
```

### Gradientes Customizados

```css
.bg-gradient-hero {
  background: linear-gradient(135deg, hsl(252 75% 60%), hsl(240 75% 65%));
}

.bg-gradient-card {
  background: linear-gradient(to bottom right, 
    rgba(139, 92, 246, 0.05), 
    rgba(96, 165, 250, 0.05)
  );
}
```

---

## 📦 Deploy em Produção

### Opção 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
3. Atualize as Redirect URLs no Supabase para o domínio de produção

### Opção 2: Netlify

1. Conecte o repositório no [Netlify](https://netlify.com)
2. Configure build command: `npm run build`
3. Publish directory: `dist`
4. Adicione variáveis de ambiente
5. Configure redirects em `netlify.toml`

### Opção 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

---

## 🧪 Testes e Qualidade

### Verificar Tipos TypeScript

```bash
npm run type-check
```

### Lint do Código

```bash
npm run lint
```

### Build de Produção

```bash
npm run build
```

---

## 🐛 Troubleshooting

### Erro: "Table 'announcements' does not exist"
**Solução**: Execute o script `create_announcements_table.sql` no SQL Editor do Supabase

### Erro: "Invalid API key"
**Solução**: Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas no `.env.local`

### Erro: "Email rate limit exceeded"
**Solução**: 
1. Desabilite confirmação de email no Supabase Dashboard
2. Execute `desabilitar_confirmacao_email.sql`
3. A aplicação já está configurada para não enviar emails de confirmação

### Erro: "Infinite recursion detected in policy"
**Solução**: Execute o script `fix_users_rls_policies.sql` que contém políticas RLS simplificadas

### Erro: "Role 'coordinator' violates check constraint"
**Solução**: Execute `fix_role_constraint.sql` para adicionar 'coordinator' aos cargos aceitos

### Erro: "Column 'phone' does not exist"
**Solução**: Execute `add_phone_column.sql` para adicionar a coluna

### Erro: "New row violates RLS policy"
**Solução**: 
1. Execute `fix_users_rls_policies.sql`
2. Use o script `atualizar_usuario_existente.sql` para criar usuários via SQL

### TypeScript Errors em Avisos
**Solução**: Após criar a tabela no Supabase, os tipos serão regenerados automaticamente. Se persistir, restart o dev server.

---

## 🚀 Roadmap

### ✅ Implementado
- [x] Sistema de autenticação sem confirmação de email
- [x] Validação de senha forte com confirmação
- [x] Hierarquia de cargos (5 níveis: Admin, Pastor, Coordenador, Líder, Co-Líder)
- [x] Dashboard personalizado por role
- [x] Registro de encontros e presença
- [x] Gestão de membros
- [x] Relatórios gerenciais
- [x] Sistema de avisos e comunicados
- [x] Agenda completa
- [x] Dashboard executivo com métricas
- [x] Líderes podem registrar encontros
- [x] Painel Administrativo completo (CRUD de usuários)
- [x] Sistema de Controle de Encontros (semáforo verde/amarelo/vermelho)
- [x] Scripts SQL para manutenção e troubleshooting
- [x] Políticas RLS otimizadas

### 🔄 Em Desenvolvimento
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos avançados com Chart.js
- [ ] Modo escuro (Dark Mode)
- [ ] Sistema de notificações em tempo real
- [ ] Dashboard mobile otimizado

### 📅 Planejado
- [ ] Integração com Google Calendar
- [ ] Sistema de mensagens entre líderes
- [ ] Backup automático de dados
- [ ] API REST documentada
- [ ] Webhooks para integrações
- [ ] Multi-tenancy (múltiplas igrejas)
- [ ] App mobile nativo (React Native)
- [ ] Relatórios personalizáveis com templates

---

## 👥 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade X'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Atualização de dependências, configs, etc

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

**Lucas Mendonça**  
GitHub: [@lucaZz092](https://github.com/lucaZz092)  
Projeto: [Overview GC](https://github.com/lucaZz092/Overview_GC)

---

## 🙏 Agradecimentos

- **Supabase** pela plataforma incrível
- **Shadcn/UI** pelos componentes de alta qualidade
- **Vercel** pelo Vite e hospedagem
- Comunidade open-source

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!**