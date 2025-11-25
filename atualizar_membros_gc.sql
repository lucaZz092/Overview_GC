-- Script para atualizar membros existentes com o grupo_crescimento
-- Este script associa membros ao GC do usuário que os cadastrou

-- Atualizar membros usando o grupo_crescimento do usuário que os cadastrou
UPDATE members m
SET grupo_crescimento = u.grupo_crescimento
FROM users u
WHERE m.user_id = u.id
  AND m.grupo_crescimento IS NULL;

-- Verificar membros atualizados
SELECT 
  m.id,
  m.name,
  m.grupo_crescimento,
  m.is_active,
  u.name as cadastrado_por
FROM members m
LEFT JOIN users u ON m.user_id = u.id
ORDER BY m.created_at DESC;

-- Verificar se há membros sem grupo_crescimento
SELECT COUNT(*) as membros_sem_gc
FROM members
WHERE grupo_crescimento IS NULL;
