-- ============================================
-- DIAGNÓSTICO: Ver o constraint atual
-- ============================================

-- Ver qual é o constraint atual de 'role'
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'c'
  AND conname LIKE '%role%';

-- Ver TODOS os constraints da tabela users
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- Ver os valores distintos de role que existem
SELECT DISTINCT role, COUNT(*) as quantidade
FROM public.users
GROUP BY role
ORDER BY role;

-- ============================================
