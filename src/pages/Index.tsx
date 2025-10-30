import { useState } from "react";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";
import { RegistroEncontro } from "@/components/RegistroEncontro";
import { RegistroMembro } from "@/components/RegistroMembro";
import { MembrosRegistrados } from "@/components/MembrosRegistrados";
import { MeusRelatorios } from "@/components/MeusRelatorios";
import EncontrosRegistrados from "@/components/EncontrosRegistrados";
import { ConnectionTest } from "@/components/ConnectionTest";
import { TestUserInfo } from "@/components/TestUserInfo";
import { useAuthContext } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading, signOut } = useAuthContext();
  const [userType, setUserType] = useState("");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showConnectionTest, setShowConnectionTest] = useState(false);

  const handleLogin = (type: string) => {
    console.log('🎯 Index.tsx - handleLogin chamado com tipo:', type);
    setUserType(type);
    setCurrentPage("dashboard");
    console.log('✅ Index.tsx - userType setado para:', type);
  };

  const handleRoleSelect = (role: string) => {
    console.log('🎭 Index.tsx - handleRoleSelect chamado com papel:', role);
    setUserType(role);
    console.log('✅ Index.tsx - userType atualizado para:', role);
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

  // Mostrar teste de conexão se solicitado
  if (showConnectionTest) {
    return <ConnectionTest />;
  }

  // Not authenticated
  if (!user) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button 
            onClick={() => setShowConnectionTest(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm"
          >
            🔧 Teste Conexão
          </button>
        </div>
        <Login onLogin={handleLogin} />
      </div>
    );
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
    case "teste-user-info":
      return <TestUserInfo />;
    default:
      return (
        <div>
          <div className="fixed top-4 right-4 z-50">
            <button 
              onClick={() => setCurrentPage("teste-user-info")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm"
            >
              🔍 Info Usuário
            </button>
          </div>
          <Dashboard 
            userType={userType} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout}
            onRoleSelect={handleRoleSelect}
          />
        </div>
      );
  }
};

export default Index;