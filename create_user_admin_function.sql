-- Função para criar usuário (alternativa mais segura)
-- Esta função pode ser chamada por admins para criar usuários

CREATE OR REPLACE FUNCTION create_user_admin(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT,
  p_role TEXT,
  p_phone TEXT DEFAULT NULL,
  p_grupo_crescimento TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se quem está chamando é admin
  SELECT role = 'admin' INTO v_is_admin
  FROM public.users
  WHERE id = auth.uid();

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Apenas administradores podem criar usuários';
  END IF;

  -- Inserir o usuário
  INSERT INTO public.users (id, email, name, role, phone, grupo_crescimento)
  VALUES (p_user_id, p_email, p_name, p_role, p_phone, p_grupo_crescimento);

  -- Retornar sucesso
  v_result := json_build_object(
    'success', true,
    'user_id', p_user_id
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Dar permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION create_user_admin TO authenticated;
