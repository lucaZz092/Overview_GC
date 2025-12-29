-- Solução definitiva: Políticas RLS super simplificadas para announcements

-- 1. Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as policies existentes de forma forçada
DROP POLICY IF EXISTS "Users can view active announcements for their role" ON public.announcements;
DROP POLICY IF EXISTS "Pastors and coordinators can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Pastors and coordinators can update their announcements" ON public.announcements;
DROP POLICY IF EXISTS "Pastors and coordinators can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "allow_read_active_announcements" ON public.announcements;
DROP POLICY IF EXISTS "allow_insert_announcements" ON public.announcements;
DROP POLICY IF EXISTS "allow_update_announcements" ON public.announcements;
DROP POLICY IF EXISTS "allow_delete_announcements" ON public.announcements;

-- 3. Verificar e garantir que a coluna created_by permite NULL
ALTER TABLE public.announcements ALTER COLUMN created_by DROP NOT NULL;

-- 4. Reabilitar RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 5. Criar policies SUPER SIMPLES

-- SELECT: Qualquer usuário autenticado pode ler avisos ativos
CREATE POLICY "announcements_select_policy"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Admin, pastor e coordenador podem inserir
CREATE POLICY "announcements_insert_policy"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- UPDATE: Admin, pastor e coordenador podem atualizar
CREATE POLICY "announcements_update_policy"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('admin', 'pastor', 'coordenador')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- DELETE: Admin, pastor e coordenador podem deletar
CREATE POLICY "announcements_delete_policy"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- 6. Verificar o resultado
SELECT 
  'Políticas criadas:' as status,
  COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'announcements';

-- 7. Listar todas as políticas
SELECT 
  policyname,
  cmd,
  roles::text[]
FROM pg_policies 
WHERE tablename = 'announcements'
ORDER BY cmd, policyname;

-- 8. Verificar permissão do usuário atual
SELECT 
  auth.uid() as meu_user_id,
  p.id as profile_id,
  p.name,
  p.role,
  CASE 
    WHEN p.role IN ('admin', 'pastor', 'coordenador') THEN '✅ PODE criar avisos'
    ELSE '❌ NÃO PODE criar avisos'
  END as permissao
FROM public.profiles p
WHERE p.id = auth.uid();
