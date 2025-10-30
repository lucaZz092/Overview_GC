-- Adicionar campo grupo_crescimento na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS grupo_crescimento TEXT;

-- Comentário sobre os valores possíveis
COMMENT ON COLUMN public.users.grupo_crescimento IS 
'Grupo de Crescimento que o usuário lidera (leader) ou co-lidera (co_leader). Valores possíveis: gc-legacy-faith, gc-legacy-awake, gc-legacy-kairos, gc-legacy-revival, gc-legacy-chosen, gc-legacy-overflow, gc-legacy-rise, gc-vila-nova, gc-centro, gc-norte, gc-sul, gc-leste, gc-oeste, gc-juventude, gc-casais';