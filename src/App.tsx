import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { RegistroUser } from "@/components/RegistroUser";
import { MeusRelatorios } from "@/components/MeusRelatorios"

const queryClient = new QueryClient();

function AppRoutes() {
  const navigate = useNavigate();

  const handleRegister = (userType: string) => {
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/registro" element={<RegistroUser onRegister={handleRegister} />} />
      <Route path="/meus-relatorios" element={<MeusRelatorios onBack={() => navigate("/")} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;