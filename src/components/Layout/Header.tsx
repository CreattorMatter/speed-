import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = true,
  onBack 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#1e3a8a] via-[#3730a3] to-[#6d28d9] text-white">
      <div className="mx-auto">
        <div className="flex items-center h-16">
          {/* Botón Volver */}
          <div className="flex-none pl-4">
            {showBack && (
              <button
                onClick={handleBack}
                className="flex items-center text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="ml-2 text-sm font-medium">Volver al inicio</span>
              </button>
            )}
          </div>

          {/* Logo central */}
          <div className="flex-1 flex justify-center">
            <div className="text-2xl font-bold tracking-tight">
              Speed
              <span className="font-light text-white/90 tracking-tighter">+</span>
            </div>
          </div>

          {/* Botón de configuración */}
          <div className="flex-none pr-4">
            <button
              onClick={() => {/* Manejar configuración */}}
              className="flex items-center gap-2 text-white/90 hover:text-white"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Configuración</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}; 