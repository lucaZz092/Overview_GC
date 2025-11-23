-- Script para desabilitar confirmação de email no Supabase
-- Execute este script no SQL Editor do Supabase

-- OPÇÃO 1: Confirmar todos os emails existentes que ainda não foram confirmados
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- OPÇÃO 2: Configurar para não exigir confirmação de email
-- IMPORTANTE: Isso precisa ser feito nas configurações do Supabase Dashboard
-- Vá em: Authentication > Settings > Email Auth
-- E desabilite "Enable email confirmations"

-- Para novos usuários criados via SQL, sempre defina email_confirmed_at = NOW()
-- Exemplo:
/*
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,  -- <-- IMPORTANTE: Sempre defina como NOW()
  created_at,
  updated_at,
  ...
)
VALUES (
  gen_random_uuid(),
  'usuario@email.com',
  crypt('senha', gen_salt('bf')),
  NOW(),  -- <-- Confirma email automaticamente
  NOW(),
  NOW(),
  ...
);
*/

-- Verificar usuários sem confirmação
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
