-- Script para criar usuário manualmente no banco de dados
-- Execute este script no SQL Editor do Supabase

-- PASSO 1: Adicionar coluna phone se não existir
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

-- PASSO 2: Criar o usuário no auth.users (tabela de autenticação do Supabase)
-- IMPORTANTE: Altere os valores abaixo conforme necessário

DO $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Gerar ID único para o usuário
  v_user_id := gen_random_uuid();
  
  -- ALTERE ESTES VALORES:
  -- Email do usuário
  -- Senha do usuário (será criptografada automaticamente)
  -- Nome completo
  -- Cargo: 'admin', 'pastor', 'coordinator', 'leader', 'co_leader'
  -- Telefone (opcional)
  -- GC (obrigatório para leader e co_leader)
  
  -- Criar usuário na tabela de autenticação
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'novo.usuario@email.com', -- ALTERE O EMAIL AQUI
    crypt('SenhaForte123!', gen_salt('bf')), -- ALTERE A SENHA AQUI
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Nome do Usuário"}', -- ALTERE O NOME AQUI
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

  -- Criar registro na tabela users
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    phone,
    grupo_crescimento
  )
  VALUES (
    v_user_id,
    'novo.usuario@email.com', -- MESMO EMAIL DE CIMA
    'Nome do Usuário', -- MESMO NOME DE CIMA
    'leader', -- ALTERE O CARGO: 'admin', 'pastor', 'coordinator', 'leader', 'co_leader'
    '(11) 98765-4321', -- TELEFONE (OPCIONAL)
    'GC Nome' -- NOME DO GC (OBRIGATÓRIO PARA LEADER/CO_LEADER)
  );

  RAISE NOTICE 'Usuário criado com sucesso! ID: %', v_user_id;
END $$;

-- PASSO 3: Verificar se o usuário foi criado
SELECT u.id, u.email, u.name, u.role, u.phone, u.grupo_crescimento
FROM public.users u
ORDER BY u.created_at DESC
LIMIT 5;
