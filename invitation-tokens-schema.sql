-- Sistema de Links de Convite Temporários
-- Execute este script APÓS o schema principal

-- Tabela de tokens de convite
CREATE TABLE IF NOT EXISTS public.invitation_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    token TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('pastor', 'leader', 'co_leader')),
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_token ON public.invitation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_expires ON public.invitation_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_active ON public.invitation_tokens(is_active);

-- Habilitar RLS
ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para invitation_tokens
CREATE POLICY "Apenas admins podem gerenciar tokens" ON public.invitation_tokens
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Usuários podem ver tokens para validação" ON public.invitation_tokens
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Função para gerar token único
CREATE OR REPLACE FUNCTION public.generate_invitation_token(
    p_role TEXT,
    p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_token TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_token_id UUID;
BEGIN
    -- Verificar se é admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_admin_id AND role = 'admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Apenas administradores podem gerar tokens'
        );
    END IF;
    
    -- Gerar token único (combinação de timestamp + random)
    v_token := encode(
        digest(
            extract(epoch from now())::text || 
            gen_random_uuid()::text || 
            p_role, 
            'sha256'
        ), 
        'hex'
    );
    
    -- Token expira em 30 minutos
    v_expires_at := NOW() + INTERVAL '30 minutes';
    
    -- Inserir token
    INSERT INTO public.invitation_tokens (token, role, created_by, expires_at)
    VALUES (v_token, p_role, p_admin_id, v_expires_at)
    RETURNING id INTO v_token_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'token', v_token,
        'role', p_role,
        'expires_at', v_expires_at,
        'link', 'https://your-app.com/registro?token=' || v_token
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar e usar token
CREATE OR REPLACE FUNCTION public.use_invitation_token(
    p_token TEXT,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_token_record public.invitation_tokens%ROWTYPE;
BEGIN
    -- Buscar token válido
    SELECT * INTO v_token_record 
    FROM public.invitation_tokens 
    WHERE token = p_token 
    AND is_active = true 
    AND expires_at > NOW()
    AND used_by IS NULL;
    
    -- Verificar se token existe e é válido
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Token inválido, expirado ou já utilizado'
        );
    END IF;
    
    -- Atualizar usuário com novo papel
    UPDATE public.users 
    SET role = v_token_record.role,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Marcar token como usado
    UPDATE public.invitation_tokens 
    SET used_by = p_user_id,
        used_at = NOW(),
        is_active = false,
        updated_at = NOW()
    WHERE id = v_token_record.id;
    
    RETURN jsonb_build_object(
        'success', true,
        'role', v_token_record.role
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar tokens expirados (execute periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.invitation_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente (se não existir)
DROP TRIGGER IF EXISTS update_invitation_tokens_updated_at ON public.invitation_tokens;
CREATE TRIGGER update_invitation_tokens_updated_at 
    BEFORE UPDATE ON public.invitation_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();