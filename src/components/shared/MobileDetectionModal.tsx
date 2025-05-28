import React from 'react';
import { Camera } from 'lucide-react';

interface MobileDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: () => void;
  onContinue: () => void;
}

export function MobileDetectionModal({ isOpen, onClose, onCapture, onContinue }: MobileDetectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 xs:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-xs xs:max-w-sm w-full">
        <div className="p-4 xs:p-6">
          <h2 className="text-lg xs:text-xl font-semibold text-gray-900 mb-3 xs:mb-4 text-center">
            Detectamos que estás en un dispositivo móvil
          </h2>
          
          <div className="space-y-3 xs:space-y-4">
            <button
              onClick={onCapture}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 xs:py-3.5 rounded-lg hover:bg-blue-700 transition-colors text-sm xs:text-base font-medium"
            >
              <Camera className="w-4 h-4 xs:w-5 xs:h-5" />
              Capturar Carteles
            </button>

            <button
              onClick={onContinue}
              className="w-full bg-gray-100 text-gray-700 px-4 py-3 xs:py-3.5 rounded-lg hover:bg-gray-200 transition-colors text-sm xs:text-base font-medium"
            >
              Continuar con el Sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 