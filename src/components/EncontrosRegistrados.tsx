import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Users, Clock, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EncontrosRegistradosProps {
  onBack: () => void;
}

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  attendance_count: number;
  notes: string | null;
  created_at: string;
}

export const EncontrosRegistrados: React.FC<EncontrosRegistradosProps> = ({ onBack }) => {
  const { user } = useAuthContext();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Verificar se é o admin específico
  const isSpecificAdmin = user?.email === 'lucacampeao2013@gmail.com';

  useEffect(() => {
    const loadMeetings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Query base
        let query = supabase
          .from('meetings')
          .select('*');

        // Se não for o admin específico, filtrar apenas encontros do usuário
        if (!isSpecificAdmin) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query.order('date', { ascending: false });
          
        if (error) throw error;
        setMeetings(data || []);
      } catch (err: any) {
        console.error('Erro ao carregar encontros:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    return `${Math.floor(diffInDays / 30)} meses atrás`;
  };

  const handleDeleteMeeting = async (meetingId: string, meetingTitle: string) => {
    if (!isSpecificAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas o administrador principal pode excluir encontros.",
        variant: "destructive",
      });
      return;
    }

    setDeletingId(meetingId);

    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) {
        throw error;
      }

      // Remover da lista local
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));

      toast({
        title: "Encontro excluído",
        description: `"${meetingTitle}" foi removido com sucesso.`,
      });

    } catch (error: any) {
      console.error('Erro ao excluir encontro:', error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o encontro.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-primary border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Encontros Registrados</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-red-600">Erro ao carregar encontros: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Encontros Registrados</h1>
              {isSpecificAdmin && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Admin - Pode Excluir
                </Badge>
              )}
            </div>
            <p className="text-white/80">
              {isSpecificAdmin 
                ? "Como administrador, você pode visualizar e excluir qualquer encontro"
                : "Visualize todos os encontros que você registrou"
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : meetings && meetings.length > 0 ? (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="shadow-soft hover:shadow-strong transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                        {isSpecificAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                                disabled={deletingId === meeting.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                  Excluir Encontro
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o encontro "{meeting.title}"?
                                  <br />
                                  <strong>Esta ação não pode ser desfeita.</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMeeting(meeting.id, meeting.title)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingId === meeting.id}
                                >
                                  {deletingId === meeting.id ? 'Excluindo...' : 'Excluir'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(meeting.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(meeting.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{meeting.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{meeting.attendance_count} presentes</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {getTimeAgo(meeting.date)}
                    </Badge>
                  </div>
                </CardHeader>
                
                {(meeting.description || meeting.notes) && (
                  <CardContent className="pt-0">
                    {meeting.description && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {meeting.description}
                        </p>
                      </div>
                    )}
                    
                    {meeting.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Observações</span>
                        </div>
                        <p className="text-sm text-blue-700">{meeting.notes}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum encontro registrado
              </h3>
              <p className="text-gray-500 mb-6">
                Você ainda não registrou nenhum encontro. Comece criando seu primeiro registro!
              </p>
              <Button onClick={onBack}>
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EncontrosRegistrados;