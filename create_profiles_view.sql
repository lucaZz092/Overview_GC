-- ============================================
-- SOLUÇÃO: Criar VIEW 'profiles' apontando para 'users'
-- ============================================
-- Este script resolve o erro "Could not find table 'public.profiles'"
-- criando uma VIEW que espelha a tabela 'users' existente.
--
-- INSTRUÇÕES:
-- 1. Copie todo este script
-- 2. Abra o Supabase SQL Editor (https://supabase.com/dashboard)
-- 3. Cole o script e execute (Run)
-- 4. Aguarde confirmação "Success"
-- 5. Faça novo deploy no Vercel
-- ============================================

-- Criar VIEW 'profiles' como alias da tabela 'users'
CREATE OR REPLACE VIEW public.profiles AS 
SELECT 
    id,
    created_at,
    updated_at,
    email,
    name,
    role,
    is_active,
    grupo_crescimento
FROM public.users;

-- Comentário descritivo da VIEW
COMMENT ON VIEW public.profiles IS 'View que espelha a tabela users para compatibilidade com código que busca profiles';

-- ============================================
-- POLÍTICAS RLS PARA A VIEW 'profiles'
-- ============================================
-- As views herdam as políticas da tabela base,
-- mas vamos garantir acesso explícito

-- Permitir que usuários vejam seu próprio perfil através da view
CREATE POLICY "Users can view their own profile via profiles view" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Permitir que usuários autenticados vejam outros perfis (necessário para Dashboard)
CREATE POLICY "Authenticated users can view all profiles" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- RELOAD DO SCHEMA CACHE
-- ============================================
-- Força o PostgREST a recarregar o schema e reconhecer a nova view
NOTIFY pgrst, 'reload schema';

-- ============================================
-- TESTE DE VALIDAÇÃO
-- ============================================
-- Execute esta query para confirmar que a view está funcionando:
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Se retornar um número, a view está funcionando corretamente!
-- ============================================
