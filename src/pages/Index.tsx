import { useState } from "react";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";
import { RegistroEncontro } from "@/components/RegistroEncontro";
import { RegistroMembro } from "@/components/RegistroMembro";
import { MembrosRegistrados } from "@/components/MembrosRegistrados"


const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("");
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = (type: string) => {
    setIsLoggedIn(true);
    setUserType(type);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType("");
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage("dashboard");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  switch (currentPage) {
    case "registro-encontro":
      return <RegistroEncontro onBack={handleBack} />;
    case "registro-membro":
      return <RegistroMembro onBack={handleBack} />;
    case "membro-registrado":
      return <MembrosRegistrados onBack={handleBack} />;
    default:
      return (
        <Dashboard 
          userType={userType} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
        />
      );
  }
};

export default Index;
