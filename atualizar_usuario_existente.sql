-- Script para atualizar usuário existente no banco de dados
-- Use este script quando o email já existe no sistema

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'vinicius.bsilva5@gmail.com'; -- ALTERE O EMAIL AQUI

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com este email não encontrado';
  END IF;

  -- Atualizar senha na tabela de autenticação
  UPDATE auth.users
  SET 
    encrypted_password = crypt('Legacy#123', gen_salt('bf')), -- ALTERE A SENHA AQUI
    updated_at = NOW(),
    email_confirmed_at = NOW(), -- Confirmar email
    raw_user_meta_data = '{"name":"Vinicius Silva"}' -- ALTERE O NOME AQUI
  WHERE id = v_user_id;

  -- Atualizar ou criar registro na tabela users
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
    'vinicius.bsilva5@gmail.com', -- MESMO EMAIL DE CIMA
    'Vinicius Silva', -- MESMO NOME DE CIMA
    'coordinator', -- CARGO: 'admin', 'pastor', 'coordinator', 'leader', 'co_leader'
    '', -- TELEFONE (OPCIONAL)
    '' -- NOME DO GC (OBRIGATÓRIO PARA LEADER/CO_LEADER)
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    grupo_crescimento = EXCLUDED.grupo_crescimento,
    updated_at = NOW();

  RAISE NOTICE 'Usuário atualizado com sucesso! ID: %', v_user_id;
END $$;

-- Verificar o usuário
SELECT u.id, u.email, u.name, u.role, u.phone, u.grupo_crescimento
FROM public.users u
WHERE u.email = 'vinicius.bsilva5@gmail.com';
