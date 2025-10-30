-- Sistema de Códigos de Convite para Gestão de Papéis
-- Execute este script APÓS o schema principal

-- Tabela de códigos de convite
CREATE TABLE IF NOT EXISTS public.invitation_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    code TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('pastor', 'leader', 'co_leader')),
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON public.invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_role ON public.invitation_codes(role);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_active ON public.invitation_codes(is_active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_invitation_codes_updated_at 
    BEFORE UPDATE ON public.invitation_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- Políticas para invitation_codes
CREATE POLICY "Admins e Pastores podem gerenciar códigos" ON public.invitation_codes
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('admin', 'pastor')
    ));

CREATE POLICY "Usuários podem ver códigos para verificação" ON public.invitation_codes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Função para validar e usar código de convite
CREATE OR REPLACE FUNCTION public.use_invitation_code(
    p_code TEXT,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_code_record public.invitation_codes%ROWTYPE;
    v_result JSONB;
BEGIN
    -- Buscar código válido
    SELECT * INTO v_code_record 
    FROM public.invitation_codes 
    WHERE code = p_code 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses);
    
    -- Verificar se código existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Código inválido, expirado ou esgotado'
        );
    END IF;
    
    -- Verificar se usuário já usou este código
    IF v_code_record.used_by = p_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Você já usou este código'
        );
    END IF;
    
    -- Atualizar usuário com novo papel
    UPDATE public.users 
    SET role = v_code_record.role,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Marcar código como usado
    UPDATE public.invitation_codes 
    SET used_by = p_user_id,
        used_at = NOW(),
        current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE id = v_code_record.id;
    
    -- Se atingiu limite de usos, desativar
    IF v_code_record.current_uses + 1 >= COALESCE(v_code_record.max_uses, 1) THEN
        UPDATE public.invitation_codes 
        SET is_active = false 
        WHERE id = v_code_record.id;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'role', v_code_record.role,
        'description', v_code_record.description
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir códigos de exemplo (REMOVA EM PRODUÇÃO)
INSERT INTO public.invitation_codes (code, role, description, max_uses, expires_at) VALUES
('PASTOR2024', 'pastor', 'Código para Pastores da Igreja', 5, NOW() + INTERVAL '1 year'),
('LIDER-NORTE', 'leader', 'Líderes da Região Norte', 10, NOW() + INTERVAL '6 months'),
('LIDER-SUL', 'leader', 'Líderes da Região Sul', 10, NOW() + INTERVAL '6 months'),
('COLIDER-GC1', 'co_leader', 'Co-líderes do GC Centro', 20, NOW() + INTERVAL '3 months'),
('COLIDER-GC2', 'co_leader', 'Co-líderes do GC Vila', 20, NOW() + INTERVAL '3 months');

-- Verificar códigos criados
SELECT code, role, description, max_uses, current_uses, expires_at, is_active 
FROM public.invitation_codes 
ORDER BY role, code;