// =====================================
// BRANCH VIEW - POSTER CARD COMPONENT
// =====================================

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Printer, CheckCircle, Circle } from 'lucide-react';
import { AssignedPoster } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PosterCardProps {
  poster: AssignedPoster;
  onPreview: (poster: AssignedPoster) => void;
  onDownload: (poster: AssignedPoster) => void;
  onMarkAsPrinted: (poster: AssignedPoster) => void;
}

const statusConfig = {
  pending: {
    icon: <Circle className="w-4 h-4 text-gray-400" />,
    label: 'Pendiente',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
  viewed: {
    icon: <Eye className="w-4 h-4 text-blue-500" />,
    label: 'Visto',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  printed: {
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
    label: 'Impreso',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
};

export const PosterCard: React.FC<PosterCardProps> = ({
  poster,
  onPreview,
  onDownload,
  onMarkAsPrinted,
}) => {
  const currentStatus = statusConfig[poster.status];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all duration-300 group"
    >
      <div className="relative">
        <img 
          src={poster.thumbnailUrl} 
          alt={`Miniatura de ${poster.name}`}
          className="w-full h-48 object-cover"
        />
        <div 
          className="absolute top-0 right-0 m-2 px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            backdropFilter: 'blur(4px)',
          }}
        >
          {poster.campaign}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-blue-600 transition-colors">
          {poster.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>
            Asignado el {format(new Date(poster.assignedAt), "d 'de' MMMM, yyyy", { locale: es })}
          </span>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${currentStatus.bgColor} ${currentStatus.color}`}>
            {currentStatus.icon}
            <span className="font-medium">{currentStatus.label}</span>
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
          <span>Tamaño: <strong>{poster.size}</strong></span>
          <span>Orientación: <strong>{poster.orientation}</strong></span>
          <span>Páginas: <strong>{poster.pages}</strong></span>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => onPreview(poster)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
          </button>
          <button
            onClick={() => onDownload(poster)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar</span>
          </button>
        </div>
        
        {poster.status !== 'printed' && (
          <button
            onClick={() => onMarkAsPrinted(poster)}
            className="w-full mt-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Marcar como Impreso</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}; 