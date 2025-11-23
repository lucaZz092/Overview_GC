-- Políticas RLS para a tabela users

-- Remover políticas existentes (se houver conflitos)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Allow update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow delete for service role only" ON public.users;

-- Policy: Permitir que todos vejam todos os usuários (simplificado para evitar recursão)
CREATE POLICY "Allow select for authenticated users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Permitir inserção para usuários autenticados (signup e admin)
CREATE POLICY "Allow insert for authenticated users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Allow update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Permitir DELETE apenas via funções SECURITY DEFINER
-- (A função create_user_admin pode deletar se necessário)
CREATE POLICY "Allow delete for service role only"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (false); -- Não permite DELETE direto, apenas via funções

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
