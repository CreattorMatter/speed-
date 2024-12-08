import React, { useState, useEffect } from 'react';
import { CheckCircle, Send } from 'lucide-react';

interface SendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: { id: string; name: string; }[];
  productsCount: number;
}

export const SendingModal: React.FC<SendingModalProps> = ({
  isOpen,
  onClose,
  locations,
  productsCount
}) => {
  const [currentLocation, setCurrentLocation] = useState(0);
  const [isSending, setIsSending] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentLocation(0);
      setIsSending(true);
      
      const interval = setInterval(() => {
        setCurrentLocation(prev => {
          if (prev < locations.length - 1) return prev + 1;
          clearInterval(interval);
          setIsSending(false);
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isOpen, locations.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {isSending ? 'Enviando carteles...' : '¡Envío completado!'}
        </h3>

        <div className="space-y-4">
          {locations.map((location, index) => (
            <div 
              key={location.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300
                ${index === currentLocation && isSending ? 'bg-indigo-50 scale-105' : 
                  index < currentLocation || !isSending ? 'bg-green-50' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full 
                  ${index === currentLocation && isSending ? 'bg-indigo-100' :
                    index < currentLocation || !isSending ? 'bg-green-100' : 'bg-gray-100'}`}
                >
                  {index === currentLocation && isSending ? (
                    <Send className="w-4 h-4 text-indigo-600 animate-pulse" />
                  ) : index < currentLocation || !isSending ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Send className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <span className="font-medium text-gray-700">{location.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {productsCount} {productsCount === 1 ? 'cartel' : 'carteles'}
              </span>
            </div>
          ))}
        </div>

        {!isSending && (
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 px-4 bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}; 