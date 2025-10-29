# 🔐 Configuração do Sistema de Autenticação - Overview GC

## 📋 Passo a Passo Completo

### **1. Execute o Schema Principal**
No painel do Supabase (SQL Editor), execute todo o conteúdo do arquivo `supabase-schema.sql`

### **2. Configure a Autenticação no Supabase**
1. Vá em **Authentication** → **Settings**
2. Configure:
   - **Enable email confirmations**: ✅ Habilitado (recomendado)
   - **Site URL**: `http://localhost:8080` (desenvolvimento)
   - **Redirect URLs**: Adicione `http://localhost:8080/**` 

### **3. Crie a Conta de Administrador**
1. **Opção A - Via Interface:**
   - Acesse http://localhost:8080/registro
   - Registre-se com o email: `admin@gcoverview.com`
   - Use uma senha forte
   - Nome: "Administrador"

2. **Opção B - Via SQL (após criar a conta):**
   - Execute o arquivo `create-admin-user.sql` no SQL Editor

### **4. Verificar se Tudo Funcionou**
Execute no SQL Editor para verificar:
```sql
SELECT id, email, name, role, is_active, created_at 
FROM public.users 
WHERE email = 'admin@gcoverview.com';
```

### **5. Teste o Sistema**
1. **Login como Admin:**
   - Email: `admin@gcoverview.com`
   - Senha: (que você criou)
   - Deve aparecer badge "Administrador"

2. **Criar outros usuários:**
   - Registre outras contas pelo `/registro`
   - Por padrão, novos usuários são "member"

## 🎯 **Funcionalidades Implementadas**

### **✅ Sistema de Autenticação:**
- ✅ Login com email/senha
- ✅ Registro de novos usuários
- ✅ Logout funcional
- ✅ Proteção de rotas
- ✅ Estados de loading

### **✅ Sistema de Roles:**
- 🔴 **Admin**: Acesso total ao sistema
- 🔵 **Leader**: Pode gerenciar membros e reuniões
- ⚪ **Member**: Acesso básico

### **✅ Interface Atualizada:**
- ✅ Dashboard mostra role do usuário
- ✅ Badge colorido por tipo de usuário
- ✅ Nome do usuário no header
- ✅ Email visível no header

## 🔧 **Como Usar o Sistema**

### **Para Administradores:**
- Acesso completo a todos os recursos
- Pode gerenciar todos os membros
- Pode ver relatórios de todos os grupos

### **Para Líderes:**
- Pode registrar membros
- Pode criar reuniões
- Pode gerar relatórios de seu grupo

### **Para Membros:**
- Acesso de visualização
- Pode ver informações básicas

## 🛡️ **Segurança Implementada**

1. **Row Level Security (RLS)** habilitado em todas as tabelas
2. **Políticas de acesso** por role de usuário
3. **Validação de email** no registro
4. **Senhas mínimas** de 6 caracteres
5. **Tokens JWT** do Supabase para sessões

## 🚨 **Troubleshooting**

### **Problema: "User not found" após registro**
**Solução**: Verifique se confirmou o email ou desabilite confirmação em Auth Settings

### **Problema: Role não aparece corretamente**
**Solução**: Execute o script `create-admin-user.sql` após criar a conta

### **Problema: Erro de permissão**
**Solução**: Verifique se RLS está configurado corretamente

## 📱 **Próximos Passos**

1. **Execute o schema** no Supabase
2. **Crie a conta admin**
3. **Teste o login/logout**
4. **Crie contas de teste** para diferentes roles
5. **Comece a usar o sistema!**

## 🎉 **Sistema Pronto!**

Agora você tem um sistema completo de autenticação com:
- ✅ Login seguro
- ✅ Controle de acesso por roles  
- ✅ Interface moderna
- ✅ Banco de dados estruturado

**Só falta executar o schema no Supabase e começar a usar!** 🚀