# 📧 Configuração de Redirecionamento de Email

## ⚙️ Configurar URLs no Supabase Dashboard

### **Passo 1: Acessar URL Configuration**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Overview_GC**
3. Vá em **Authentication → URL Configuration**

---

### **Passo 2: Configurar Site URL**

No campo **"Site URL"**, coloque:

```
https://seu-dominio.vercel.app
```

**Exemplo:**
```
https://overview-gc.vercel.app
```

---

### **Passo 3: Adicionar Redirect URLs**

No campo **"Redirect URLs"**, adicione estas URLs (uma por linha):

**Produção (Vercel):**
```
https://seu-dominio.vercel.app
https://seu-dominio.vercel.app/login
https://seu-dominio.vercel.app/confirm-email
```

**Desenvolvimento Local:**
```
http://localhost:8080
http://localhost:8080/login
http://localhost:8080/confirm-email
http://localhost:8081
http://localhost:8081/login
http://localhost:8081/confirm-email
```

---

### **Passo 4: Personalizar Template de Email**

1. Ainda no **Authentication**, vá em **Email Templates**
2. Selecione **"Confirm signup"**
3. Modifique o template:

**Encontre esta linha:**
```html
<a href="{{ .ConfirmationURL }}">Confirm your mail</a>
```

**Substitua por:**
```html
<a href="{{ .SiteURL }}/confirm-email?token_hash={{ .TokenHash }}&type=signup">Confirmar Email</a>
```

4. Clique em **Save**

---

### **Passo 5: Configurar Redirect To (Opcional)**

No campo **"Redirect To"** (se disponível), coloque:
```
/confirm-email
```

Isso garante que após a confirmação, o usuário seja direcionado para a página customizada.

---

## ✅ Como Funciona Agora

1. **Usuário se registra** → Recebe email de confirmação
2. **Clica no link** → Vai para `/confirm-email`
3. **Página processa** → Verifica o token
4. **Sucesso** → Mostra ✅ e redireciona para `/login` em 2 segundos
5. **Erro** → Mostra ❌ com botão para ir ao login manualmente

---

## 🎨 Página de Confirmação Criada

A página `/confirm-email` tem:
- ✅ **Loading** → Animação de spinner enquanto verifica
- ✅ **Sucesso** → Ícone verde + redirecionamento automático
- ✅ **Erro** → Ícone vermelho + botão para login manual
- ✅ **Design consistente** → Mesma identidade visual da aplicação

---

## 🔍 Testar a Configuração

1. Crie uma nova conta de teste
2. Verifique o email recebido
3. Clique no link de confirmação
4. Deve abrir `seu-dominio.vercel.app/confirm-email`
5. Após confirmação, redireciona para `/login`

---

## 🚨 Importante

- **Aplique as configurações AGORA** para que os próximos emails já usem as URLs corretas
- Emails já enviados ainda terão a URL antiga
- A mudança é imediata, sem necessidade de redeploy

---

## 📝 URLs Finais Configuradas

Depois de configurar, suas URLs devem ser:

**Site URL:**
```
https://seu-dominio.vercel.app
```

**Redirect URLs:**
```
https://seu-dominio.vercel.app
https://seu-dominio.vercel.app/login
https://seu-dominio.vercel.app/confirm-email
http://localhost:8080
http://localhost:8080/login
http://localhost:8080/confirm-email
http://localhost:8081
http://localhost:8081/login
http://localhost:8081/confirm-email
```

---

✅ **Pronto!** Após essas configurações, todos os novos usuários serão redirecionados corretamente! 🎉
