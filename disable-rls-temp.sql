-- TEMPORÁRIO: Desabilitar RLS para testes
-- Execute no Supabase SQL Editor:

-- Desabilitar RLS temporariamente
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- Verificar o status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'members';