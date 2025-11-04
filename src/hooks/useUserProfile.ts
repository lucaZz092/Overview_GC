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
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        let profileData: any = data;

        if ((!profileData || error?.code === 'PGRST116')) {
          const { data: multipleData, error: multipleError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .limit(1);

          if (multipleError) {
            throw multipleError;
          }

          profileData = Array.isArray(multipleData) ? multipleData[0] : multipleData;
        }

        if (!profileData) {
          setProfile(null);
          setError('Perfil não encontrado.');
          setLoading(false);
          return;
        }

        const safeRole = normalizeRole(profileData.role) ?? 'co_leader';
        const safeProfile: UserProfile = {
          ...profileData,
          role: safeRole,
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