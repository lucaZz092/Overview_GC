-- ============================================
-- CORREÇÃO: Normalizar roles existentes ANTES de aplicar constraint
-- ============================================
-- Este script primeiro corrige os valores de 'role' existentes
-- e depois aplica o constraint correto
-- ============================================

-- PASSO 1: Ver quais valores de role existem atualmente
SELECT DISTINCT role, COUNT(*) as quantidade
FROM public.users
GROUP BY role
ORDER BY role;

-- PASSO 2: Normalizar os valores existentes
-- Atualizar todos os valores para o formato correto

-- Normalizar 'co-leader', 'colider', 'co_lider' para 'co_leader'
UPDATE public.users
SET role = 'co_leader'
WHERE role IN ('co-leader', 'colider', 'co_lider', 'co-lider', 'coleader', 'co lider');

-- Normalizar 'lider' para 'leader'
UPDATE public.users
SET role = 'leader'
WHERE role IN ('lider', 'líder', 'Leader');

-- Normalizar 'Pastor' para 'pastor'
UPDATE public.users
SET role = 'pastor'
WHERE role = 'Pastor';

-- Normalizar 'Admin' para 'admin'
UPDATE public.users
SET role = 'admin'
WHERE role = 'Admin';

-- Qualquer outro valor não reconhecido vira 'co_leader' (padrão)
UPDATE public.users
SET role = 'co_leader'
WHERE role NOT IN ('admin', 'pastor', 'leader', 'co_leader');

-- PASSO 3: Verificar se todos os valores estão corretos agora
SELECT DISTINCT role, COUNT(*) as quantidade
FROM public.users
GROUP BY role
ORDER BY role;

-- PASSO 4: Agora podemos remover e recriar o constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'pastor', 'leader', 'co_leader'));

-- ============================================
-- VERIFICAR SE ESTÁ CORRETO
-- ============================================
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'c'
  AND conname = 'users_role_check';

-- ============================================
-- RELOAD DO SCHEMA CACHE
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- RESULTADO FINAL: Ver todos os usuários
-- ============================================
SELECT id, email, name, role, is_active
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
