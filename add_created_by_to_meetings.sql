-- Adicionar coluna para armazenar o nome de quem registrou o encontro
-- A coluna user_id já existe e referencia auth.users, mas vamos adicionar o nome também para facilitar

-- Verificar se a coluna created_by_name já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'meetings' 
        AND column_name = 'created_by_name'
    ) THEN
        -- Adicionar coluna para o nome de quem criou
        ALTER TABLE public.meetings 
        ADD COLUMN created_by_name TEXT;
        
        -- Atualizar registros existentes com o nome do perfil correspondente
        UPDATE public.meetings m
        SET created_by_name = p.name
        FROM public.profiles p
        WHERE m.user_id = p.id
        AND m.created_by_name IS NULL;
        
        RAISE NOTICE 'Coluna created_by_name adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna created_by_name já existe.';
    END IF;
END $$;

-- Criar índice para melhorar performance nas consultas por criador
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);

-- Verificar o resultado
SELECT 
    'Estrutura da tabela meetings:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'meetings'
AND column_name IN ('user_id', 'created_by_name')
ORDER BY column_name;
