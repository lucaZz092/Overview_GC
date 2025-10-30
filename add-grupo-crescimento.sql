-- Adicionar campo grupo_crescimento na tabela members
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS grupo_crescimento TEXT;

-- Verificar e criar políticas RLS para a tabela members
-- Política para leitura (todos os usuários autenticados podem ler)
CREATE POLICY IF NOT EXISTS "members_select_policy" ON public.members
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção (todos os usuários autenticados podem inserir)
CREATE POLICY IF NOT EXISTS "members_insert_policy" ON public.members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (todos os usuários autenticados podem atualizar)
CREATE POLICY IF NOT EXISTS "members_update_policy" ON public.members
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para deleção (todos os usuários autenticados podem deletar)
CREATE POLICY IF NOT EXISTS "members_delete_policy" ON public.members
    FOR DELETE USING (auth.role() = 'authenticated');

-- Habilitar RLS na tabela members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;