-- ============================================
-- CORREÇÃO: Políticas RLS para permitir criação de perfil
-- ============================================
-- Este script adiciona políticas para permitir que usuários
-- criem e atualizem seus próprios perfis na tabela 'users'
-- ============================================

-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.users;

-- POLÍTICA 1: Permitir que usuários criem seu próprio perfil
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- POLÍTICA 2: Permitir que usuários vejam todos os perfis (necessário para Dashboard)
CREATE POLICY "Authenticated users can view all profiles" ON public.users
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- POLÍTICA 3: Permitir que usuários atualizem seu próprio perfil
-- (Esta política já deve existir, mas vamos garantir)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id);

-- ============================================
-- VERIFICAR SE O TRIGGER handle_new_user EXISTE
-- ============================================
-- Este trigger deveria criar o perfil automaticamente
-- quando um usuário se registra via auth.users

-- Recriar a função se necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, is_active)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'co_leader',
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RELOAD DO SCHEMA CACHE
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- TESTE DE VALIDAÇÃO
-- ============================================
-- Verifique se as políticas foram criadas:
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- Verifique se o trigger existe:
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
