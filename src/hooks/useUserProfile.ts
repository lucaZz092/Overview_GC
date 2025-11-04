import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pastor' | 'leader' | 'co_leader';
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

  const profileData = (Array.isArray(data) ? data[0] : data) as DbProfileRow | undefined;

        if (!profileData) {
          setProfile(null);
          setError('Perfil não encontrado.');
          setLoading(false);
          return;
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
  const isPastor = profile?.role === 'pastor' || isAdmin;
  const isLeader = profile?.role === 'leader' || isPastor;
  const isCoLeader = profile?.role === 'co_leader' || isLeader;

  return {
    profile,
    loading,
    error,
    isAdmin,
    isPastor,
    isLeader,
    isCoLeader,
  };
};