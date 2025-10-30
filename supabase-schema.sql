-- Criação das tabelas para o sistema de gestão de célula

-- Tabela de usuários (estende a auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'co_leader' CHECK (role IN ('admin', 'pastor', 'leader', 'co_leader')),
    is_active BOOLEAN DEFAULT true
);

-- Tabela de membros
CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    joined_date DATE NOT NULL,
    notes TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Tabela de encontros/reuniões
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    attendance_count INTEGER DEFAULT 0,
    notes TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Tabela de presença nos encontros
CREATE TABLE IF NOT EXISTS public.meeting_attendances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT false,
    notes TEXT,
    UNIQUE(meeting_id, member_id)
);

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS public.reports (
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_active ON public.members(is_active);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendances_meeting_id ON public.meeting_attendances(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendances_member_id ON public.meeting_attendances(member_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar automaticamente o campo updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetings_updated_at ON public.meetings;
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
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

DROP TRIGGER IF EXISTS update_meeting_attendance_count_trigger ON public.meeting_attendances;
CREATE TRIGGER update_meeting_attendance_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.meeting_attendances
    FOR EACH ROW EXECUTE FUNCTION update_meeting_attendance_count();

-- Limpar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can insert members" ON public.members;
DROP POLICY IF EXISTS "Users can update members they created" ON public.members;
DROP POLICY IF EXISTS "Users can delete members they created" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can update meetings they created" ON public.meetings;
DROP POLICY IF EXISTS "Users can delete meetings they created" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can view attendances" ON public.meeting_attendances;
DROP POLICY IF EXISTS "Authenticated users can manage attendances" ON public.meeting_attendances;
DROP POLICY IF EXISTS "Authenticated users can view reports" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update reports they created" ON public.reports;
DROP POLICY IF EXISTS "Users can delete reports they created" ON public.reports;

-- Políticas de RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para members (usuários autenticados podem ver todos os membros)
CREATE POLICY "Authenticated users can view members" ON public.members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert members" ON public.members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update members they created" ON public.members
    FOR UPDATE USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'leader')
    ));

CREATE POLICY "Users can delete members they created" ON public.members
    FOR DELETE USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'leader')
    ));

-- Políticas para meetings
CREATE POLICY "Authenticated users can view meetings" ON public.meetings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert meetings" ON public.meetings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update meetings they created" ON public.meetings
    FOR UPDATE USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'leader')
    ));

CREATE POLICY "Users can delete meetings they created" ON public.meetings
    FOR DELETE USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'leader')
    ));

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

CREATE POLICY "Users can update reports they created" ON public.reports
    FOR UPDATE USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'leader')
    ));

CREATE POLICY "Users can delete reports they created" ON public.reports
    FOR DELETE USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'pastor', 'leader')
    ));

-- Função para criar perfil de usuário automaticamente quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();