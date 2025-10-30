# 🚀 Sistema GC Overview - Links de Convite Temporários

Sistema completo de gerenciamento de Grupos de Crescimento com sistema avançado de convites por links temporários.

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Login e registro com Supabase Auth
- Confirmação por email
- Hierarquia de papéis: Admin → Pastor → Líder → Co-Líder
- Seleção de papel para admins

### ✅ Sistema de Links de Convite (Novo!)
- **Admin pode gerar links temporários** para qualquer papel
- **Links expiram em 30 minutos** por segurança
- **Cada link pode ser usado apenas uma vez**
- **Interface intuitiva** para gerar e gerenciar links
- **Histórico completo** de links gerados
- **Auto-copy** do link gerado para área de transferência

### ✅ Dashboard Dinâmico
- Interface específica para cada papel
- Estatísticas em tempo real
- Navegação intuitiva
- Área administrativa completa

## 🔧 Como Usar o Sistema de Links

### Para Administradores:

1. **Faça login** com sua conta admin
2. **Selecione o papel** para a sessão atual
3. **Acesse "Links de Convite"** no dashboard
4. **Clique em "Gerar Link"** para o papel desejado:
   - 🙏 **Pastor**: Acesso completo ao sistema
   - 👑 **Líder**: Gerencia grupos e relatórios  
   - 🤝 **Co-Líder**: Auxilia na gestão do grupo
5. **Link é copiado automaticamente** para área de transferência
6. **Compartilhe o link** com a pessoa que deve se registrar

### Para Novos Usuários:

1. **Receba o link** do administrador
2. **Clique no link** (será direcionado para tela de registro)
3. **Preencha os dados** (papel já está definido pelo link)
4. **Confirme o email** após registro
5. **Faça login** e acesse o sistema com o papel correto

## 🗄️ Banco de Dados

### Schema Principal (supabase-schema.sql)
```sql
-- Tabelas: users, members, meetings, reports
-- RLS policies para segurança
-- Triggers para timestamps automáticos
```

### Schema de Tokens (invitation-tokens-schema.sql)
```sql
-- Tabela: invitation_tokens
-- Funções: generate_invitation_token, use_invitation_token
-- Limpeza automática de tokens expirados
```

### ⚠️ IMPORTANTE: Execute os schemas no Supabase

1. **Acesse:** https://supabase.com/dashboard
2. **Vá em:** SQL Editor
3. **Execute primeiro:** `supabase-schema.sql`
4. **Execute depois:** `invitation-tokens-schema.sql`

## 🎨 Interface do Sistema

### Geração de Links
- **Cards visuais** para cada papel
- **Status em tempo real** (ativo, expirado, usado)
- **Contagem regressiva** para expiração
- **Histórico completo** dos últimos 50 links

### Registro por Token
- **Validação automática** do link
- **Visual diferenciado** para registro via convite
- **Papel pré-definido** e não editável
- **Feedback visual** do token válido

### Dashboard Administrativo
- **Estatísticas por papel**
- **Ações específicas** para cada nível
- **Interface limpa** e intuitiva

## 🔐 Segurança

### Links Temporários
- ⏰ **Expirações em 30 minutos**
- 🔒 **Tokens únicos** (SHA256 hash)
- 🚫 **Uso único** por link
- 🗑️ **Limpeza automática** de tokens expirados

### Controle de Acesso
- 👤 **Apenas admins** podem gerar links
- 🔐 **Row Level Security** no banco
- 🎯 **Papéis bem definidos**
- 📊 **Auditoria completa** de uso

### Validações
- ✅ **Token existe e é válido**
- ✅ **Não está expirado**
- ✅ **Não foi usado antes**
- ✅ **Usuário tem permissão**

## 🚀 Como Executar

### Pré-requisitos
```bash
# Node.js 18+
# Conta no Supabase
# Bun ou npm
```

### Instalação
```bash
# Clone o projeto
git clone <repo-url>
cd Overview_GC

# Instale dependências
npm install

# Configure variáveis de ambiente
# Crie .env.local com:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Execute os schemas no Supabase

# Inicie o projeto
npm run dev
```

### Acesso
- **URL:** http://localhost:8082
- **Login Admin:** Use email que tenha role='admin' no banco
- **Primeiro Admin:** Execute SQL: `UPDATE users SET role='admin' WHERE email='seu@email.com'`

## 📱 Fluxo Completo

### 1. Setup Inicial
```sql
-- No Supabase SQL Editor
UPDATE users SET role='admin' WHERE email='admin@igreja.com';
```

### 2. Admin Gera Link
- Login → Selecionar papel → Links de Convite
- Clicar em "Gerar Link para Pastor/Líder/Co-Líder"
- Link copiado automaticamente

### 3. Novo Usuário Se Registra
- Acessar link → Preencher dados → Confirmar email
- Login automático com papel correto

### 4. Gestão Contínua
- Admin monitora links ativos
- Histórico de uso disponível
- Limpeza automática de expirados

## 🎯 Vantagens do Sistema

### Para Administradores
- ✅ **Controle total** sobre convites
- ✅ **Segurança máxima** com expiração
- ✅ **Interface intuitiva** para gestão
- ✅ **Histórico completo** de ações

### Para Usuários
- ✅ **Processo simples** de registro
- ✅ **Papel já definido** automaticamente
- ✅ **Sem códigos complicados**
- ✅ **Link direto** para registro

### Para o Sistema
- ✅ **Alta segurança** com tokens únicos
- ✅ **Performance otimizada** com índices
- ✅ **Auditoria completa** de ações
- ✅ **Manutenção automática** de limpeza

## 🔧 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Estado:** Context API + Custom hooks
- **Segurança:** JWT + Row Level Security + Token expiry

## 📞 Suporte

Sistema desenvolvido para gerenciamento completo de Grupos de Crescimento com foco em:
- **Segurança máxima**
- **Usabilidade intuitiva** 
- **Controle administrativo**
- **Auditoria completa**

---
**Status:** ✅ Pronto para produção
**Versão:** 2.0 - Sistema de Links Temporários