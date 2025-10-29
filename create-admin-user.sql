-- Script para criar usuário administrador
-- Execute este script APÓS executar o schema principal e APÓS criar uma conta com o email admin@gcoverview.com no Supabase

-- Este script atualiza o usuário admin para ter role de 'admin'
-- Substitua 'admin@gcoverview.com' pelo seu email se necessário

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@gcoverview.com';

-- Caso o usuário ainda não exista na tabela public.users, 
-- você pode inserir manualmente (substitua o UUID pelo ID real do Supabase Auth):
-- INSERT INTO public.users (id, email, name, role, is_active)
-- VALUES ('seu-uuid-do-supabase-auth', 'admin@gcoverview.com', 'Administrador', 'admin', true);

-- Verificar se o usuário foi criado corretamente
SELECT id, email, name, role, is_active, created_at 
FROM public.users 
WHERE email = 'admin@gcoverview.com';