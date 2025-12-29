-- Script de diagnóstico para verificar políticas e permissões de announcements

-- 1. Verificar se a tabela profiles existe e sua estrutura
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_exists;

-- 2. Verificar estrutura da tabela profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 3. Verificar o usuário atual e seu role
SELECT 
  auth.uid() as current_user_id,
  p.id,
  p.name,
  p.email,
  p.role,
  p.grupo_crescimento
FROM public.profiles p
WHERE p.id = auth.uid();

-- 4. Verificar políticas RLS da tabela announcements
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'announcements'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'announcements';

-- 6. Testar se o usuário atual tem permissão de INSERT
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'pastor', 'coordenador')
    ) THEN 'SIM - Usuário tem permissão'
    ELSE 'NÃO - Usuário NÃO tem permissão'
  END as tem_permissao_insert;
