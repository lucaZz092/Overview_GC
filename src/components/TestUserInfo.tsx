import { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestUserInfo() {
  const { user } = useAuthContext();
  const { profile, loading } = useUserProfile();
  
  if (!user) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Teste - Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Usuário não logado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Teste - Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Carregando perfil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Teste - Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Nome:</strong> {profile?.name || 'Não informado'}</p>
          <p><strong>Role:</strong> {profile?.role || 'Não informado'}</p>
          <p><strong>Grupo Crescimento:</strong> {profile?.grupo_crescimento || '❌ NÃO DEFINIDO'}</p>
          <p><strong>Ativo:</strong> {profile?.is_active ? 'Sim' : 'Não'}</p>
          
          {!profile?.grupo_crescimento && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 font-medium">
                ⚠️ Este usuário precisa ter um grupo_crescimento definido para cadastrar membros!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}