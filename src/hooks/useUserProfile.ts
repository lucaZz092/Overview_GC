import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pastor' | 'coordenador' | 'leader' | 'co_leader';
  grupo_crescimento?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const normalizeRole = (role?: string | null): UserProfile['role'] | undefined => {
  if (!role) return undefined;

  const normalized = role
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  switch (normalized) {
    case 'admin':
      return 'admin';
    case 'pastor':
      return 'pastor';
    case 'coordenador':
    case 'coordinator':
      return 'coordenador';
    case 'leader':
    case 'lider':
      return 'leader';
    case 'co_leader':
    case 'co_lider':
    case 'coleader':
    case 'colider':
      return 'co_leader';
    default:
      return undefined;
  }
};

type DbProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  grupo_crescimento?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export const useUserProfile = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        let profileData = (Array.isArray(data) ? data[0] : data) as DbProfileRow | undefined;

        // Se o perfil não existir, criar automaticamente na tabela 'users'
        if (!profileData) {
          console.log('Perfil não encontrado, criando automaticamente...');
          console.log('User ID:', user.id);
          console.log('User Email:', user.email);
          
          const { data: newProfile, error: insertError } = await (supabase as any)
            .from('users')
            .upsert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
              role: 'co_leader',
              is_active: true,
            }, {
              onConflict: 'id'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            console.error('Código do erro:', insertError.code);
            console.error('Detalhes:', insertError.details);
            console.error('Mensagem:', insertError.message);
            
            // Tentar buscar novamente - pode ser que o trigger tenha criado
            console.log('Tentando buscar o perfil novamente...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1 segundo
            
            const { data: retryData, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id);
            
            if (!retryError && retryData && retryData.length > 0) {
              console.log('Perfil encontrado na segunda tentativa!');
              profileData = (Array.isArray(retryData) ? retryData[0] : retryData) as DbProfileRow;
            } else {
              setProfile(null);
              setError(`Não foi possível criar o perfil. Erro: ${insertError.message}`);
              setLoading(false);
              return;
            }
          } else {
            profileData = newProfile as DbProfileRow;
          }
        }

        const safeRole = normalizeRole(profileData.role) ?? 'co_leader';
        const safeProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email ?? '',
          name: profileData.name ?? 'Usuário',
          role: safeRole,
          grupo_crescimento: profileData.grupo_crescimento ?? undefined,
          is_active: profileData.is_active ?? true,
          created_at: profileData.created_at ?? new Date().toISOString(),
          updated_at: profileData.updated_at ?? new Date().toISOString(),
        };

        setProfile(safeProfile);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const isAdmin = profile?.role === 'admin';
  const isCoordenador = profile?.role === 'coordenador' || isAdmin;
  const isPastor = profile?.role === 'pastor' || isAdmin;
  const isLeader = profile?.role === 'leader' || isPastor || isCoordenador;
  const isCoLeader = profile?.role === 'co_leader' || isLeader;

  return {
    profile,
    loading,
    error,
    isAdmin,
    isCoordenador,
    isPastor,
    isLeader,
    isCoLeader,
  };
};