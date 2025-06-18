import React from 'react';
import { Download, Printer, Send, Save, Eye, FileImage } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionControlsProps {
  onExport: () => void;
  onPrint: () => void;
  onSend: () => void;
  onSave: () => void;
  onPreview: () => void;
  onExportImage: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  onExport,
  onPrint,
  onSend,
  onSave,
  onPreview,
  onExportImage,
  disabled = false,
  compact = false
}) => {
  const buttonClass = `
    flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200
    ${disabled 
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
      : 'hover:scale-105 shadow-md hover:shadow-lg'
    }
  `;

  const actions = [
    {
      id: 'preview',
      icon: Eye,
      label: 'Vista Previa',
      onClick: onPreview,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    },
    {
      id: 'save',
      icon: Save,
      label: 'Guardar',
      onClick: onSave,
      className: 'bg-blue-500 text-white hover:bg-blue-600'
    },
    {
      id: 'export-image',
      icon: FileImage,
      label: 'Exportar Imagen',
      onClick: onExportImage,
      className: 'bg-green-500 text-white hover:bg-green-600'
    },
    {
      id: 'print',
      icon: Printer,
      label: 'Imprimir',
      onClick: onPrint,
      className: 'bg-purple-500 text-white hover:bg-purple-600'
    },
    {
      id: 'export',
      icon: Download,
      label: 'Exportar PDF',
      onClick: onExport,
      className: 'bg-orange-500 text-white hover:bg-orange-600'
    },
    {
      id: 'send',
      icon: Send,
      label: 'Enviar',
      onClick: onSend,
      className: 'bg-indigo-500 text-white hover:bg-indigo-600'
    }
  ];

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={disabled ? undefined : action.onClick}
            className={`${buttonClass} ${disabled ? '' : action.className} justify-center`}
            title={action.label}
          >
            <action.icon className="w-4 h-4" />
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      {actions.map((action, index) => (
        <React.Fragment key={action.id}>
          <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={disabled ? undefined : action.onClick}
            className={`${buttonClass} ${disabled ? '' : action.className}`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-sm">{action.label}</span>
          </motion.button>
          
          {index < actions.length - 1 && (
            <div className="w-px h-8 bg-gray-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}; 