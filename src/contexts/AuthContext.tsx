import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🏗️ AuthProvider: Renderizando...');
  
  try {
    const auth = useAuth();
    console.log('✅ AuthProvider: useAuth retornou:', { 
      hasUser: !!auth.user, 
      loading: auth.loading 
    });

    return (
      <AuthContext.Provider value={auth}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error('❌ AuthProvider: Erro ao inicializar:', error);
    throw new Error(`AuthProvider falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Hook para verificar se o usuário está autenticado
export const useRequireAuth = () => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return { user: null, loading: true, isAuthenticated: false };
  }
  
  return {
    user,
    loading: false,
    isAuthenticated: !!user
  };
};