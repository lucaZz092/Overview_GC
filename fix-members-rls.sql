-- ============================================
-- CONFIGURAÇÃO DAS POLÍTICAS RLS PARA MEMBERS
-- ============================================
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos remover políticas existentes se houver
DROP POLICY IF EXISTS "members_select_policy" ON public.members;
DROP POLICY IF EXISTS "members_insert_policy" ON public.members;
DROP POLICY IF EXISTS "members_update_policy" ON public.members;
DROP POLICY IF EXISTS "members_delete_policy" ON public.members;

-- 2. Criar políticas mais permissivas para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON public.members
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.members
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.members
    FOR DELETE USING (true);

-- 3. Habilitar RLS na tabela
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se a tabela está configurada corretamente
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    tableowner 
FROM pg_tables 
WHERE tablename = 'members';

-- 5. Listar políticas ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'members';