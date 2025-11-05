# 🚨 INSTRUÇÕES URGENTES - RESOLVER ERRO NO VERCEL

## ❌ Erro Atual:
```
Could not find the table 'public.profiles' in the schema cache
```

## ✅ Solução em 3 Passos:

---

### **PASSO 1: Abrir Supabase SQL Editor**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Overview_GC**
3. No menu lateral esquerdo, clique em **"SQL Editor"**
4. Clique em **"New query"** (botão azul no topo)

---

### **PASSO 2: Copiar e Executar o Script**

1. Abra o arquivo `create_profiles_view.sql` (na raiz deste projeto)
2. **Copie TUDO** (Cmd+A → Cmd+C)
3. **Cole no SQL Editor** do Supabase (Cmd+V)
4. Clique no botão **"Run"** (canto inferior direito)
5. Aguarde aparecer: ✅ **"Success. No rows returned"**

---

### **PASSO 3: Validar a VIEW**

No mesmo SQL Editor, execute esta query:

```sql
SELECT * FROM public.profiles LIMIT 5;
```

**Deve retornar seus usuários!** Se retornar dados, está funcionando! ✅

---

## 🔄 Após Executar:

1. O Vercel vai automaticamente usar a VIEW `profiles`
2. Aguarde 1-2 minutos para o cache limpar
3. Recarregue a página do Vercel
4. O erro deve sumir! 🎉

---

## ⚠️ SE AINDA DER ERRO:

Execute também no SQL Editor:

```sql
NOTIFY pgrst, 'reload schema';
```

Isso força o reload do cache do PostgREST.

---

## 📞 Precisa de Ajuda?

Me avise depois de executar o script SQL e diga:
- ✅ "Deu certo, retornou Success"
- ❌ "Deu erro, a mensagem foi: [cole a mensagem]"
