-- Solução alternativa: Recriar políticas RLS com permissões mais amplas

-- Desabilitar RLS temporariamente
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- Remover todas as policies existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'announcements') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.announcements';
    END LOOP;
END $$;

-- Reabilitar RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy 1: Todos podem ler avisos ativos (simplificada)
CREATE POLICY "allow_read_active_announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Policy 2: Admin, pastor e coordenador podem inserir
CREATE POLICY "allow_insert_announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Policy 3: Admin, pastor e coordenador podem atualizar
CREATE POLICY "allow_update_announcements"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor', 'coordenador')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Policy 4: Admin, pastor e coordenador podem deletar
CREATE POLICY "allow_delete_announcements"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'announcements'
ORDER BY policyname;

-- Testar permissão do usuário atual
SELECT 
  auth.uid() as user_id,
  p.role,
  CASE 
    WHEN p.role IN ('admin', 'pastor', 'coordenador') THEN 'PODE criar avisos'
    ELSE 'NÃO PODE criar avisos'
  END as status
FROM public.profiles p
WHERE p.id = auth.uid();
