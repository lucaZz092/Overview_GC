import { useState } from "react";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";
import { RegistroEncontro } from "@/components/RegistroEncontro";
import { RegistroMembro } from "@/components/RegistroMembro";
import { MembrosRegistrados } from "@/components/MembrosRegistrados";
import { MeusRelatorios } from "@/components/MeusRelatorios";
import { MeusGrupos } from "@/components/MeusGrupos";
import { ProximosEncontros } from "@/components/ProximosEncontros";
import EncontrosRegistrados from "@/components/EncontrosRegistrados";
import { useAuthContext } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading, signOut } = useAuthContext();
  const [userType, setUserType] = useState("");
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = (type: string) => {
    setUserType(type);
    setCurrentPage("dashboard");
  };

  const handleRoleSelect = (role: string) => {
    setUserType(role);
  };

  const handleLogout = async () => {
    // Limpar qualquer papel de admin salvo
    window.sessionStorage.removeItem('adminRole');
    await signOut();
    setUserType("");
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage("dashboard");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  switch (currentPage) {
    case "registro-encontro":
      return <RegistroEncontro onBack={handleBack} />;
    case "registro-membro":
      return <RegistroMembro onBack={handleBack} />;
    case "membro-registrado":
      return <MembrosRegistrados onBack={handleBack} />;
    case "encontros-registrados":
      return <EncontrosRegistrados onBack={handleBack} />;
    case "meus-relatorios":
      return <MeusRelatorios onBack={handleBack} />;
    case "meus-grupos":
      return <MeusGrupos onBack={handleBack} />;
    case "proximos-encontros":
      return <ProximosEncontros onBack={handleBack} />;
    default:
      return (
        <Dashboard 
          userType={userType} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
          onRoleSelect={handleRoleSelect}
        />
      );
  }
};

export default Index;