-- ============================================
-- SCRIPT COMPLETO: RESETAR E RECRIAR TODO O BANCO DE DADOS
-- ============================================
-- ⚠️ ATENÇÃO: Este script vai APAGAR TODOS OS DADOS existentes!
-- Execute apenas se tiver certeza de que pode perder os dados atuais.
-- ============================================

-- ============================================
-- PARTE 1: LIMPAR TUDO (CUIDADO!)
-- ============================================

-- Desabilitar triggers temporariamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
DROP TRIGGER IF EXISTS update_meetings_updated_at ON public.meetings;
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
DROP TRIGGER IF EXISTS update_meeting_attendance_count_trigger ON public.meeting_attendances;

-- Remover funções
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_meeting_attendance_count() CASCADE;

-- Remover tabelas (em ordem reversa devido às foreign keys)
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.meeting_attendances CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Remover VIEW profiles se existir
DROP VIEW IF EXISTS public.profiles CASCADE;

-- ============================================
-- PARTE 2: CRIAR TABELAS
-- ============================================

-- Tabela de usuários (estende auth.users do Supabase)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'co_leader' CHECK (role IN ('admin', 'pastor', 'leader', 'co_leader')),
    grupo_crescimento TEXT,
    is_active BOOLEAN DEFAULT true
);

-- VIEW 'profiles' para compatibilidade com o código
CREATE OR REPLACE VIEW public.profiles AS 
SELECT * FROM public.users;

-- Tabela de membros
CREATE TABLE public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    grupo_crescimento TEXT,
    is_active BOOLEAN DEFAULT true,
    joined_date DATE NOT NULL,
    notes TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Tabela de encontros/reuniões
CREATE TABLE public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location TEXT,
    grupo_crescimento TEXT,
    attendance_count INTEGER DEFAULT 0,
    notes TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Tabela de presença nos encontros
CREATE TABLE public.meeting_attendances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT false,
    notes TEXT,
    UNIQUE(meeting_id, member_id)
);

-- Tabela de relatórios
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('monthly', 'weekly', 'annual', 'custom')),
    period_start DATE,
    period_end DATE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- ============================================
-- PARTE 3: CRIAR ÍNDICES
-- ============================================

CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_active ON public.members(is_active);
CREATE INDEX idx_members_gc ON public.members(grupo_crescimento);
CREATE INDEX idx_meetings_date ON public.meetings(date DESC);
CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_gc ON public.meetings(grupo_crescimento);
CREATE INDEX idx_meeting_attendances_meeting_id ON public.meeting_attendances(meeting_id);
CREATE INDEX idx_meeting_attendances_member_id ON public.meeting_attendances(member_id);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_type ON public.reports(type);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_users_gc ON public.users(grupo_crescimento);

-- ============================================
-- PARTE 4: CRIAR FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar contador de presença automaticamente
CREATE OR REPLACE FUNCTION update_meeting_attendance_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.meetings 
    SET attendance_count = (
        SELECT COUNT(*) 
        FROM public.meeting_attendances 
        WHERE meeting_id = COALESCE(NEW.meeting_id, OLD.meeting_id) 
        AND attended = true
    )
    WHERE id = COALESCE(NEW.meeting_id, OLD.meeting_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meeting_attendance_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.meeting_attendances
    FOR EACH ROW EXECUTE FUNCTION update_meeting_attendance_count();

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, is_active)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'co_leader',
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PARTE 5: HABILITAR RLS E CRIAR POLÍTICAS
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Políticas para users/profiles
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all profiles" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para members
CREATE POLICY "Authenticated users can view members" ON public.members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert members" ON public.members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update members" ON public.members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete members" ON public.members
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para meetings
CREATE POLICY "Authenticated users can view meetings" ON public.meetings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert meetings" ON public.meetings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update meetings" ON public.meetings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete meetings" ON public.meetings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para meeting_attendances
CREATE POLICY "Authenticated users can view attendances" ON public.meeting_attendances
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage attendances" ON public.meeting_attendances
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para reports
CREATE POLICY "Authenticated users can view reports" ON public.reports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert reports" ON public.reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update reports" ON public.reports
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete reports" ON public.reports
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- PARTE 6: PROMOVER ADMIN
-- ============================================

-- Promover seu usuário para admin (ajuste o email se necessário)
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'lucacampeao2013@gmail.com';

-- ============================================
-- PARTE 7: RELOAD DO SCHEMA CACHE
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- PARTE 8: VERIFICAÇÃO FINAL
-- ============================================

-- Ver todas as tabelas criadas
SELECT 
    schemaname, 
    tablename, 
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Ver todas as views criadas
SELECT 
    schemaname, 
    viewname, 
    viewowner
FROM pg_views 
WHERE schemaname = 'public';

-- Ver todos os triggers criados
SELECT 
    trigger_name, 
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Ver o constraint de role
SELECT 
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname = 'users_role_check';

-- Ver usuários existentes
SELECT id, email, name, role, grupo_crescimento, is_active
FROM public.users
ORDER BY created_at DESC;

-- ============================================
-- ✅ PRONTO! BANCO DE DADOS RECRIADO COM SUCESSO!
-- ============================================
