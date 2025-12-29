-- Script de emergência: Desabilitar RLS completamente para testar

-- Opção 1: DESABILITAR RLS COMPLETAMENTE (temporário para teste)
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- Verificar constraints da tabela
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.announcements'::regclass;

-- Verificar colunas NOT NULL
SELECT 
  column_name,
  is_nullable,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'announcements'
ORDER BY ordinal_position;

-- Teste de inserção manual (substitua os valores)
-- Copie o UUID do usuário logado e teste:
/*
INSERT INTO public.announcements (
  title,
  content,
  target_roles,
  priority,
  created_by,
  is_active
) VALUES (
  'Teste Manual',
  'Conteúdo de teste',
  ARRAY['leader', 'co_leader'],
  'normal',
  'SEU_USER_ID_AQUI', -- Substitua pelo seu UUID
  true
);
*/

-- Verificar se o insert funcionou
SELECT * FROM public.announcements ORDER BY created_at DESC LIMIT 3;
