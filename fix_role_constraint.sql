-- ============================================
-- CORREÇÃO URGENTE: Constraint CHECK da coluna role
-- ============================================
-- Este script corrige o constraint da coluna 'role' para aceitar
-- os valores corretos incluindo 'co_leader'
-- ============================================

-- PASSO 1: Remover o constraint antigo
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- PASSO 2: Adicionar novo constraint com todos os valores aceitos
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'pastor', 'coordinator', 'leader', 'co_leader'));

-- ============================================
-- VERIFICAR SE ESTÁ CORRETO
-- ============================================
-- Esta query mostra o constraint atual:
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'c'
  AND conname = 'users_role_check';

-- ============================================
-- TESTE: Tentar inserir um usuário de teste
-- ============================================
-- Descomente as linhas abaixo para testar (substitua o UUID):
-- INSERT INTO public.users (id, email, name, role, is_active)
-- VALUES (
--     'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
--     'teste@example.com',
--     'Teste',
--     'co_leader',
--     true
-- )
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RELOAD DO SCHEMA CACHE
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
