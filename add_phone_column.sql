-- Adicionar coluna phone na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Criar índice para melhor performance (opcional)
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;
