# Verificação da Tabela Announcements

## Passo 1: Verificar se a tabela existe

Execute no **SQL Editor do Supabase**:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'announcements';
```

### Resultado esperado:
- Se retornar uma linha com "announcements", a tabela existe ✅
- Se retornar vazio, a tabela NÃO existe ❌

---

## Passo 2: Se a tabela NÃO existir, crie-a

Cole e execute TODO o conteúdo do arquivo `create_announcements_table.sql` no SQL Editor.

---

## Passo 3: Verificar estrutura da tabela

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'announcements' 
AND table_schema = 'public';
```

### Resultado esperado:
Deve listar estas colunas:
- id (uuid)
- title (text)
- content (text)
- target_roles (ARRAY)
- priority (text)
- created_by (uuid)
- created_at (timestamp with time zone)
- expires_at (timestamp with time zone)
- is_active (boolean)
- updated_at (timestamp with time zone)

---

## Passo 4: Testar inserção manual

```sql
INSERT INTO public.announcements (
  title,
  content,
  target_roles,
  priority,
  created_by,
  is_active
) VALUES (
  'Teste de Aviso',
  'Este é um teste para verificar se a tabela está funcionando',
  ARRAY['leader', 'co_leader'],
  'normal',
  auth.uid(),
  true
);

-- Verificar se foi inserido
SELECT * FROM public.announcements;
```

---

## Passo 5: Verificar políticas RLS

```sql
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'announcements';
```

### Resultado esperado:
Deve listar 4 políticas:
1. Users can view active announcements for their role (SELECT)
2. Pastors and coordinators can create announcements (INSERT)
3. Pastors and coordinators can update their announcements (UPDATE)
4. Pastors and coordinators can delete announcements (DELETE)

---

## Problemas Comuns:

### ❌ Erro: "relation announcements does not exist"
**Solução:** Execute o script `create_announcements_table.sql` no SQL Editor

### ❌ Erro: "permission denied for table announcements"
**Solução:** Verifique se as políticas RLS foram criadas corretamente

### ❌ Erro ao inserir: "new row violates check constraint"
**Solução:** Verifique se os valores de `priority` estão corretos (low, normal, high, urgent)

### ❌ Avisos não aparecem no app
**Solução:** 
1. Verifique se você está logado como pastor/coordenador
2. Abra o console do navegador (F12) e veja se há erros
3. Verifique se a tabela foi criada no schema `public`
