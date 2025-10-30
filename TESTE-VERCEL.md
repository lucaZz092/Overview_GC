# 🚀 **TESTE NA VERCEL - Sistema de Links Temporários**

## 🌐 **Testando em Produção**

Agora que o sistema está hospedado na Vercel, vamos validar o funcionamento completo em ambiente de produção.

### 🔍 **Checklist para Teste na Vercel:**

#### ✅ **Pré-requisitos:**
- [ ] **App deployado** na Vercel
- [ ] **Variáveis de ambiente** configuradas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] **Banco Supabase** operacional
- [ ] **Tabelas criadas** e RLS configurado

#### 🧪 **Fluxo de Teste Completo:**

### **1. Acesso Inicial**
```
https://your-app.vercel.app
```
- [ ] **Site carrega** corretamente
- [ ] **Tela de login** aparece
- [ ] **Console sem erros** críticos

### **2. Criar Primeiro Admin**
```sql
-- No Supabase Dashboard > SQL Editor
-- Após registrar o primeiro usuário:
UPDATE users SET role='admin' WHERE email='seu@email.com';
```

### **3. Login como Admin**
- [ ] **Fazer login** com usuário admin
- [ ] **Tela de seleção** de papel aparece
- [ ] **Selecionar "Pastor"** ou outro papel
- [ ] **Dashboard carrega** corretamente

### **4. Teste de Geração de Links**
- [ ] **Clicar em "Links de Convite"**
- [ ] **Interface carrega** sem erros
- [ ] **Clicar "Gerar Link para Pastor"**
- [ ] **Toast aparece** com sucesso
- [ ] **Link é copiado** ou mostrado
- [ ] **Código aparece** na lista histórico

### **5. Teste do Link Gerado**
- [ ] **Copiar o link** gerado
- [ ] **Abrir aba anônima** (ou outro navegador)
- [ ] **Colar o link** (formato: `https://your-app.vercel.app/registro?code=PASTOR-xxxxx`)
- [ ] **Página de registro** carrega
- [ ] **Badge "Pastor"** aparece pré-definido
- [ ] **Preenchir dados** e registrar
- [ ] **Email de confirmação** enviado

### **6. Validação Final**
- [ ] **Confirmar email** do novo usuário
- [ ] **Fazer login** com novo usuário
- [ ] **Dashboard específico** do papel carrega
- [ ] **Código marcado** como "usado" no histórico admin

## 🔧 **Possíveis Problemas e Soluções:**

### ❌ **"Cannot read properties of undefined (reading 'writeText')"**
- **Causa:** Clipboard API não funciona em HTTP
- **Solução:** ✅ Já implementado fallback no código

### ❌ **"Network Error" ou "CORS"**
- **Causa:** Configuração Supabase
- **Solução:** Verificar URL e API keys nas env vars

### ❌ **"RLS Policy Violation"**
- **Causa:** Usuário não é admin
- **Solução:** Executar SQL para promover usuário

### ❌ **"Table doesn't exist"**
- **Causa:** Schema não executado
- **Solução:** Executar `supabase-schema.sql` e `invitation-codes-schema.sql`

## 📱 **URLs para Testar:**

### **Fluxo Normal:**
```
https://your-app.vercel.app/
https://your-app.vercel.app/registro
```

### **Fluxo com Código:**
```
https://your-app.vercel.app/registro?code=PASTOR-1698765432-abc123
```

## 🎯 **Métricas de Sucesso:**

- ✅ **Login admin** funciona
- ✅ **Geração de links** sem erro
- ✅ **Links com expiração** de 30min
- ✅ **Registro via link** automático  
- ✅ **Papel definido** corretamente
- ✅ **Código usado** apenas uma vez

## 🚀 **Comandos Úteis para Debug:**

### **Verificar Logs Vercel:**
```bash
vercel logs your-app-url
```

### **Testar Supabase Connection:**
```javascript
// No Console do navegador
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
```

### **Verificar Estado do Código:**
```sql
-- No Supabase Dashboard
SELECT * FROM invitation_codes 
ORDER BY created_at DESC 
LIMIT 10;
```

## 📞 **Suporte:**

Se encontrar algum problema durante o teste na Vercel:

1. **Verificar Console** do navegador
2. **Checar Network Tab** para erros de API
3. **Validar variáveis** de ambiente
4. **Confirmar schema** do banco

**O sistema está pronto para funcionar perfeitamente na Vercel!** 🎉

---
**Status: ✅ PRONTO PARA TESTE EM PRODUÇÃO**