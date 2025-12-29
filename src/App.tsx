import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { RegistroUser } from "@/components/RegistroUser";
import { MeusRelatorios } from "@/components/MeusRelatorios";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DiagnosticPage from "./pages/DiagnosticPage";
import { ConfirmEmail } from "./pages/ConfirmEmail";
import { ResetPassword } from "./pages/ResetPassword";
import { RelatoriosGerais } from "./pages/RelatoriosGerais";
import { RelatoriosCoordenador } from "./pages/RelatoriosCoordenador";
import { AgendaCompleta } from "./pages/AgendaCompleta";
import { GestaoGeral } from "./pages/GestaoGeral";
import { Avisos } from "./pages/Avisos";
import PainelAdmin from "./pages/PainelAdmin";
import { ControleEncontros } from "./pages/ControleEncontros";

const queryClient = new QueryClient();

function AppRoutes() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/registro" element={<RegistroUser onRegister={handleRegister} />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/meus-relatorios" element={
        <ProtectedRoute>
          <MeusRelatorios onBack={() => navigate("/")} />
        </ProtectedRoute>
      } />
      <Route path="/relatorios-gerais" element={
        <ProtectedRoute>
          <RelatoriosGerais onBack={() => navigate("/")} />
        </ProtectedRoute>
      } />
      <Route path="/relatorios-coordenador" element={
        <ProtectedRoute>
          <RelatoriosCoordenador onBack={() => navigate("/")} />
        </ProtectedRoute>
      } />
      <Route path="/agenda-completa" element={
        <ProtectedRoute>
          <AgendaCompleta onBack={() => navigate("/")} />
        </ProtectedRoute>
      } />
      <Route path="/gestao-geral" element={
        <ProtectedRoute>
          <GestaoGeral onBack={() => navigate("/")} />
        </ProtectedRoute>
      } />
      <Route path="/avisos" element={
        <ProtectedRoute>
          <Avisos onBack={() => navigate("/")} />
        </ProtectedRoute>
      } />
      <Route path="/painel-admin" element={
        <ProtectedRoute>
          <PainelAdmin />
        </ProtectedRoute>
      } />
      <Route path="/controle-encontros" element={
        <ProtectedRoute>
          <ControleEncontros onBack={() => navigate("/")} />
        </ProtectedRoute>
      } />
      <Route path="/diagnostic" element={<DiagnosticPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;