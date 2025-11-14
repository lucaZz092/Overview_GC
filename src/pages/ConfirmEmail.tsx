import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirmando seu email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!tokenHash || type !== 'signup') {
          setStatus('error');
          setMessage('Link de confirmação inválido ou expirado.');
          return;
        }

        // Verificar o token com Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'signup'
        });

        if (error) {
          console.error('Erro ao confirmar email:', error);
          setStatus('error');
          setMessage('Não foi possível confirmar seu email. O link pode ter expirado.');
          return;
        }

        setStatus('success');
        setMessage('Email confirmado com sucesso!');

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);

      } catch (error: any) {
        console.error('Erro ao processar confirmação:', error);
        setStatus('error');
        setMessage('Ocorreu um erro ao processar a confirmação.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirmando Email'}
            {status === 'success' && 'Email Confirmado!'}
            {status === 'error' && 'Erro na Confirmação'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'success' && (
            <p className="text-sm text-muted-foreground mb-4">
              Redirecionando para a página de login...
            </p>
          )}
          {status === 'error' && (
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-primary"
            >
              Ir para Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
