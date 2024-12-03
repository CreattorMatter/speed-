import React from 'react';
import { Copy, Save, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  templateId?: string;
}

export default function Toolbar({ onSave, onPreview, templateId = generateTemplateId() }: ToolbarProps) {
  const handleCopyId = () => {
    navigator.clipboard.writeText(templateId);
  };

  return (
    <div className="flex items-center justify-between h-16 px-4">
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Save className="w-4 h-4" />
          <span>Guardar</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200"
        >
          <Eye className="w-4 h-4" />
          <span>Vista previa</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200"
        >
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </motion.button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
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

function generateTemplateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TPL-${timestamp}-${randomStr}`.toUpperCase();
}