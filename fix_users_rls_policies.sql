-- Políticas RLS para a tabela users

-- Remover políticas existentes (se houver conflitos)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;

-- Policy: Permitir que usuários vejam seu próprio perfil
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Permitir que admins vejam todos os usuários
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Permitir inserção durante o signup (CRÍTICO)
CREATE POLICY "Enable insert for authenticated users during signup"
  ON public.users
  FOR INSERT
  WITH CHECK (
    -- Permitir se o usuário está inserindo seu próprio registro (signup)
    auth.uid() = id
    OR
    -- Permitir se um admin está criando o usuário
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Permitir que admins atualizem qualquer usuário
CREATE POLICY "Admins can update all users"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Permitir que admins deletem usuários
CREATE POLICY "Admins can delete users"
  ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
