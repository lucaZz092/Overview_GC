import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthContext();

  console.log('ProtectedRoute - user:', user, 'loading:', loading);

  if (loading) {
    console.log('ProtectedRoute - showing loading...');
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - no user, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - user authenticated, rendering children');
  return <>{children}</>;
};