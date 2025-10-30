import { RegistroUser } from "@/components/RegistroUser";

export function TestRegistro() {
  const handleRegister = (userType: string) => {
    console.log('✅ Registration completed for:', userType);
  };

  return (
    <div>
      <h1 style={{ color: 'red', fontSize: '24px', padding: '20px' }}>
        🧪 TESTE - Componente RegistroUser
      </h1>
      <RegistroUser onRegister={handleRegister} />
    </div>
  );
}