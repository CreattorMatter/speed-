import React from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';

interface ValidityPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

export const ValidityPeriodModal: React.FC<ValidityPeriodModalProps> = ({
  isOpen,
  onClose,
  errorMessage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No se puede imprimir este cartel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {errorMessage}
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700 font-medium">
                  💡 ¿Cómo solucionarlo?
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  1. Ve al builder y selecciona este cartel<br/>
                  2. Busca el componente de fecha de vigencia<br/>
                  3. Actualiza las fechas para incluir la fecha actual<br/>
                  4. Guarda los cambios y vuelve a intentar imprimir
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}; 