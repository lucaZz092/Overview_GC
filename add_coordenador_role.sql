-- ============================================
-- ADICIONAR ROLE: COORDENADOR
-- ============================================
-- Este script adiciona o papel de 'coordenador' na hierarquia
-- Coordenador tem os mesmos acessos que Pastor
-- Hierarquia: Admin > Pastor/Coordenador > Leader > Co_Leader
-- ============================================

-- PASSO 1: Atualizar o constraint CHECK da tabela users
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'pastor', 'coordenador', 'leader', 'co_leader'));

-- PASSO 2: Verificar se o constraint foi atualizado corretamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'c'
  AND conname = 'users_role_check';

-- PASSO 3: Reload do schema cache
NOTIFY pgrst, 'reload schema';

-- PASSO 4: Verificar usuários existentes
SELECT id, email, name, role, grupo_crescimento, is_active
FROM public.users
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'pastor' THEN 2
        WHEN 'coordenador' THEN 3
        WHEN 'leader' THEN 4
        WHEN 'co_leader' THEN 5
    END,
    name;

-- ============================================
-- EXEMPLO: Promover um usuário para coordenador
-- ============================================
-- Descomente e ajuste o email conforme necessário:
-- UPDATE public.users 
-- SET role = 'coordenador' 
-- WHERE email = 'email@exemplo.com';

-- ============================================
-- ✅ PRONTO! Role 'coordenador' adicionado com sucesso!
-- ============================================
