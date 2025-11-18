# 📊 Overview GC - Sistema de Gestão de Grupos de Crescimento

Sistema completo para gerenciamento de **Grupos de Crescimento (GC's)** de igrejas, com controle hierárquico de usuários, gestão de membros, registro de encontros, relatórios gerenciais e sistema de comunicação interna.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação e Permissões
- **Autenticação via Supabase** com confirmação de e-mail
- **Hierarquia de cargos**: Admin → Pastor/Coordenador → Líder → Co-Líder
- **Permissões personalizadas** por nível de acesso
- **Reset de senha** com validação de força
- **Proteção de rotas** baseada em roles

### 👥 Gestão de Membros
- Cadastro completo de membros dos GC's
- Vinculação de membros a grupos específicos
- Histórico de participação em encontros
- Visualização filtrada por grupo e líder

### 📅 Registro de Encontros
- Registro detalhado de encontros dos GC's
- **Controle de presença** com lista de membros
- Informações de data, horário, local e observações
- Histórico completo de encontros por grupo
- **Líderes agora podem registrar encontros** dos seus grupos

### 📈 Relatórios e Dashboard

#### Para Líderes e Co-Líderes:
- Dashboard com estatísticas do próprio GC
- Visualização de encontros registrados
- Lista de membros cadastrados
- Acesso aos próprios relatórios

#### Para Pastores e Coordenadores:
- **Relatórios Gerais**: Visualização de todos os relatórios da igreja com filtros
- **Agenda Completa**: Calendário unificado de todos os encontros programados
- **Gestão Geral**: Dashboard executivo com:
  - Estatísticas globais (membros, grupos, encontros, frequência)
  - Breakdown por GC com métricas individuais
  - Rankings por desempenho (membros, encontros, presença)
  - Análise comparativa entre grupos

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
│   │   └── Avisos.tsx              # Gestão de avisos (Pastor/Coord)
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
├── Scripts SQL/                # Scripts de banco de dados
│   ├── add_coordenador_role.sql          # Adiciona cargo de coordenador
│   ├── create_announcements_table.sql    # Cria tabela de avisos
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
1. Vá em **Authentication → Providers**
2. Ative **Email** como provider
3. Configure **Email Templates** (opcional)
4. Em **URL Configuration**, adicione:
   - Site URL: `http://localhost:5173` (dev) ou sua URL de produção
   - Redirect URLs: 
     - `http://localhost:5173/confirm-email`
     - `http://localhost:5173/reset-password`

#### 3.5 Configurar SMTP (Opcional, mas recomendado)

Para envio real de e-mails:
1. No Supabase: **Project Settings → Auth → SMTP Settings**
2. Configure com provedor (Gmail, SendGrid, etc.)
3. Teste enviando um e-mail de confirmação

### 🔹 4. Executar o Projeto

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

1. **Cadastre o primeiro usuário** (será admin automaticamente)
2. Confirme o e-mail através do link enviado
3. Faça login no sistema

### Fluxo de Trabalho

#### 👤 Admin
- Pode assumir qualquer papel do sistema via dropdown
- Gerencia usuários e permissões
- Acessa todas as funcionalidades

#### 🙏 Pastor / Coordenador
- Visualiza relatórios de todos os GC's
- Acessa agenda completa da igreja
- Gerencia dashboard executivo com métricas globais
- **Cria e gerencia avisos** para líderes
- Acompanha rankings de desempenho

#### 👔 Líder
- Gerencia múltiplos grupos de crescimento
- **Registra encontros** dos seus GC's
- Cadastra membros
- Controla presença
- Gera relatórios
- **Visualiza avisos** direcionados a líderes

#### 🤝 Co-Líder
- Gerencia um grupo específico
- **Registra encontros** do seu GC
- Cadastra membros
- Controla presença
- **Visualiza avisos** direcionados a co-líderes

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

### Erro: "Not receiving confirmation emails"
**Solução**: Configure SMTP no Supabase (Project Settings → Auth → SMTP Settings)

### TypeScript Errors em Avisos
**Solução**: Após criar a tabela no Supabase, os tipos serão regenerados automaticamente. Se persistir, restart o dev server.

---

## 🚀 Roadmap

### ✅ Implementado
- [x] Sistema de autenticação completo
- [x] Hierarquia de cargos (4 níveis)
- [x] Dashboard personalizado por role
- [x] Registro de encontros e presença
- [x] Gestão de membros
- [x] Relatórios gerenciais
- [x] Sistema de avisos e comunicados
- [x] Agenda completa
- [x] Dashboard executivo com métricas
- [x] Líderes podem registrar encontros

### 🔄 Em Desenvolvimento
- [ ] Sistema de notificações push
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos avançados com Chart.js
- [ ] Modo escuro (Dark Mode)
- [ ] App mobile (React Native)

### 📅 Planejado
- [ ] Integração com Google Calendar
- [ ] Sistema de mensagens entre líderes
- [ ] Backup automático de dados
- [ ] API REST documentada
- [ ] Webhooks para integrações
- [ ] Multi-tenancy (múltiplas igrejas)

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