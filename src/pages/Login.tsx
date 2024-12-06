import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === "admin@admin.com" && password === "admin") {
      navigate("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Credenciales inválidas",
      });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af) !important',
        backgroundSize: '200% 200%',
        position: 'relative',
        zIndex: 0
      }}
    >
      <div 
        className="absolute inset-0 z-[-1]" 
        style={{
          backgroundColor: '#1e40af',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af)',
        }}
      />
      <div className="w-full max-w-sm space-y-8 bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
        <div className="text-center">
          <div className="mb-8">
            <div className="h-16 w-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Speed+
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
          >
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login; 