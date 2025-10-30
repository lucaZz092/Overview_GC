-- Script para criar usuários de teste para cada hierarquia
-- IMPORTANTE: Execute este script apenas em ambiente de desenvolvimento/teste

-- Nota: Estes UUIDs são fictícios e precisam corresponder aos usuários criados no Supabase Auth
-- Você deve criar estes usuários primeiro no painel do Supabase Auth ou via API

-- Limpar usuários de teste existentes (opcional)
DELETE FROM public.users WHERE email LIKE '%@teste.com';

-- Inserir usuários de teste
INSERT INTO public.users (id, email, name, role, grupo_crescimento, created_at) VALUES
-- Admin
('11111111-1111-1111-1111-111111111111', 'admin@teste.com', 'Admin Teste', 'admin', NULL, NOW()),

-- Pastor
('22222222-2222-2222-2222-222222222222', 'pastor@teste.com', 'Pastor Teste', 'pastor', NULL, NOW()),

-- Líderes com diferentes GCs
('33333333-3333-3333-3333-333333333333', 'lider1@teste.com', 'Líder GC1', 'leader', 'gc_1', NOW()),
('44444444-4444-4444-4444-444444444444', 'lider2@teste.com', 'Líder GC5', 'leader', 'gc_5', NOW()),
('55555555-5555-5555-5555-555555555555', 'lider3@teste.com', 'Líder GC10', 'leader', 'gc_10', NOW()),

-- Co-líderes com diferentes GCs
('66666666-6666-6666-6666-666666666666', 'colider1@teste.com', 'Co-líder GC1', 'co_leader', 'gc_1', NOW()),
('77777777-7777-7777-7777-777777777777', 'colider2@teste.com', 'Co-líder GC3', 'co_leader', 'gc_3', NOW()),
('88888888-8888-8888-8888-888888888888', 'colider3@teste.com', 'Co-líder GC7', 'co_leader', 'gc_7', NOW()),
('99999999-9999-9999-9999-999999999999', 'colider4@teste.com', 'Co-líder GC12', 'co_leader', 'gc_12', NOW());

-- Verificar se os usuários foram inseridos
SELECT 
    email,
    name,
    role,
    grupo_crescimento,
    created_at
FROM public.users 
WHERE email LIKE '%@teste.com'
ORDER BY role, email;