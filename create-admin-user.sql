-- Script para criar usuário administrador
-- Execute este script APÓS executar o schema principal e APÓS criar uma conta com o email admin@gcoverview.com no Supabase

-- Este script atualiza o usuário admin para ter role de 'admin'
-- Configurando lucacampeao2013@gmail.com como administrador

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'lucacampeao2013@gmail.com';

-- Para verificar se funcionou:
-- SELECT id, email, role FROM public.users WHERE email = 'lucacampeao2013@gmail.com';

-- Exemplo para criar outros usuários com diferentes papéis:
-- UPDATE public.users SET role = 'pastor' WHERE email = 'pastor@igreja.com';
-- UPDATE public.users SET role = 'leader' WHERE email = 'lider@igreja.com';
-- UPDATE public.users SET role = 'co_leader' WHERE email = 'colider@igreja.com';

-- Caso o usuário ainda não exista na tabela public.users, 
-- você pode inserir manualmente (substitua o UUID pelo ID real do Supabase Auth):
-- INSERT INTO public.users (id, email, name, role, is_active)
-- VALUES ('seu-uuid-do-supabase-auth', 'admin@gcoverview.com', 'Administrador', 'admin', true);

-- Verificar se o usuário foi criado corretamente
SELECT id, email, name, role, is_active, created_at 
FROM public.users 
WHERE email = 'admin@gcoverview.com';