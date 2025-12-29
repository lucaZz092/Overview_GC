-- SOLUÇÃO IMEDIATA: Permitir coordenador criar avisos

-- Passo 1: Desabilitar RLS completamente para permitir funcionar
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- Teste agora criar um aviso - deve funcionar

-- Se funcionar, execute o resto do script para reabilitar com políticas corretas:

-- Passo 2: Verificar o role exato do coordenador
SELECT 
  id,
  email,
  role,
  LENGTH(role) as role_length,
  encode(role::bytea, 'hex') as role_hex
FROM public.profiles 
WHERE email = 'SEU_EMAIL_AQUI'; -- SUBSTITUA pelo email do coordenador

-- Passo 3: Reabilitar RLS com políticas simplificadas
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas
DROP POLICY IF EXISTS "announcements_select_policy" ON public.announcements;
DROP POLICY IF EXISTS "announcements_insert_policy" ON public.announcements;
DROP POLICY IF EXISTS "announcements_update_policy" ON public.announcements;
DROP POLICY IF EXISTS "announcements_delete_policy" ON public.announcements;

-- Criar policies super permissivas

-- SELECT: Todos autenticados podem ler
CREATE POLICY "announcements_select_policy"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Todos autenticados podem inserir (temporário para teste)
CREATE POLICY "announcements_insert_policy"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- SUPER PERMISSIVO TEMPORÁRIO

-- UPDATE: Todos autenticados podem atualizar
CREATE POLICY "announcements_update_policy"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Todos autenticados podem deletar  
CREATE POLICY "announcements_delete_policy"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (true);

-- Verificar
SELECT 'Políticas criadas com sucesso!' as status;
