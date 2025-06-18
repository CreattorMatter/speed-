import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface LocationOption {
  id: string;
  name: string;
  region: string;
}

interface SendingProgressProps {
  locations: LocationOption[];
  sentLocations: Set<string>;
  currentLocation: number;
  isComplete: boolean;
}

export const SendingProgress: React.FC<SendingProgressProps> = ({
  locations,
  sentLocations,
  currentLocation,
  isComplete
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {isComplete ? 'Envío completado' : 'Enviando carteles...'}
        </h3>
        <p className="text-gray-600">
          {isComplete 
            ? `Se enviaron carteles a ${sentLocations.size} sucursales`
            : `Enviando a ${sentLocations.size} de ${locations.length} sucursales`
          }
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(sentLocations.size / locations.length) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-500 text-center">
          {Math.round((sentLocations.size / locations.length) * 100)}% completado
        </div>
      </div>

      {/* Lista de ubicaciones */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {locations.map((location, index) => {
          const isSent = sentLocations.has(location.id);
          const isCurrent = currentLocation === index && !isComplete;

          return (
            <motion.div
              key={location.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${isSent ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}
                ${isCurrent ? 'ring-2 ring-blue-500' : ''}
              `}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex-shrink-0">
                {isSent ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-gray-900">{location.name}</div>
                <div className="text-sm text-gray-600">{location.region}</div>
              </div>

              {isSent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs text-green-600 font-medium"
                >
                  Enviado
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-green-800 font-medium">
            ¡Todos los carteles fueron enviados exitosamente!
          </div>
        </motion.div>
      )}
    </div>
  );
}; 