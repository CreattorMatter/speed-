import React from 'react';
import { Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  templateId?: string;
}

export default function Toolbar({ onSave, onPreview, templateId = generateTemplateId() }: ToolbarProps) {
  const handleCopyId = () => {
    navigator.clipboard.writeText(templateId);
    // Podrías agregar una notificación de "Copiado al portapapeles"
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Guardar
        </button>
        <button 
          onClick={onPreview}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Previsualizar
        </button>
        <div className="flex items-center space-x-2 ml-4 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-500">ID:</span>
          <span className="font-mono text-sm text-gray-700">{templateId}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyId}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Copiar ID"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Función para generar un ID único
function generateTemplateId(): string {
  const timestamp = Date.now().toString(36); // Convertir timestamp a base 36
  const randomStr = Math.random().toString(36).substring(2, 8); // 6 caracteres aleatorios
  return `TPL-${timestamp}-${randomStr}`.toUpperCase();
}