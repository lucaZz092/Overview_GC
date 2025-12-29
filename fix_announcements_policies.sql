-- Corrigir políticas RLS da tabela announcements para usar profiles ao invés de users

-- Remover policies existentes
DROP POLICY IF EXISTS "Users can view active announcements for their role" ON public.announcements;
DROP POLICY IF EXISTS "Pastors and coordinators can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Pastors and coordinators can update their announcements" ON public.announcements;
DROP POLICY IF EXISTS "Pastors and coordinators can delete announcements" ON public.announcements;

-- Policy: Todos autenticados podem ler avisos ativos destinados ao seu papel
CREATE POLICY "Users can view active announcements for their role"
  ON public.announcements
  FOR SELECT
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      -- Admin, pastor e coordenador veem tudo
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'pastor', 'coordenador')
      )
      OR
      -- Outros veem apenas avisos destinados ao seu papel
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(target_roles)
      )
    )
  );

-- Policy: Pastor, coordenador e admin podem criar avisos
CREATE POLICY "Pastors and coordinators can create announcements"
  ON public.announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Policy: Pastor, coordenador e admin podem atualizar seus próprios avisos
CREATE POLICY "Pastors and coordinators can update their announcements"
  ON public.announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Policy: Pastor, coordenador e admin podem deletar avisos
CREATE POLICY "Pastors and coordinators can delete announcements"
  ON public.announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Verificar se as políticas foram criadas corretamente
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
WHERE tablename = 'announcements'
ORDER BY policyname;
