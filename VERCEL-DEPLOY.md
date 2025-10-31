# 🔧 Instruções para Deploy no Vercel

## Problema: Tela Branca no Vercel

Se você está vendo uma tela branca quando acessa a aplicação no Vercel, siga estes passos:

### 1. ✅ Verificar Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e configure:

```bash
VITE_SUPABASE_URL=https://ocgmsuenqyfebkrqcmjn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njc4OTgsImV4cCI6MjA3NzM0Mzg5OH0.Q25qhlkdNvINmyNUpq2OwW2Co4hBpVtOXxFTEXGGZZY
```

**⚠️ IMPORTANTE:** 
- Marque ambas as variáveis para **Production**, **Preview** e **Development**
- Clique em **Save** após adicionar cada variável

### 2. 🔄 Forçar Novo Deploy

Após configurar as variáveis:

1. Vá na aba **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Selecione **Redeploy**
4. Marque **"Use existing Build Cache"** como **False**
5. Clique em **Redeploy**

### 3. 🔍 Verificar Deploy

Quando o deploy terminar:

1. Acesse sua URL do Vercel
2. Se ainda estiver com tela branca, abra o **Console do Navegador** (F12)
3. Procure por erros JavaScript

### 4. 🆘 Página de Diagnóstico

Se você ver a página de diagnóstico em vez da aplicação normal, significa que:

- ✅ A aplicação está funcionando
- ❌ As variáveis de ambiente não estão sendo carregadas corretamente

Neste caso, repita o passo 1 e certifique-se de que as variáveis estão marcadas para **Production**.

### 5. 📱 Teste Local

Para testar localmente se está tudo certo:

```bash
npm run build
npm run preview
```

Se funcionar localmente mas não no Vercel, o problema são definitivamente as variáveis de ambiente.

---

## 🔗 Links Úteis

- **Painel Vercel:** https://vercel.com/dashboard
- **Documentação Vercel Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Supabase Dashboard:** https://supabase.com/dashboard

## 📞 Suporte

Se ainda estiver com problemas:

1. Verifique o console do navegador
2. Verifique os logs de build no Vercel
3. Certifique-se de que as credenciais do Supabase estão corretas