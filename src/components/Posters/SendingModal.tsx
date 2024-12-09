import React, { useState, useEffect } from 'react';
import { Package, Send, Check } from 'lucide-react';

interface SendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: { id: string; name: string }[];
  productsCount: number;
}

export const SendingModal: React.FC<SendingModalProps> = ({
  isOpen,
  onClose,
  locations,
  productsCount
}) => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      const timer1 = setTimeout(() => setStep(1), 1500); // Empacando
      const timer2 = setTimeout(() => setStep(2), 3000); // Enviando
      const timer3 = setTimeout(() => {
        setStep(3);  // Completado
        setTimeout(onClose, 1000);
      }, 4500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Animación de empaque y envío */}
          <div className="relative h-24 w-24">
            {step === 0 && (
              <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                <Package className="w-12 h-12 text-indigo-600" />
              </div>
            )}
            {step === 1 && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <Package className="w-12 h-12 text-indigo-600" />
              </div>
            )}
            {step === 2 && (
              <div className="absolute inset-0 flex items-center justify-center animate-ping">
                <Send className="w-12 h-12 text-indigo-600" />
              </div>
            )}
            {step === 3 && (
              <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                <Check className="w-12 h-12 text-green-500" />
              </div>
            )}
          </div>

          {/* Texto de estado */}
          <h3 className="text-xl font-medium text-gray-900">
            {step === 0 && 'Preparando envío...'}
            {step === 1 && 'Empacando carteles...'}
            {step === 2 && 'Enviando a sucursales...'}
            {step === 3 && '¡Envío completado!'}
          </h3>

          {/* Detalles */}
          <div className="text-sm text-gray-500 text-center">
            <p>{productsCount} carteles serán enviados a:</p>
            <ul className="mt-2 space-y-1">
              {locations.map(location => (
                <li key={location.id}>{location.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 